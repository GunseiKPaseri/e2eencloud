import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosWithSession, appLocation } from '../../componentutils';
import type { AuthState } from '../authSlice';

// TOTP削除処理
export const deleteTOTPAsync = createAsyncThunk<void, void>(
  'auth/delete_totp',
  async () => {
    await axiosWithSession.delete(`${appLocation}/api/user/totp`);
  },
);

export const afterDeleteTOTPAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<void>> = (state) => {
  if (state.user) {
    state.user.useTwoFactorAuth = false;
  }
};
