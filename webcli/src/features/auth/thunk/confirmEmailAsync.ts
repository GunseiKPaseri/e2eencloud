import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession, appLocation } from '../../componentutils';
import { setProgress, deleteProgress, progress } from '../../progress/progressSlice';

import type { AuthState } from '../authSlice';

// メールアドレス確認処理
export const confirmEmailAsync = createAsyncThunk<
{ success: boolean },
{ email: string, token: string }
>(
  'auth/confirm_email',
  async (usertoken, { dispatch }) => {
    const sendData = {
      email: usertoken.email,
      emailConfirmationToken: usertoken.token,
    };
    const result = await axiosWithSession.post<
    { success: boolean },
    AxiosResponse<{ success: boolean }>,
    { email: string, emailConfirmationToken: string }>(
      `${appLocation}/api/email_confirm`,
      sendData,
      {
        onUploadProgress: (progressEvent: { loaded: number, total: number }) => {
          dispatch(setProgress(progress(0, 1, progressEvent.loaded / progressEvent.total)));
        },
      },
    );
    if (!result.data.success) {
      throw new Error('email confirm failed');
    }
    dispatch(deleteProgress());
    return { success: true };
  },
);

export const afterConfirmEmailAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<{ success: boolean }>> = (state) => {
  state.confirmstate = 1;
};
