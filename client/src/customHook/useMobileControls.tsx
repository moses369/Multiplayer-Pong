import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux";
import { PlayerChoices } from "../util/types";
import useEmitPaddleMove from "./useEmitPaddleMove";
import useScreenSize from "./useScreenSize";
interface MobileControl {
  (
    player: PlayerChoices,
    holdMove: React.MutableRefObject<boolean>,
    slideDelta: React.MutableRefObject<number>,
    setPlayAnimation: React.Dispatch<React.SetStateAction<boolean>>,
    paddle:React.RefObject<HTMLDivElement>,
  ): void;
}
const useMobileControls: MobileControl = (
  player,
  holdMove,
  slideDelta,
  setPlayAnimation,
  paddle
) => {
  const {local,currPlayer} = useSelector((state: RootState) => ({currPlayer:state.menu.player , local:state.menu.local}));
  const emitMove = useEmitPaddleMove();
  const viewportHeight = useScreenSize()
  const ylocation = useRef<number>(0);

  const logic = (e: TouchEvent, player: PlayerChoices) => {
    const touch = e.targetTouches.item(0);
    
    if (touch && (touch.target === paddle.current)) {
        console.log(touch.target === paddle.current);
      // Normalize the diplacement based off the center of the viewport
      const touchY = touch.clientY / viewportHeight.current - 0.5;
      if (touchY > -0.47 && touchY < 0.47) {
        touchY !== ylocation.current && emitMove(touchY, true, false);
        ylocation.current = touchY;
        
        holdMove.current = false;
        slideDelta.current = touchY;
        setPlayAnimation(true);
      } else if (!local && currPlayer === player) {
        emitMove(touchY, false, false, player);
      }
    }
  };
  const mobileControls = (e: TouchEvent) => {
    logic(e, player);
  };
  useEffect(() => {
    document.addEventListener("touchmove", mobileControls);
    // document.addEventListener("keyup", stopPaddle);
    return () => {
      document.removeEventListener("touchmove", mobileControls);
      //   document.removeEventListener("keyup", stopPaddle);
    };
  }, [setPlayAnimation, player]);
};

export default useMobileControls;
