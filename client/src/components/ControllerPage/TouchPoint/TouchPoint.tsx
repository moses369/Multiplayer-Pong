
import { useCallback, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";
interface Props {
  direction: "up" | "down";
  Arrow: React.ReactNode;
}
export interface sendMovePaddle {
  direction: "up" | "down";
  player: "player1" | "player2";
  id: string;
}
const TouchPoint = ({ direction, Arrow }: Props) => {
  const { socket,sessionId, player } = useSelector(
    ({ socket: { socket }, menu:{sessionId,player} }: RootState) => ({ socket,sessionId,player })
  );
  return (
    <button
      onTouchStart={(e) => {
       
        socket.emit("MOVE_PADDLE", sessionId, direction, player,true);
      }}
      onTouchEnd={(e) => {
      
        socket.emit("MOVE_PADDLE", sessionId, direction, player,false);
      }}
    >
      {Arrow}
    </button>
  );
};

export default TouchPoint;
