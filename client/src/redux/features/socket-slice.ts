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

export const socketSlice = createSlice({
  name: "socket-slice",
  initialState,
  reducers: {},
});

// Action creators are generated for each case reducer function
export const {} = socketSlice.actions;

export default socketSlice.reducer;
