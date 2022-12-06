import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Socket, io } from "socket.io-client";

export interface SocketState {
  socket: Socket;
}

const socketServer = import.meta.env.DEV
  ? "http://localhost:8000/"
  : "https://synth-pong-socket.onrender.com/";
const initialState: SocketState = {
  socket: io(socketServer),
};

const sessionJSON = sessionStorage.getItem("session");
if (sessionJSON !== null) {
  const session = JSON.parse(sessionJSON);
  const role = sessionStorage.getItem(session.sessionId);
  console.log(role);
  
  if (role) {
    initialState.socket.emit("RE_JOIN", session.sessionId, role);
  }
}

export const socketSlice = createSlice({
  name: "socket-slice",
  initialState,
  reducers: {},
});

// Action creators are generated for each case reducer function
export const {} = socketSlice.actions;

export default socketSlice.reducer;
