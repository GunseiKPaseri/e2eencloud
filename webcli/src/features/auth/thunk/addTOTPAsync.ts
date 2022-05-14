import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosWithSession, appLocation } from '../../componentutils';
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';

import type { AuthState } from '../authSlice';
// TOTP追加処理
export const addTOTPAsync = createAsyncThunk<void, { secretKey: string, token: string }>(
  'auth/add_totp',
  async (secretkey, { dispatch }) => {
    await axiosWithSession.put<{ secretKey: string, token: string }>(
      `${appLocation}/api/user/totp`,
      secretkey,
      {
        onUploadProgress: (progressEvent: { loaded: number, total: number }) => {
          dispatch(setProgress(progress(0, 1, progressEvent.loaded / progressEvent.total)));
        },
      },
    );
    dispatch(deleteProgress());
  },
);

export const afterAddTOTPAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<void>> = (state) => {
  if (state.user) {
    state.user.useTwoFactorAuth = true;
  }
};
