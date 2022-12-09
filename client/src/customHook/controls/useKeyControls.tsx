import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import {PlayerChoices} from '../../util/types'
interface KeyControlProp {
  (
    player: PlayerChoices,
    directionRef: React.MutableRefObject<string | number>,
    setPlayAnimation: React.Dispatch<React.SetStateAction<boolean>>
  ): void;
}
/**
 * Creates the keyboard controls for player on, and two
 * @param player The player the controls are for
 * @param directionRef The direction the paddle will move
 * @param setPlayAnimation Used to toggle the animation for paddles
 * @returns 
 */
const useKeyControls: KeyControlProp = (
  player,
  directionRef,
  setPlayAnimation
) => {
  const { socket, local, sessionId, currPlayer } = useSelector(
    ({ socket: { socket }, menu: { local, sessionId,player } }: RootState) => ({
      socket,
      local,
      sessionId,
      currPlayer:player
    })
  );
  /**
   * used to determine to direction, and if the paddle should move, or not
   */
  const moveLogic = (direction: "up" | "down", move: boolean) => {
    if (local) {
      directionRef.current = direction;
      setPlayAnimation(move);
    } else {
      // if not local only move through socket events to help normlaize the response in the sending and opposite player 
      currPlayer === player && socket.emit("MOVE_PADDLE", sessionId, direction, player, move,true);
    }
  };
/**
 * Determines what key will move which player and if it should stop, or move
 * @param move if the paddle should move or not
 */
  const playerMove = (move: boolean, e: KeyboardEvent) => {
    if (
      player === "player1"
        ? e.key === "w" || e.key === "W"
        : e.key === "ArrowUp"
    ) {
      moveLogic("up", move);
    } else if (
      player === "player1"
        ? e.key === "s" || e.key === "S"
        : e.key === "ArrowDown"
    ) {
      moveLogic("down", move);
    }
  };
  const movePaddle = (e: KeyboardEvent) => {
    playerMove(true, e);
  };
  const stopPaddle = (e: KeyboardEvent) => {
    playerMove(false, e);
  };
/**
 * Sets event listeners on the document to handle the paddle movements
 */
  useEffect(() => {
    document.addEventListener("keydown", movePaddle);
    document.addEventListener("keyup", stopPaddle);
    return () => {
      document.removeEventListener("keydown", movePaddle);
      document.removeEventListener("keyup", stopPaddle);
    };
  }, [setPlayAnimation, player, directionRef]);

  return <div>useKeyControls</div>;
};

export default useKeyControls;
