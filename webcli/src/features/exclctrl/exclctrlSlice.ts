import { createAction, createSlice } from '@reduxjs/toolkit';
import socket from '~/class/socketio';

export interface ExclCtrlState {
  usable: boolean;
  pending: boolean;
}

const initialState: ExclCtrlState = {
  pending: false,
  usable: false,
};

export const requestedExclCtrl = createAction('exclctrl/request');

export const decideExclCtrl = createAction<[{ leader: string }]>(
  'SOCKET.IO/DECIDED_EXCLCTRL',
);

export const exclctrlSlice = createSlice({
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
  initialState,
  name: 'exclctrl',
  reducers: {},
});

export default exclctrlSlice.reducer;
