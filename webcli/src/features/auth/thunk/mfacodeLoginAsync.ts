import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession } from '../../../lib/axios';
import { APP_LOCATION } from '../../../const';

import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';
import { enqueueSnackbar } from '../../snackbar/snackbarSlice';

import type { AuthState } from '../authSlice';
import { loginSuccess, type APILoginSuccessResopnse } from './loginSuccessAsync';

// ログイン処理
export const mfacodeLoginAsync = createAsyncThunk<
boolean, { mfacode: string }>(
  'auth/mfaCODELogin',
  async (info, { dispatch }) => {
    type APITOTPLoginResponse = APILoginSuccessResopnse | { success: false };

    // login
    let result: AxiosResponse<APITOTPLoginResponse>;
    try {
      result = await axiosWithSession.post<
      { mfacode: string },
      AxiosResponse<APITOTPLoginResponse>
      >(
        `${APP_LOCATION}/api/mfacode`,
        { mfacode: info.mfacode },
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

export const afterMFACodeLoginAsyncPending = (state: AuthState) => {
  state.loginStatus = { step: 'CODE', state: 'pending' };
};

export const afterMFACodeLoginAsyncRejected = (state: AuthState) => {
  state.loginStatus = { step: 'CODE', state: 'error' };
};

export const afterMFACodeLoginAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<boolean>> = (state, action) => {
  state.loginStatus = action ? { step: 'EmailAndPass', state: null } : { step: 'CODE', state: 'error' };
};
