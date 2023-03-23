import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosWithSession } from '../../../lib/axios';
import { appLocation } from '../../../const';
import type { AuthState } from '../authSlice';

// TOTP削除処理
export const deleteTOTPAsync = createAsyncThunk<void, void>(
  'auth/delete_totp',
  async () => {
    await axiosWithSession.delete(`${appLocation}/api/my/totp`);
  },
);

export const afterDeleteTOTPAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<void>> = (state) => {
  if (state.user) {
    state.user.useMultiFactorAuth = false;
  }
};
