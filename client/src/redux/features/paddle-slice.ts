import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import React from "react";

interface PaddlePosition {
  top: number;
  bottom: number;
}

interface SyncPosition extends PaddlePosition {
  player: "player1" | "player2";
}

interface MoveSocket {
  direction: "up" | "down";
  player: "player1" | "player2";
  border: Rect;
  paddle: HTMLDivElement;
}
export interface Rect {
  bottom: number;
  left?: number;
  right?: number;
  top: number;
}
export interface PaddleState {
  player1: PaddlePosition;
  player2: PaddlePosition;
  delta: number;
}

const initialState: PaddleState = {
  player1: { top: 0, bottom: 0 },
  player2: { top: 0, bottom: 0 },
  delta: 10,
};

export const paddleSlice = createSlice({
  name: "paddle-slice",
  initialState,
  reducers: {
    syncPosition: (state, action: PayloadAction<SyncPosition>) => {
      const { player, top, bottom } = action.payload;
      state[player].top = top;
      state[player].bottom = bottom;
    },
    moveSocket: (state, action: PayloadAction<MoveSocket>) => {
      const { player, direction, border, paddle } = action.payload;
      const { top, bottom } = paddle.getBoundingClientRect();
      state[player].bottom = bottom;
      let yOffset;
      if (direction === "up") {
        const topLimit = border.top + state.delta;

        yOffset = state[player].top - state.delta;
        top > topLimit && (state[player].top = yOffset);
      } else {
        const botLimit = border.bottom - state.delta;
        yOffset = state[player].top + state.delta;
        bottom < botLimit && (state[player].top = yOffset);
      }

      paddle.style.top = `${yOffset}px`;
    },
  },
});

// Action creators are generated for each case reducer function
export const { syncPosition, moveSocket } = paddleSlice.actions;

export default paddleSlice.reducer;
