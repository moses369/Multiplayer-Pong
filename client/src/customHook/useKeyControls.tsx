import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux";
interface KeyControlProp {
  (
    player: "player1" | "player2",
    directionRef: React.MutableRefObject<string>,
    setPlayAnimation: React.Dispatch<React.SetStateAction<boolean>>
  ): void;
}

const useKeyControls: KeyControlProp = (
  player,
  directionRef,
  setPlayAnimation
) => {
  const { socket, local, sessionId } = useSelector(
    ({ socket: { socket }, menu: { local, sessionId } }: RootState) => ({
      socket,
      local,
      sessionId,
    })
  );
  const moveLogic = (direction: "up" | "down", move: boolean) => {
    if (local) {
      directionRef.current = direction;
      setPlayAnimation(move);
    } else {
      socket.emit("MOVE_PADDLE", sessionId, direction, player, move,true);
    }
  };

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
