import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useKeyControls from "../../../customHook/useKeyControls";
import { RootState } from "../../../redux";
import { DirectionChoices, PlayerChoices, players } from "../../../util/types";
import "./Paddle.css";

interface PaddleProps {
  player: PlayerChoices;
  paddleRef: React.RefObject<HTMLDivElement>;
}
const Paddle = ({ player, paddleRef }: PaddleProps) => {
  const { socket } = useSelector(({ socket: { socket } }: RootState) => ({
    socket,
  }));
  const [playAnimation, setPlayAnimation] = useState<boolean>(false); //used to decide to start,or stop the paddle animation
  const directionRef = useRef<string>(""); // the direction of the movement, up / down
  const animateID = useRef<number>(0); // the id used to stop the animate key frames
  const moveDistance = useRef<number>(1); // the offset distace to translate relative to origin
  const paddle = paddleRef.current;
  useKeyControls(player, directionRef, setPlayAnimation); // used to handle the keyboard control logic

  /**
   * Logic for the animation for the paddle
   */
  const animate = () => {
    const delta = .9; // the speed of the paddle move in vh units
    if (paddle && document) {
      /**
       * Dimensions of the paddle
       */
      const rects = {
        paddle: {
          top: paddle.getBoundingClientRect().top,
          bottom: paddle.getBoundingClientRect().bottom,
        },
        border: { bottom: document.body.clientHeight },
      };
      /**
       * @param delta number of which to translate by, (+) down, (-) up
       */
      const updateMove = (delta: number): number =>
        (moveDistance.current += delta);

      /** Logic to determine to allow the paddle to move or not based off our border**/
      if (directionRef.current === "up" && rects.paddle.top > 0) {
        // Move the paddle up
        updateMove(-delta);
      } else if (
        directionRef.current === "down" &&
        rects.paddle.bottom < rects.border.bottom
      ) {
        // Move the paddle down
        updateMove(delta);
      }
      // Our Offsest distance to move the paddle from its transformation origin
      const yOffset = moveDistance.current;
      // Actually translating the paddles
      paddle.style.transform = `translateY(${yOffset}vh)`;

      // Have our function called again on every AnimationFrame
      animateID.current = requestAnimationFrame(animate);
    }
  };

  /**
   * Determines if we should move the paddle or not based off our `playAnimation` state
   */
  useEffect(() => {
    if (playAnimation) {
      animateID.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animateID.current);
    }
  }, [playAnimation]);

  /**
   * Listens for a direction and if we should move the paddle, from our multiplayer users
   */
  useEffect(() => {
    socket.on(
      "MOVING_PADDLE",
      (
        direction: DirectionChoices,
        playerMoved: PlayerChoices,
        move: boolean
      ) => {
        if (playerMoved === player) {
          directionRef.current = direction;
          setPlayAnimation(move);
        }
      }
    );
    return () => {
      socket.removeListener("MOVING_PADDLE");
    };
  }, []);

  return (
    <div
      ref={paddleRef}
      className={`paddle ${
        player === players.one ? "left" : "right"
      } neonBorder`}
    ></div>
  );
};

export default Paddle;
