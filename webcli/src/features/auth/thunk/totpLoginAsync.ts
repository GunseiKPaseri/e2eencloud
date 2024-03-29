import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession } from '~/lib/axios';

import type { AuthState } from '~/features/auth/authSlice';
import { enqueueSnackbar } from '~/features/snackbar/snackbarSlice';
import { setProgress, deleteProgress, progress } from '~/features/progress/progressSlice';

import { loginSuccess, type APILoginSuccessResopnse } from './loginSuccessAsync';

// ログイン処理
export const totpLoginAsync = createAsyncThunk<
boolean, { token: string }>(
  'auth/mfaTOTPLogin',
  async (info, { dispatch }) => {
    type APITOTPLoginResponse = APILoginSuccessResopnse | { success: false };

    // login
    let result: AxiosResponse<APITOTPLoginResponse>;
    try {
      result = await axiosWithSession.post<
      { token: string },
      AxiosResponse<APITOTPLoginResponse>
      >(
        '/api/totplogin',
        { token: info.token },
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
      return false;
    }
    return true;
  },
);

export const afterTOTPLoginAsyncPending = (state: AuthState) => {
  state.loginStatus = { step: 'TOTP', state: 'pending' };
};

export const afterTOTPLoginAsyncRejected = (state: AuthState) => {
  state.loginStatus = { step: 'TOTP', state: 'error' };
};

export const afterTOTPLoginAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<boolean>> = (state, action) => {
  state.loginStatus = action ? { step: 'EmailAndPass', state: null } : { step: 'TOTP', state: 'error' };
};
