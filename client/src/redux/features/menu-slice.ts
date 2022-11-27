import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { stat } from "fs";

export interface MobileCodes {
  player1: string;
  player2: string;
}
export interface MenuState {
  host: boolean;
  local: boolean;
  sessionId: string;
  player: "player1" | "player2";
  inSession: boolean;
  mobileCode: MobileCodes;
  isMobile: boolean;
  deviceSelected: MobileCodes;
}

const initialState: MenuState = {
  host: false,
  local: false,
  isMobile: false,
  sessionId: "",
  player: "player1",
  inSession: false,
  mobileCode: { player1: "", player2: "" },
  deviceSelected: { player1: "", player2: "" },
};
interface SessionInfo {
  sessionId: string;
  mobileCodes: MobileCodes;
}
export const menuSlice = createSlice({
  name: "menu-slice",
  initialState,
  reducers: {
    createSession(
      state,
      { payload: { sessionId, mobileCodes } }: PayloadAction<SessionInfo>
    ) {
      state.host = true;
      state.inSession = true;
      state.sessionId = sessionId;
      state.mobileCode = mobileCodes;
    },

    joinSession(
      state,
      { payload: { sessionId, mobileCodes } }: PayloadAction<SessionInfo>
    ) {
      state.player = "player2";
      state.sessionId = sessionId.substring(0, 4);
      state.inSession = true;
      state.mobileCode = mobileCodes;
    },
    leaveSession(state) {
      state.sessionId = "";
      state.inSession = false;
      state.host = false;
      state.player = "player1";
    },

    setLocal(state) {
      state.local = !state.local;
    },
    isController(state, action: PayloadAction<"player1" | "player2">) {
      state.isMobile = true;
      state.player = action.payload;
    },
    updateSelectedDevice(
      state,
      action: PayloadAction<{ player: "player1" | "player2"; device: "keyboard" | "mobile" }>
    ) {
      state.deviceSelected[`${action.payload.player}`] =
        action.payload.device;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  createSession,
  joinSession,
  leaveSession,
  setLocal,
  isController,
  updateSelectedDevice,
} = menuSlice.actions;

export default menuSlice.reducer;
