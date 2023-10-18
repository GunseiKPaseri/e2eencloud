import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { Action } from 'redux';
import { io } from 'socket.io-client';

const socket = io(location.href, {
  path: '/api/socket.io/',
  transports: ['polling'],
});

socket.on('connection', () => {
  console.log('connect');
});

socket.on('connect_error', (err) => {
  console.error(`connect_error due to ${err.message}`);
});

type OnListenSocket<
  State,
  ExtraThunkArg,
  BasicAction extends Action<unknown>,
> = Record<
  string,
  (
    args: unknown[],
    dispatch: ThunkDispatch<State, ExtraThunkArg, BasicAction>,
  ) => Promise<void> | void
>;

export const socketIOListener = <
  State,
  ExtraThunkArg,
  BasicAction extends Action<unknown>,
>(
  dispatch: ThunkDispatch<State, ExtraThunkArg, BasicAction>,
  on: OnListenSocket<State, ExtraThunkArg, BasicAction>,
) => {
  socket.onAny(async (eventName, ...args) => {
    if (typeof eventName === 'string' && on[eventName])
      await on[eventName](args, dispatch);
    dispatch({
      payload: args,
      type: `SOCKET.IO/${eventName}`,
    } as unknown as BasicAction);
  });
};

export default socket;
