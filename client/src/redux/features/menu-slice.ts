import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PlayerOptions, PlayerChoices, players } from "../../util/types";

export interface MenuState {
  host: boolean;
  local: boolean;
  sessionId: string;
  player: PlayerChoices;
  inSession: boolean;
  mobileCode: PlayerOptions<string>;
  isMobile: boolean;
  mobileConnected: PlayerOptions<boolean>;
  readyStatus: PlayerOptions<boolean>;
}
const sessionJSON = sessionStorage.getItem("session");
const initialState: MenuState =
  sessionJSON !== null
    ? JSON.parse(sessionJSON)
    : {
        host: false,
        local: false,
        isMobile: false,
        sessionId: "",
        player: players.one,
        inSession: false,
        mobileCode: { player1: "", player2: "" },
        mobileConnected: { player1: false, player2: false },
        readyStatus: { player1: false, player2: false },
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
      sessionStorage.setItem(sessionId, "host");
      sessionStorage.setItem("session", JSON.stringify(state));
    },

    joinSession(
      state,
      { payload: { sessionId, mobileCodes } }: PayloadAction<SessionInfo>
    ) {
      state.player = players.two;
      state.sessionId = sessionId.substring(0, 4);
      state.inSession = true;
      state.mobileCode = mobileCodes;
      sessionStorage.setItem(sessionId, "guest");
      sessionStorage.setItem("session", JSON.stringify(state));
    },
    leaveSession(state) {
      state.host = false;
      state.local = false;
      state.isMobile = false;
      state.sessionId = "";
      state.player = players.one;
      state.inSession = false;
      state.mobileCode = { player1: "", player2: "" };
      state.mobileConnected = { player1: false, player2: false };
      state.readyStatus = { player1: false, player2: false };
      sessionStorage.clear();
    },

    setLocal(state) {
      state.local = !state.local;
      state.readyStatus = { player1: false, player2: false };

      sessionStorage.setItem("session", JSON.stringify(state));
    },
    isController(state, action: PayloadAction<PlayerChoices>) {
      state.isMobile = true;
      state.player = action.payload;
      sessionStorage.setItem(state.sessionId, state.player);
      sessionStorage.setItem("session", JSON.stringify(state));
    },
    updateMobileConnection(
      state,
      action: PayloadAction<{
        player: PlayerChoices;
        mobileConnected: boolean;
      }>
    ) {
      state.mobileConnected[`${action.payload.player}`] =
        action.payload.mobileConnected;
      sessionStorage.setItem("session", JSON.stringify(state));
    },
    toggleReady(state, action: PayloadAction<PlayerChoices>) {
      state.readyStatus[action.payload] = !state.readyStatus[action.payload];
      sessionStorage.setItem("session", JSON.stringify(state));
    },
    playerDisconnect(state, action: PayloadAction<PlayerChoices>) {
      state.mobileConnected[`${action.payload}`] = false;
      state.readyStatus[action.payload] = false;
      sessionStorage.setItem("session", JSON.stringify(state));
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
  updateMobileConnection,
  toggleReady,
  playerDisconnect,
  
} = menuSlice.actions;

export default menuSlice.reducer;
