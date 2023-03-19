import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession, appLocation } from '../../componentutils';
import {
  argon2encrypt,
  getAESCTRKey,
} from '../../../utils/crypto';
import { byteArray2base64, base642ByteArray } from '../../../utils/uint8';
import { setDerivedEncryptionKey } from '../../../app/encrypt';

import { AES_AUTH_KEY_LENGTH } from '../../../const';

import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';
import { enqueueSnackbar } from '../../snackbar/snackbarSlice';

import type { AuthState } from '../authSlice';
import { type APILoginSuccessResopnse, loginSuccess } from './loginSuccess';

type LoginNextState = AuthState['loginStatus']['step'];

// ログイン処理
export const loginAsync = createAsyncThunk<
LoginNextState, { email: string, password: string }>(
  'auth/login',
  async (userinfo, { dispatch }) => {
    const step = 4;
    dispatch(setProgress(progress(0, step)));
    let getSalt: AxiosResponse<{ salt: string }>;
    try {
      getSalt = await axiosWithSession.post<
      { email: string },
      AxiosResponse<{ salt: string }>
      >(
        `${appLocation}/api/salt`,
        { email: userinfo.email },
        {
          onUploadProgress: (progressEvent) => {
            dispatch(setProgress(progress(0, 1, progressEvent)));
          },
        },
      );
    } catch (e) {
      dispatch(deleteProgress());
      dispatch(enqueueSnackbar({ message: 'サーバに接続できませんでした', options: { variant: 'error' } }));
      throw e;
    }

    const salt = base642ByteArray(getSalt.data.salt);

    const DerivedKey: Uint8Array = await argon2encrypt(userinfo.password, salt);
    dispatch(setProgress(progress(1, step)));

    setDerivedEncryptionKey(await getAESCTRKey(DerivedKey.slice(0, AES_AUTH_KEY_LENGTH)));
    const DerivedAuthenticationKey = DerivedKey.slice(AES_AUTH_KEY_LENGTH, AES_AUTH_KEY_LENGTH * 2);

    const authenticationKeyBase64 = byteArray2base64(DerivedAuthenticationKey);

    type APILoginResponse = APILoginSuccessResopnse | { success: false, suggestedSolution: ('TOTP' | 'FIDO2' | 'EMAIL')[] };

    // login
    let result: AxiosResponse<APILoginResponse>;
    try {
      result = await axiosWithSession.post<
      { email: string, authenticationKey: string, token: string },
      AxiosResponse<APILoginResponse>
      >(
        `${appLocation}/api/login`,
        { email: userinfo.email, authenticationKeyBase64 },
        {
          onUploadProgress: (progressEvent) => {
            dispatch(setProgress(progress(0, 1, progressEvent)));
          },
        },
      );
      // console.log(result.data);
    } catch (e) {
      dispatch(deleteProgress());
      dispatch(enqueueSnackbar({ message: 'ログインに失敗しました', options: { variant: 'error' } }));
      throw e;
    }

    if (result.data.success) {
      await dispatch(loginSuccess(result.data));
      return 'EmailAndPass';
    }
    if (result.data.suggestedSolution.includes('FIDO2')) {
      type Res = Omit<PublicKeyCredentialRequestOptions, 'allowCredentials' | 'challenge'> & { allowCredentials?: (Omit<NonNullable<PublicKeyCredentialRequestOptions['allowCredentials']>[number], 'id'> & { id: string })[], challenge: string };
      const resp = await axiosWithSession.post<Res>(`${appLocation}/api/fido2/assertion/options`);
      const option = {
        ...resp.data,
        allowCredentials: resp.data.allowCredentials
          ? resp.data.allowCredentials.map((x) => ({ ...x, id: base642ByteArray(x.id).buffer }))
          : undefined,
        challenge: base642ByteArray(resp.data.challenge).buffer,
      };
      const credential = await navigator.credentials.get({ publicKey: option });
      if (credential !== null) {
        const rawId = (credential as { rawId?: unknown })?.rawId;
        const response = (credential as { response?: unknown })?.response;
        if (typeof response !== 'object') throw new Error('responce is not object');

        const authenticatorData = (
          (response as { authenticatorData?: unknown })?.authenticatorData
        );
        const clientDataJSON = (response as { clientDataJSON?: unknown })?.clientDataJSON;
        const signature = (response as { signature?: unknown })?.signature;
        const userHandle = (response as { userHandle?: unknown })?.userHandle;

        const credentialJSON = {
          id: credential.id,
          type: credential.type,
          rawId: (
            rawId instanceof ArrayBuffer ? byteArray2base64(new Uint8Array(rawId)) : undefined
          ),
          response: {
            authenticatorData: (
              authenticatorData instanceof ArrayBuffer
                ? byteArray2base64(new Uint8Array(authenticatorData))
                : undefined
            ),
            clientDataJSON: (
              clientDataJSON instanceof ArrayBuffer
                ? byteArray2base64(new Uint8Array(clientDataJSON))
                : undefined
            ),
            signature: (
              signature instanceof ArrayBuffer
                ? byteArray2base64(new Uint8Array(signature))
                : undefined
            ),
            userHandle: (
              userHandle instanceof ArrayBuffer
                ? byteArray2base64(new Uint8Array(userHandle))
                : undefined
            ),
          },
        };

        const result2 = await axiosWithSession.post<PublicKeyCredentialRequestOptions, AxiosResponse<APILoginSuccessResopnse>>(`${appLocation}/api/fido2/assertion/result`, credentialJSON);
        if (result2.data.success) {
          await dispatch(loginSuccess(result2.data));
          return 'EmailAndPass';
        }
      }
    }
    return 'TOTP';
  },
);

export const afterLoginAsyncPending = (state: AuthState) => {
  state.loginStatus = { step: 'EmailAndPass', state: 'pending' };
};

export const afterLoginAsyncRejected = (state: AuthState) => {
  state.loginStatus = { step: 'EmailAndPass', state: 'error' };
  state.user = null;
};

export const afterLoginAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<LoginNextState>> = (state, action) => {
  state.loginStatus = { step: action.payload, state: null };
};
