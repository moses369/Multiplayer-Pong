
import React, { useCallback, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";
import { DirectionChoices, PlayerChoices } from "../../../util/types";
import'./TouchPoint.css'

interface Props {
  direction: DirectionChoices;
  Arrow: React.ReactNode;
}
export interface sendMovePaddle {
  direction: DirectionChoices;
  player: PlayerChoices;
  id: string;
}
const TouchPoint = ({ direction, Arrow }: Props) => {
  const { socket,sessionId, player } = useSelector(
    ({ socket: { socket }, menu:{sessionId,player} }: RootState) => ({ socket,sessionId,player })
  );
  const holding = useRef<boolean>(false)
  const normalize = (e:React.PointerEvent<HTMLButtonElement>) => {

  }
  return (
    <button
    className="neonButton neonBorder neonText touchPoint"
      onTouchStart={(e) => {
        holding.current = true
       //Tells the connected paddle to start moving in the given direction
        socket.emit("MOVE_PADDLE", sessionId, direction, player,true); 
      }}
      onTouchEnd={(e) => {
        holding.current = false
      
       //Tells the connected paddle to stop moving
        socket.emit("MOVE_PADDLE", sessionId, direction, player,false);
      }}
    
    >
      {Arrow}
    </button>
  );
};

export default TouchPoint;
