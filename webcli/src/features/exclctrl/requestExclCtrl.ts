import socket from '~/class/socketio';
import type { AppDispatch } from '~/store/store';
import { requestedExclCtrl } from './exclctrlSlice';

export const requestExclCtrl = (dispatch: AppDispatch) => {
  socket.emit('REQUEST_EXCLCTRL');
  dispatch(requestedExclCtrl);
};
