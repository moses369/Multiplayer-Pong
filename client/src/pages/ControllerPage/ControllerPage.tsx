import { useRef } from "react";
import { useSelector } from "react-redux";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { RootState } from "../../redux";

import TouchPoint from "../../components/ControllerPage/TouchPoint/TouchPoint";

import "./ControllerPage.css";
import useEmitPaddleMove from "../../customHook/useEmitPaddleMove";
const ControllerPage = () => {
  const emitMove = useEmitPaddleMove();
  const viewportHeight = useRef<number>(document?.body.clientHeight);
  const ylocation = useRef<number>(0)

  
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
      className="controllerPageContainer"
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
