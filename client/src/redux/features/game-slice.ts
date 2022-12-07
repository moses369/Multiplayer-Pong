import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PlayerOptions, PlayerChoices } from "../../util/types";

export interface GameState {
  score: PlayerOptions<number>;
  winner: PlayerChoices | "";
  playAgain: PlayerOptions<boolean>;
}

const initialState: GameState = {
  score: { player1: 0, player2: 0 },
  winner: "",
  playAgain: { player1: false, player2: false },
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
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { incrementScore, resetGame, togglePlayAgain } = gameSlice.actions;

export default gameSlice.reducer;
