import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux";
import { incrementScore } from "../../../redux/features/game-slice";
import { PlayerChoices, players } from "../../../util/types";
import "./Ball.css";
interface Props {
  paddle1Ref: React.RefObject<HTMLDivElement>;
  paddle2Ref: React.RefObject<HTMLDivElement>;
  resetRound: any;
}
const Ball = ({ paddle1Ref, paddle2Ref, resetRound }: Props) => {
  const dispatch = useDispatch();
  const [playAnimation, setPlayAnimation] = useState<boolean>(true); //Determines to play the animation or not
  const [scored, setScored] = useState<PlayerChoices | "">(""); //Dictates which player scored
  const pongRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // The distance to move the ball on its x and y axis
  const reverseRef = useRef<{ x: boolean; y: boolean; paddle: boolean }>({
    x: false,
    y: false,
    paddle: false, //Determines if we already collided with the paddle to not register multiple collides on one collision
  }); //The booleans to determine if we reverse directions
  const animateRef = useRef<number>(0); //The id used to stop the animation

  const animate = () => {
    if (pongRef.current && paddle2Ref.current && paddle1Ref.current) {
      const paddle2 = paddle2Ref.current;
      const paddle1 = paddle1Ref.current;
      const pong = pongRef.current;
      // Gets the location of both padddles, the ball and the border
      const rects = {
        pong: pong.getBoundingClientRect(),
        border: {
          right: document?.body.clientWidth,
          bottom: document?.body.clientHeight,
        },
        paddles: {
          one: paddle1.getBoundingClientRect(),
          two: paddle2.getBoundingClientRect(),
        },
      };
      /**
       * Updates the offset for the x or y axis
       * @param axis determines the axis to update
       * @param delta the number to update it by
       */
      const updateMove = (axis: "x" | "y", delta: number): number =>
        (offsetRef.current[axis] += delta);
      /**
       * Logic to find out if the ball has collided with the paddle
       * @param paddle paddle dimensions to look for
       * @returns A boolean indicating if the ball has collided with the paddle
       */
      const inBetweenPaddles = (paddle: "one" | "two"): boolean => {
        const between =
          rects.pong.top >= rects.paddles[paddle].top &&
          rects.pong.bottom <= rects.paddles[paddle].bottom;

        return paddle === "one"
          ? rects.pong.left <= rects.paddles[paddle].right && between
          : rects.pong.right >= rects.paddles[paddle].left && between;
      };

      /**
       * Logic to determine the X axis direction and movement
       */
      const alternateXMove = () => {
        // Reverses Direction of ball movement on the x axis
        reverseRef.current.x
          ? updateMove("x", -move.delta)
          : updateMove("x", move.delta); //This is the inital direction

        // If the ball collided with a paddle reverse its direction
        if (inBetweenPaddles("one") && !reverseRef.current.paddle) {
          reverseRef.current.x = !reverseRef.current.x;
          reverseRef.current.paddle = true;
        } else if (inBetweenPaddles("two") && !reverseRef.current.paddle) {
          reverseRef.current.x = !reverseRef.current.x;
          reverseRef.current.paddle = true;
        }
      };

      // An object to determine moving directions and speed
      const move: { x: number; y: number; delta: number } = {
        x: offsetRef.current.x, //the amount to move the x axis by
        y: offsetRef.current.y, //the amount to move the y axis by
        delta: 0.4, // the speed of which the ball moves in vport units
      };
      // Translates the ball by the moves x and y properties
      pong.style.transform = `translate(${move.x}vw,${move.y}vh)`;

      // Determines the Y axis movement direction and the X axis for the next iteration
      if (!reverseRef.current.y) {
        // Resets the paddle reverse ref and reverses y direction when colliding with the top/bottom border
        if (rects.pong.bottom >= rects.border.bottom) {
          reverseRef.current.y = true;
          reverseRef.current.paddle = false;
        }

        updateMove("y", move.delta);
      } else {
        // Resets the paddle reverse ref and reverses y direction when colliding with the top/bottom border
        if (rects.pong.top <= 0) {
          reverseRef.current.y = false;
          reverseRef.current.paddle = false;
        }
        updateMove("y", -move.delta);
      }
      alternateXMove();

      animateRef.current = requestAnimationFrame(animate);
      // If the ball passes the left or right border update the score and reset the round
      if (rects.pong.x < 0 || rects.pong.x > rects.border.right) {
        console.log("reset");
        rects.pong.x < 0 && setScored(players.two); // Ball reaches the left side player two scores
        rects.pong.x > rects.border.right && setScored(players.one); //Ball reaches the right side player one scores
        setPlayAnimation(false); // Stop the animation
      }
    }
  };

  /**
   * On whenever the a player scores update their score
   */
  useEffect(() => {
    scored && dispatch(incrementScore(scored));
  }, [scored]);

  /**
   * Resets the round and starts the animation based off the `playAnimation` state
   */
  useEffect(() => {
    if (playAnimation) {
      animateRef.current = requestAnimationFrame(animate);
    } else {
      resetRound();
      cancelAnimationFrame(animateRef.current);
    }
  }, [playAnimation]);

  return <div className="pong neonBorder" ref={pongRef}></div>;
};

export default Ball;
