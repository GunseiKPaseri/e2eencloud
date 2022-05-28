import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosWithSession, appLocation } from '../../componentutils';
import type { AuthState } from '../authSlice';

// ログアウト処理
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async () => {
    // logout
    await axiosWithSession.post(`${appLocation}/api/logout`);
  },
);

export const afterLogoutAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<void>> = (state) => {
  state.user = null;
};