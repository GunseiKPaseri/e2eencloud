import type { Dispatch } from "redux";
import { io } from "socket.io-client";

const socket = io(location.href, {
  path: '/api/socket.io/',
  transports: ['polling'],
})

socket.on('connection', ()=>{
  console.log('connect');
})

socket.on("connect_error", (err) => {
  console.error(`connect_error due to ${err.message}`);
});

export const socketIOListener = (dispatch: Dispatch) => {
  socket.onAny((eventName, ...args) => {
    console.log(eventName, args);
    dispatch({type: `SOCKET.IO/${eventName}`, payload: args})
  })
}

export default socket;
