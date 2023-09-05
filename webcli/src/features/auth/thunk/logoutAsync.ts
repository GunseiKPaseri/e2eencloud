import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosWithSession } from '~/lib/axios';
import socket from '~/class/socketio';
import type { AuthState } from '~/features/auth/authSlice';

// ログアウト処理
export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  // logout
  await axiosWithSession.post('/api/logout');
  // leave user room
  socket.emit('LOGGED_OUT');
});

export const afterLogoutAsyncFullfilled: CaseReducer<
  AuthState,
  PayloadAction<void>
> = (state) => {
  state.user = null;
};
