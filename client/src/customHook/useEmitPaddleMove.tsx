import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux";
import { DirectionChoices, PlayerChoices } from "../util/types";
interface EmitMove {
  ( direction: DirectionChoices | number,move: boolean, holding: boolean,playerToMove?:PlayerChoices): void;
}
 /**
         * Emits to the paddle to move
         * @param direction the direction the paddle will move
         * @param move will the paddle move or stop its animation
         * @param holding is this for keyboard controls, or sliding with a controller/mouse
         * @return A function with the above params to emit paddle move
         */
const useEmitPaddleMove = () => {
    const { socket, sessionId, player } = useSelector(
        ({ socket: { socket }, menu: { sessionId, player } }: RootState) => ({
            socket,
            sessionId,
            player,
        })
        );
        
       
  const emitMove: EmitMove = useCallback((direction,move,holding,playerToMove = player) => {
    socket.emit("MOVE_PADDLE", sessionId, direction, playerToMove, move, holding);
  }, []);

  return emitMove;
};

export default useEmitPaddleMove;
