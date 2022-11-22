import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import TouchPoint from "../TouchPoint/TouchPoint";


const Controller = () => {

  return (
    <>
      <TouchPoint direction="up" Arrow={<AiOutlineArrowUp />} />
      <TouchPoint direction="down" Arrow={<AiOutlineArrowDown />} />
    </>
  );
};

export default Controller;
