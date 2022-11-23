import { useRef, useEffect, useState,useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Paddle.css";
import { RootState } from "../../../redux";

interface PaddleProps {
  player: "player1" | "player2";
  paddleRef: React.RefObject<HTMLDivElement>;
}
const Paddle = ({ player, paddleRef }: PaddleProps) => {
  const dispatch = useDispatch();
  const [playAnimation, setPlayAnimation] = useState<boolean>(false);
  const { socket } = useSelector(({ socket: { socket } }: RootState) => ({
    socket,
  }));
  const directionRef = useRef<string>("");
  const animateID = useRef<NodeJS.Timer | null>(null);
  const play = useRef<boolean>(false);

  const animate = () => {
    const delta = 1;
    if (paddleRef.current && document) {
      const paddle = paddleRef.current;
      const rects = {
        paddle: paddleRef.current.getBoundingClientRect(),
        border: { bottom: document.body.clientHeight },
      };

      if (directionRef.current === "up" && rects.paddle.top > 0) {
        console.log("up");

        // paddle.style.transform = `translateY(${-delta}px)`;
        paddle.style.top = `${rects.paddle.top - delta}px`;
      } else if (
        directionRef.current === "down" &&
        rects.paddle.bottom < rects.border.bottom
      ) {
        console.log("down");
        paddle.style.top = `${rects.paddle.top + delta}px`;
        // paddle.style.transform = `translateY(${delta}px)`;
      }

    //  animateID.current = requestAnimationFrame(animate)
    }
  };
  const moving = useCallback(
    () =>
      setInterval(() => {
        animate();
      }, 100),
    []
  );
  useEffect(() => {
if(playAnimation){
  console.log('move');
  // animateID.current = requestAnimationFrame(animate)
  animateID.current = moving()
  
}else{
  console.log('stop');
  animateID.current && clearInterval(animateID.current)
  // cancelAnimationFrame(animateID.current)
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
          play.current = move

          console.log("move", player, directionRef.current, move);
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
