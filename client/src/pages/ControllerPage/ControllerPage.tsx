import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import TouchPoint from "../../components/ControllerPage/TouchPoint/TouchPoint";
import { useRef } from "react";
import "./ControllerPage.css";
const ControllerPage = () => {
  const viewportHeight = useRef<number>(document?.body.clientHeight);
  const handleMovement = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.targetTouches.item(0);
    const y = {
      client: touch.clientY,
      viewport: viewportHeight.current,
    };
    const centerClientY = y.client / viewportHeight.current - 0.5;
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
    >
      {" "}
      {/* <TouchPoint direction="up" Arrow={<AiOutlineArrowUp />} />
      <TouchPoint direction="down" Arrow={<AiOutlineArrowDown />} /> */}
    </div>
  );
};

export default ControllerPage;
