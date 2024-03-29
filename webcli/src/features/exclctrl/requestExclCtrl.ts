import type { AppDispatch } from "~/store/store";
import { requestedExclCtrl } from "./exclctrlSlice";
import socket from "~/class/socketio";

export const requestExclCtrl = (dispatch: AppDispatch) => {
  socket.emit('REQUEST_EXCLCTRL')
  dispatch(requestedExclCtrl);
}
