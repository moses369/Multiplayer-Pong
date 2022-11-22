import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Paddle.css";
import { RootState } from "../../../redux";

interface PaddleProps {
  player: "player1" | "player2";
  paddleRef: React.RefObject<HTMLDivElement>;
}
const Paddle = ({ player, paddleRef }: PaddleProps) => {
  const dispatch = useDispatch();

  const { socket } = useSelector(({ socket: { socket } }: RootState) => ({
    socket,
  }));
const animate = () => {

}
  useEffect(() => {
    socket.on(
      "MOVING_PADDLE",
      (direction: "up" | "down", playerMoved: "player1" | "player2") => {
        if (playerMoved === player) {
          animate()
        }
      }
    );
  }, [socket]);

  return (
    <div
      ref={paddleRef}
      className={`paddle ${player === "player1" ? "left" : "right"}`}
    ></div>
  );
};

export default Paddle;
