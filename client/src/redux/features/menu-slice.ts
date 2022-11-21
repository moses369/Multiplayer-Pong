import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
const randomChar = () => {
  //Getting a random char from using utf-16
  const min = 65;
  const max = 89;
  return String.fromCharCode(Math.floor(Math.random() * (max - min + 1) + min));
}

const createMobileCode = (letter: string) =>
  `${letter}${Math.floor(Math.random() * 100)}`;
export interface MobileCodes {
  player1: string;
  player2: string;
}
export interface MenuState {
  host: boolean;
  sessionId: string;
  player:  'player1' | 'player2';
  inSession: boolean;
  mobileCode: MobileCodes;
}

const initialState: MenuState = {
  host: false,
  sessionId: "",
  player: 'player1',
  inSession: false,
  mobileCode: { player1: "", player2: "" },
};
interface JoinSession {
  sessionId: string;
  mobileCodes: MobileCodes;
}
export const menuSlice = createSlice({
  name: "menu-slice",
  initialState,
  reducers: {
    createSession(state, action: PayloadAction<Socket>) {
      
      const generatedId = `${randomChar()}${randomChar()}${randomChar()}${randomChar()}`;
      const mobileCodes:MobileCodes = {
        player1: createMobileCode(generatedId),
        player2: createMobileCode(generatedId),
      };
      state.host = true;
      state.sessionId = generatedId;
      state.inSession = true;
      state.mobileCode = mobileCodes;
      action.payload.emit("CREATE_SESSION", generatedId, {
        player1: mobileCodes.player1,
        player2: mobileCodes.player2,
      });
    },

    joinSession(
      state,
      { payload: { sessionId, mobileCodes } }: PayloadAction<JoinSession>
    ) {
      state.player='player2'
      state.sessionId = sessionId;
      state.inSession = true;
      state.mobileCode = mobileCodes
    },
    leaveSession(state) {
      state.sessionId = "";
      state.inSession = false;
      state.host = false;
      state.player = 'player1';
    },

  },
});

// Action creators are generated for each case reducer function
export const { createSession, joinSession, leaveSession } =
  menuSlice.actions;

export default menuSlice.reducer;
