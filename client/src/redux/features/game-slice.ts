import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PlayerOptions,PlayerChoices } from "../../util/types";


export interface GameState {
score:PlayerOptions<number>

}

const initialState: GameState = {
score:{player1:0,player2:0}
};

export const gameSlice = createSlice({
  name: "game-slice",
  initialState,
  reducers: {
    incrementScore(state,action:PayloadAction<PlayerChoices>){
        state.score[action.payload]++
    },
    resetScore(state){
        state.score = {player1:0,player2:0}
    }
  },
});

// Action creators are generated for each case reducer function
export const {incrementScore,resetScore} = gameSlice.actions;

export default gameSlice.reducer;
