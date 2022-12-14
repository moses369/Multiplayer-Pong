import { useRef } from "react";
import { useSelector } from "react-redux";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { RootState } from "../../redux";

import "./ControllerPage.css";
import useEmitPaddleMove from "../../customHook/useEmitPaddleMove";
import useScreenSize from "../../customHook/useScreenSize";

const ControllerPage = () => {
  const emitMove = useEmitPaddleMove();
  const ylocation = useRef<number>(0)
const {viewportHeight} = useScreenSize()
  
  const handleMovement = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.targetTouches.item(0);
    // Normalize the diplacement based off the center of the viewport
    const touchY = touch.clientY / viewportHeight.current - 0.5;
    if (touchY > -0.47 && touchY < 0.47) {
      touchY !== ylocation.current && emitMove(touchY, true, false);
      ylocation.current = touchY
      console.log(touchY);
    }else{
      emitMove(touchY, false, false);
    }
  };

  return (
    <div
      className="controllerPageContainer playSurface"
      // onPointerDown={(e) =>{
      //   console.log('start')
      // }}
      // onPointerUp ={(e) => {
      //   console.log('end')

      // }}
      onTouchMove={handleMovement}
      onTouchEnd={(e)=>emitMove(ylocation.current, false, false)}

    >
      {" "}
      {/* <TouchPoint direction="up" Arrow={<AiOutlineArrowUp />} />
      <TouchPoint direction="down" Arrow={<AiOutlineArrowDown />} /> */}
    </div>
  );
};

export default ControllerPage;
