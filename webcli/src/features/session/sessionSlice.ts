import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { logoutAsync } from '~/features/auth/authSlice';
import type { SessionInfo } from './api';
import { deleteSessions, changeClientName, getSessions } from './api';

export interface SessionsState {
  sessions: SessionInfo[];
  loading: boolean;
}

const initialState: SessionsState = {
  loading: false,
  sessions: [],
};

export const getSessionsAsync = createAsyncThunk<SessionInfo[]>(
  'session/getSessions',
  async () => {
    return await getSessions();
  },
);

export const changeClientNameAsync = createAsyncThunk<
  void,
  { id: string; newClientName: string }
>('session/changeClientName', async (params) => {
  await changeClientName(params);
});

export const deleteSessionAsync = createAsyncThunk<void, { id: string }>(
  'session/changeClientName',
  async (params) => {
    await deleteSessions(params);
  },
);

export const sessionSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addCase(getSessionsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSessionsAsync.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSessionsAsync.fulfilled, (state, action) => {
        state.sessions = action.payload;
        state.loading = false;
      })
      .addCase(changeClientNameAsync.fulfilled, (state, action) => {
        const target = state.sessions.find((x) => x.id === action.meta.arg.id);
        if (target) target.clientName = action.meta.arg.newClientName;
      })
      .addCase(logoutAsync.pending, (state) => {
        // ログアウト時削除
        // initialState
        state.sessions = [];
        state.loading = false;
      });
  },
  initialState,
  name: 'session',
  reducers: {},
});

export default sessionSlice.reducer;
