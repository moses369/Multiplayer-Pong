import { useEffect } from "react";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import TouchPoint from "./TouchPoint/TouchPoint";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";

const Controller = () => {
  const { socket, uid } = useSelector(
    ({ socket: { socket, uid } }: RootState) => ({ socket, uid })
  );
  useEffect(() => {
 
  }, []);
  return (
    <>
      <TouchPoint direction="up" Arrow={<AiOutlineArrowUp />} />
      <TouchPoint direction="down" Arrow={<AiOutlineArrowDown />} />
    </>
  );
};

export default Controller;
