import React, { useRef } from "react";
import useEmitPaddleMove from "./useEmitPaddleMove";
import useScreenSize from "./useScreenSize";

const useMouseControls = () => {
  const emitMove = useEmitPaddleMove();
  const viewportHeight = useScreenSize()
  const ylocation = useRef<number>(0);

  const mouseControls = (e: React.MouseEvent<HTMLDivElement>) => {
    // Normalize the diplacement based off the center of the viewport
    const clientY = e.clientY / viewportHeight.current - 0.5;
    console.log(clientY);
    
    if (clientY > -0.47 && clientY < 0.47) {
      clientY !== ylocation.current && emitMove(clientY, true, false);
      ylocation.current = clientY;
      console.log(clientY);
    } else {
      emitMove(clientY, false, false);
    }
  };
  return {mouseControls,ylocation}
};

export default useMouseControls;
