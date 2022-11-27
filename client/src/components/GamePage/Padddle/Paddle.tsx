import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useKeyControls from "../../../customHook/useKeyControls";
import { RootState } from "../../../redux";

import "./Paddle.css";

interface PaddleProps {
  player: "player1" | "player2";
  paddleRef: React.RefObject<HTMLDivElement>;
}
const Paddle = ({ player, paddleRef }: PaddleProps) => {
  const [playAnimation, setPlayAnimation] = useState<boolean>(false);
  const { socket } = useSelector(({ socket: { socket } }: RootState) => ({
    socket,
  }));
  const directionRef = useRef<string>("");
  const animateID = useRef<number>(0);
  const moveDistance = useRef<number>(1);
  const paddle = paddleRef.current;
  useKeyControls(player, directionRef, setPlayAnimation);
  
  const animate = () => {
    const delta = 10;
    if (paddle && document) {
      const rects = {
        paddle: {
          top: paddle.getBoundingClientRect().top,
          bottom: paddle.getBoundingClientRect().bottom,
        },
        border: { bottom: document.body.clientHeight },
      };
      const updateMove = (delta: number): number =>
        (moveDistance.current += delta);

      if (directionRef.current === "up" && rects.paddle.top > 0) {
        updateMove(-delta);
      } else if (
        directionRef.current === "down" &&
        rects.paddle.bottom < rects.border.bottom
      ) {
        updateMove(delta);
      }
      const yOffset = moveDistance.current;
      paddle.style.transform = `translateY(${yOffset}px)`;

      animateID.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (playAnimation) {
      animateID.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animateID.current);
    }
  }, [playAnimation]);

  useEffect(() => {
    socket.on(
      "MOVING_PADDLE",
      (
        direction: "up" | "down",
        playerMoved: "player1" | "player2",
        move: boolean
      ) => {
        if (playerMoved === player) {
          directionRef.current = direction;
          setPlayAnimation(move);
        }
      }
    );
  }, [socket]);

  return (
    <div
      ref={paddleRef}
      className={`paddle ${player === "player1" ? "left" : "right"} neonBorder`}
    ></div>
  );
};

export default Paddle;
