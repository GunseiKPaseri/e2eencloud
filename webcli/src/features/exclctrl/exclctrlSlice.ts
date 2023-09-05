import { createAction, createSlice } from '@reduxjs/toolkit';
import socket from '~/class/socketio';

export interface ExclCtrlState {
  usable: boolean;
  pending: boolean;
}

const initialState: ExclCtrlState = {
  usable: false,
  pending: false,
};

export const requestedExclCtrl = createAction('exclctrl/request');

export const decideExclCtrl = createAction<[{ leader: string }]>(
  'SOCKET.IO/DECIDED_EXCLCTRL',
);

export const exclctrlSlice = createSlice({
  name: 'exclctrl',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestedExclCtrl, (state) => {
        state.pending = true;
      })
      .addCase(decideExclCtrl, (state, action) => {
        state.usable = action.payload[0].leader === socket.id;
        state.pending = false;
      });
  },
});

export default exclctrlSlice.reducer;
