import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PlayerOptions,PlayerChoices, players } from "../../util/types";


export interface MenuState {
  host: boolean;
  local: boolean;
  sessionId: string;
  player: PlayerChoices;
  inSession: boolean;
  mobileCode: PlayerOptions<string>;
  isMobile: boolean;
  deviceSelected: PlayerOptions<string>;
}

const initialState: MenuState = {
  host: false,
  local: false,
  isMobile: false,
  sessionId: "",
  player: players.one,
  inSession: false,
  mobileCode: { player1: "", player2: "" },
  deviceSelected: { player1: "", player2: "" },
};
interface SessionInfo {
  sessionId: string;
  mobileCodes: PlayerOptions<string>;
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
      state.player = players.two;
      state.sessionId = sessionId.substring(0, 4);
      state.inSession = true;
      state.mobileCode = mobileCodes;
    },
    leaveSession(state) {
      state.host = false;
      state.local = false;
      state.isMobile = false;
      state.sessionId = "";
      state.player = players.one;
      state.inSession = false;
      state.mobileCode = { player1: "", player2: "" };
      state.deviceSelected = { player1: "", player2: "" };
    },

    setLocal(state) {
      state.local = !state.local;
    },
    isController(state, action: PayloadAction<PlayerChoices>) {
      state.isMobile = true;
      state.player = action.payload;
    },
    updateSelectedDevice(
      state,
      action: PayloadAction<{
        player: PlayerChoices;
        device: "keyboard" | "mobile";
      }>
    ) {
      state.deviceSelected[`${action.payload.player}`] = action.payload.device;
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
