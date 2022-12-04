
import React, { useCallback, useState, useRef, useEffect } from "react";
import useEmitPaddleMove from "../../../customHook/useEmitPaddleMove";
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
  const holding = useRef<boolean>(false)
  const emitMove = useEmitPaddleMove()
  return (
    <div
    className=" neonBorder neonText touchPoint"
      // onTouchStart={(e) => {
      //   holding.current = true
      //  //Tells the connected paddle to start moving in the given direction
      //   // socket.emit("MOVE_PADDLE", sessionId, direction, player,true,true); 
      //   emitMove(direction,true,true)
      // }}
      // onTouchEnd={(e) => {
      //   holding.current = false
      
      //  //Tells the connected paddle to stop moving
      //   // socket.emit("MOVE_PADDLE", sessionId, direction, player,false,true);
      //   emitMove(direction,false,true)
      // }}
    
    >
      <>{Arrow}</>
    </div>
  );
};

export default TouchPoint;
