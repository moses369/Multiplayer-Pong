import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import TouchPoint from "../../components/ControllerPage/TouchPoint/TouchPoint";
import './ControllerPage.css'
const ControllerPage = () => {
  return (
    <div className="controllerPageContainer">
      {" "}
      <TouchPoint direction="up" Arrow={<AiOutlineArrowUp />} />
      <TouchPoint direction="down" Arrow={<AiOutlineArrowDown />} />
    </div>
  );
};

export default ControllerPage;
