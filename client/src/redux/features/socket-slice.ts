import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Socket, io } from "socket.io-client";

export interface SocketState {
  socket: Socket;

}

const initialState: SocketState = {
  socket: io("http://localhost:8000/"),

};

export const socketSlice = createSlice({
  name: "socket-slice",
  initialState,
  reducers: {},
});

// Action creators are generated for each case reducer function
export const {} = socketSlice.actions;

export default socketSlice.reducer;
