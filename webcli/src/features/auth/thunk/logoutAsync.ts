import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosWithSession } from '~/lib/axios';
import type { AuthState } from '~/features/auth/authSlice';

// ログアウト処理
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async () => {
    // logout
    await axiosWithSession.post('/api/logout');
  },
);

export const afterLogoutAsyncFullfilled:
CaseReducer<AuthState, PayloadAction<void>> = (state) => {
  state.user = null;
};
