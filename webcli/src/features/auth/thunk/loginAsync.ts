import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { AES_AUTH_KEY_LENGTH } from '~/const/const';
import { axiosWithSession } from '~/lib/axios';
import { setDerivedEncryptionKey } from '~/class/encrypt';
import type { AuthState, MFASolution } from '~/features/auth/authSlice';
import {
  setProgress,
  deleteProgress,
  progress,
} from '~/features/progress/progressSlice';
import { enqueueSnackbar } from '~/features/snackbar/snackbarSlice';
import { argon2encrypt, getAESCTRKey } from '~/utils/crypto';
import { byteArray2base64, base642ByteArray } from '~/utils/uint8';
import { fido2LoginAsync } from './fido2LoginAsync';
import {
  type APILoginSuccessResopnse,
  loginSuccess,
} from './loginSuccessAsync';

type LoginNextState = AuthState['loginStatus']['step'];
type LoginPayload = {
  next: LoginNextState | null;
  suggestedMfa: MFASolution[];
};
// ログイン処理
export const loginAsync = createAsyncThunk<
  LoginPayload,
  { email: string; password: string }
>('auth/login', async (userinfo, { dispatch }): Promise<LoginPayload> => {
  const step = 4;
  dispatch(setProgress(progress(0, step)));
  let getSalt: AxiosResponse<{ salt: string }>;
  try {
    getSalt = await axiosWithSession.post<
      { email: string },
      AxiosResponse<{ salt: string }>
    >(
      '/api/salt',
      { email: userinfo.email },
      {
        onUploadProgress: (progressEvent) => {
          dispatch(setProgress(progress(0, 1, progressEvent)));
        },
      },
    );
  } catch (e) {
    dispatch(deleteProgress());
    dispatch(
      enqueueSnackbar({
        message: 'サーバに接続できませんでした',
        options: { variant: 'error' },
      }),
    );
    throw e;
  }

  const salt = base642ByteArray(getSalt.data.salt);

  const DerivedKey: Uint8Array = await argon2encrypt(userinfo.password, salt);
  dispatch(setProgress(progress(1, step)));

  setDerivedEncryptionKey(
    await getAESCTRKey(DerivedKey.slice(0, AES_AUTH_KEY_LENGTH)),
  );
  const DerivedAuthenticationKey = DerivedKey.slice(
    AES_AUTH_KEY_LENGTH,
    AES_AUTH_KEY_LENGTH * 2,
  );

  const authenticationKeyBase64 = byteArray2base64(DerivedAuthenticationKey);

  type APILoginResponse =
    | APILoginSuccessResopnse
    | { success: false; suggestedSolution: MFASolution[] };

  // login
  let result: AxiosResponse<APILoginResponse>;
  try {
    result = await axiosWithSession.post<
      { email: string; authenticationKey: string; token: string },
      AxiosResponse<APILoginResponse>
    >(
      '/api/login',
      { authenticationKeyBase64, email: userinfo.email },
      {
        onUploadProgress: (progressEvent) => {
          dispatch(setProgress(progress(0, 1, progressEvent)));
        },
      },
    );
    // console.log(result.data);
  } catch (e) {
    dispatch(deleteProgress());
    dispatch(
      enqueueSnackbar({
        message: 'ログインに失敗しました',
        options: { variant: 'error' },
      }),
    );
    throw e;
  }

  if (result.data.success) {
    await dispatch(loginSuccess(result.data));
    return { next: 'EmailAndPass', suggestedMfa: [] };
  }
  if (result.data.suggestedSolution.includes('FIDO2')) {
    // FIDO2がある場合はそれを優先
    try {
      await dispatch(fido2LoginAsync({ auto: true }));
      return { next: null, suggestedMfa: result.data.suggestedSolution };
    } catch {
      return {
        next: result.data.suggestedSolution[0] ?? 'EmailAndPass',
        suggestedMfa: result.data.suggestedSolution,
      };
    }
  }
  return {
    next: result.data.suggestedSolution[0] ?? 'EmailAndPass',
    suggestedMfa: result.data.suggestedSolution,
  };
});

export const afterLoginAsyncPending = (state: AuthState) => {
  state.loginStatus = { state: 'pending', step: 'EmailAndPass' };
};

export const afterLoginAsyncRejected = (state: AuthState) => {
  state.loginStatus = { state: 'error', step: 'EmailAndPass' };
  state.user = null;
};

export const afterLoginAsyncFullfilled: CaseReducer<
  AuthState,
  PayloadAction<LoginPayload>
> = (state, action) => {
  if (action.payload !== null) {
    state.suggestedMfa = action.payload.suggestedMfa;
    if (action.payload.next !== null) {
      state.loginStatus = { state: null, step: action.payload.next };
    }
  }
};
