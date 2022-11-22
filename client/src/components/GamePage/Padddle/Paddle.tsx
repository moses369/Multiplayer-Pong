import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Paddle.css";
import { syncPosition } from "../../../redux/features/paddle-slice";
import { RootState } from "../../../redux";


interface PaddleProps {
  player: "player1" | "player2";
  paddleRef:React.RefObject<HTMLDivElement>
}
const Paddle = ({ player, paddleRef }: PaddleProps) => {
  const state = useSelector(({ paddle: { player1, player2 } }: RootState) => ({
    player1,
    player2,
  }));
  const dispatch = useDispatch();


  useEffect(() => {
    if (paddleRef.current) {
      console.log("Syncing Props");

      const { top, bottom } = paddleRef.current.getBoundingClientRect();
      dispatch(syncPosition({ player, top, bottom }));
    }
  }, []);

  return (
    <div
      ref={paddleRef}
      className={`paddle ${player === "player1" ? "left" : "right"}`}
    ></div>
  );
};

export default Paddle;
