import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { axiosWithSession } from '../../lib/axios';
import { APP_LOCATION } from '../../const';
import { logoutAsync } from '../auth/authSlice';

export interface SessionsState {
  sessions: SessionInfo[],
  loading: boolean
}

export interface SessionInfo {
  id: string,
  clientName: string,
  accessed: string,
  isMe: boolean
}

const initialState: SessionsState = {
  sessions: [],
  loading: false,
};

export const getSessionsAsync = createAsyncThunk<SessionInfo[]>(
  'session/getSessions',
  async () => {
    const rowfiles = await axiosWithSession.get<Record<string, never>, AxiosResponse<SessionInfo[]>>(`${APP_LOCATION}/api/my/sessions`);

    return rowfiles.data;
  },
);

export const changeClientNameAsync = createAsyncThunk<void, { id:string, newClientName: string }>(
  'session/changeClientName',
  async (params) => {
    await axiosWithSession.patch<{ clientName: string }>(`${APP_LOCATION}/api/my/sessions`, { clientName: params.newClientName });
  },
);

export const deleteSessionAsync = createAsyncThunk<void, { id: string }>(
  'session/changeClientName',
  async (params) => {
    await axiosWithSession.delete<{ clientName: string }>(`${APP_LOCATION}/api/my/sessions/${params.id}`);
  },
);

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
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
});

export default sessionSlice.reducer;
