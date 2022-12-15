import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PlayerOptions, PlayerChoices } from "../../util/types";
import { Socket } from "socket.io-client";
interface PongStartPos {
  top: number;
  left: boolean;
  up: boolean;
  horizontal: boolean;
}

export interface GameState {
  score: PlayerOptions<number>;
  winner: PlayerChoices | "";
  playAgain: PlayerOptions<boolean>;
  pongStartPos: PongStartPos;
}

/**
 *
 * @param min -minimum int
 * @param max -maximum int
 * @returns a random integer with both min and max inclusive
 */
const randomInteger = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const initialState: GameState = {
  score: { player1: 0, player2: 0 },
  winner: "",
  playAgain: { player1: false, player2: false },
  pongStartPos: {
    top: randomInteger(5, 95),
    left: randomInteger(1, 2) === 1,
    up: randomInteger(1, 2) === 1,
    horizontal: randomInteger(1, 2) === 1,
  },
};

export const gameSlice = createSlice({
  name: "game-slice",
  initialState,
  reducers: {
    incrementScore(state, action: PayloadAction<PlayerChoices>) {
      state.score[action.payload]++;
      if (state.score[action.payload] === 11) {
        state.winner = action.payload;
      }
    },
    resetGame(state) {
      state.winner = "";
      state.playAgain = { player1: false, player2: false };
      state.score = { player1: 0, player2: 0 };
    },
    togglePlayAgain(state, action: PayloadAction<PlayerChoices>) {
      state.playAgain[action.payload] = !state.playAgain[action.payload];
      if (state.playAgain.player1 && state.playAgain.player2) {
        state.score = { player1: 0, player2: 0 };
        state.winner = "";
        state.playAgain = { player1: false, player2: false }
      }
    },
    syncPongPosition(state, action: PayloadAction<PongStartPos>) {
      state.pongStartPos = action.payload;
    },
    randomizePongPosition(
      state,
      action: PayloadAction<{ sessionId?: string; socket?: Socket }>
    ) {
      const newPosition = {
        top: randomInteger(5, 95),
        left: randomInteger(1, 2) === 1,
        up: randomInteger(1, 2) === 1,
        horizontal: randomInteger(1, 2) === 1,
      };
      state.pongStartPos = newPosition;
      if (action.payload.socket) {
        action.payload.socket.emit("PONG_POSITION", action.payload.sessionId,newPosition);
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { incrementScore, resetGame, togglePlayAgain, syncPongPosition,randomizePongPosition } =
  gameSlice.actions;

export default gameSlice.reducer;
