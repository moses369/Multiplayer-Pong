import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deflate } from "zlib";
import { RootState } from "../../../redux";
import { incrementScore } from "../../../redux/features/game-slice";
import { PlayerChoices, players } from "../../../util/types";
import "./Pong.css";
interface Props {
  paddle1Ref: React.RefObject<HTMLDivElement>;
  paddle2Ref: React.RefObject<HTMLDivElement>;
  resetRound: any;
}
interface OffSet {
  x: number;
  y: number;
  delta: number;
  horizontal: boolean;
}
const delta = {
  max: 2.5,
  min: 0.3,
};
const Pong = ({ paddle1Ref, paddle2Ref, resetRound }: Props) => {
  const dispatch = useDispatch();
  const [playAnimation, setPlayAnimation] = useState<boolean>(true); //Determines to play the animation or not
  const [scored, setScored] = useState<PlayerChoices | "">(""); //Dictates which player scored
  const pongRef = useRef<HTMLDivElement>(null);

  const offsetRef = useRef<OffSet>({
    x: 0,
    y: 0,
    delta: 0.3, // max 2.5 min .3
    horizontal: false,
  }); // The distance to move the Pong on its x and y axis, and speed to do so
  const directionRef = useRef<{
    left: boolean;
    up: boolean;
    paddleBounced: boolean;
  }>({
    left: true,
    up: false,
    paddleBounced: false, //Determines if we already collided with the paddle to not register multiple collides on one collision
  }); //The booleans to determine if we reverse directions
  const animateRef = useRef<number>(0); //The id used to stop the animation

  const animate = () => {
    if (pongRef.current && paddle2Ref.current && paddle1Ref.current) {
      const paddle2 = paddle2Ref.current;
      const paddle1 = paddle1Ref.current;
      const pong = pongRef.current;
      // Gets the location of both padddles, the Pong and the border
      const rects = {
        pong: pong.getBoundingClientRect(),
        border: {
          right: document?.body.clientWidth,
          bottom: document?.body.clientHeight,
        },
        paddles: {
          left: paddle1.getBoundingClientRect(),
          right: paddle2.getBoundingClientRect(),
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
       * Determines if the pong sides are in between the paddles sides
       * @param paddleRect the paddle to determine if the Pong collided with it
       * @param buffer the spacing for error on a ball bounce
       * @returns a boolean indicating the pong is in between the paddle vertically
       */
      const sideBetweenPaddle = (
        paddleRect: DOMRect,
        buffer: number = 0
      ): boolean => {
        const buffedPaddle = {
          left: directionRef.current.left
            ? paddleRect.left - buffer / 2
            : paddleRect.left - buffer,
          right: directionRef.current.left
            ? paddleRect.right + buffer
            : paddleRect.right + buffer / 2,
        };
        const centerPong = rects.pong.left + rects.pong.width / 2;
        const pongCenterInBetween =
          centerPong <= buffedPaddle.right && centerPong >= buffedPaddle.left;
        // X axis of pong is in between the paddles if paddle is one determine if the left side bounced, otherwise check right side
        // if (
        //   (directionRef.current.left &&
        //     rects.pong.left <= buffedPaddle.right) ||
        //   pongCenterInBetween
        // ) {
        //   console.log(rects.pong.left >= buffedPaddle.left);

        //   console.log(buffedPaddle.left, centerPong, buffedPaddle.right);
        //   // debugger;
        // }
        // if (
        //   (!directionRef.current.left &&
        //     rects.pong.right >= buffedPaddle.left) ||
        //   pongCenterInBetween
        // ) {
        //   console.log(rects.pong.right <= buffedPaddle.right);

        //   console.log(buffedPaddle.right, rects.pong.left, buffedPaddle.left);
        //   // debugger
        // }
        return directionRef.current.left
          ? (rects.pong.left <= buffedPaddle.right &&
              rects.pong.left >= buffedPaddle.left) ||
              pongCenterInBetween
          : (rects.pong.right >= buffedPaddle.left &&
              rects.pong.right <= buffedPaddle.right) ||
              pongCenterInBetween;
      };
      const inBetweenPaddles = (paddleRect: DOMRect): boolean => {
        // Y axis of Pong is in between the paddles
        const topInBetweenPaddles =
          rects.pong.top >= paddleRect.top &&
          rects.pong.top <= paddleRect.bottom;
        const bottomInBetweenPaddles =
          rects.pong.bottom <= paddleRect.bottom &&
          rects.pong.bottom >= paddleRect.top;

        // Pong is vertically in between the paddles
        return bottomInBetweenPaddles || topInBetweenPaddles;
      };

      /**
       * Changes the speed and Y angle of the pong depending on the portion of the paddle it collided with
       */
      const changeSpeedDirectionOfPong = (): any => {
        const paddleRect =
          rects.paddles[directionRef.current.left ? "left" : "right"];
        const pongRect = rects.pong;
        const pongHalfHeightBuffed = pongRect.height / 2 - 5;
        const paddleHeight = {
          eigth: paddleRect.height / 8,
          half: paddleRect.height / 2,
        };

        const sideBounce = sideBetweenPaddle(paddleRect, 4);

        const paddleSection = {
          topCorner: paddleRect.top + paddleHeight.eigth * 2, // 2/8 of top of paddle 2/8,
          topMid: paddleRect.top + paddleHeight.half - pongHalfHeightBuffed,
          bottomMid:
            paddleRect.bottom - paddleHeight.half + pongHalfHeightBuffed,
          bottomCorner: paddleRect.bottom - paddleHeight.eigth * 2, // 2/8 of bottom of paddle 6/8
        };
        const paddleBounced = {
          topCorner:
            pongRect.bottom >= paddleRect.top &&
            pongRect.bottom <= paddleSection.topCorner &&
            sideBounce,
          mid:
            ((pongRect.top >= paddleSection.topMid &&
              pongRect.top <= paddleSection.bottomMid) ||
              (pongRect.bottom >= paddleSection.topMid &&
                pongRect.bottom <= paddleSection.bottomMid)) &&
            sideBounce,
          bottomCorner:
            pongRect.top <= paddleRect.bottom &&
            pongRect.top >= paddleSection.bottomCorner &&
            sideBounce,
        };

        //  console.log((pongRect.top >= paddleSection.topMid &&
        //   pongRect.top <= paddleSection.bottomMid));

        if (
          (!directionRef.current.paddleBounced && paddleBounced.topCorner) ||
          paddleBounced.bottomCorner
        ) {
          offsetRef.current.delta < delta.max &&
            (offsetRef.current.delta += 0.15);
          console.log(
            "topcorner",
            paddleBounced.topCorner,
            "bottomcorner",
            paddleBounced.bottomCorner
          );
          paddleBounced.topCorner && (directionRef.current.up = true);
          paddleBounced.bottomCorner && (directionRef.current.up = false);
        }
        if (!directionRef.current.paddleBounced && paddleBounced.mid) {
          console.log("mid");
          offsetRef.current.delta > delta.min + 0.4 &&
            (offsetRef.current.delta -= 0.1);
          offsetRef.current.horizontal = true;
        }
      };

      /**
       * Logic to find out if the Pong has collided with the paddle reversing its x direction
       */
      const alternateXMove = (): void => {
        // Depending on the direction the pong is traveling get the left or right paddle
        const paddleRect =
          rects.paddles[directionRef.current.left ? "left" : "right"];

        const sideBounce = sideBetweenPaddle(paddleRect, 7);
        const inBetween = inBetweenPaddles(paddleRect);
        if (!directionRef.current.paddleBounced && sideBounce && inBetween) {
          offsetRef.current.horizontal = false;
          changeSpeedDirectionOfPong();
          directionRef.current.left = !directionRef.current.left;
          directionRef.current.paddleBounced = true;
        }
      };

      // An object to determine moving directions and speed
      const move: OffSet = {
        x: offsetRef.current.x, //the amount to move the x axis by
        y: offsetRef.current.y, //the amount to move the y axis by
        delta: offsetRef.current.delta, // the speed of which the Pong moves in vport units maximum 2.5 minimum .3,
        horizontal: offsetRef.current.horizontal, //if the ball should move horizontally after hitting the middle of a paddle
      };
      // Translates the Pong by the moves x and y properties
      alternateXMove(); //Alternate before changing x direction to prevent the Pong going through the paddle

      // Determines the Y axis movement direction and the X axis for the next iteration
      directionRef.current.left
        ? updateMove("x", -move.delta)
        : updateMove("x", move.delta);
      if (!directionRef.current.up) {
        // Resets the paddle reverse ref and reverses y direction when colliding with the top/bottom border
        if (rects.pong.bottom >= rects.border.bottom) {
          directionRef.current.up = true;
        }
        // Reverses Direction of Pong movement on the x axis
        !move.horizontal && updateMove("y", move.delta);
      } else {
        // Resets the paddle reverse ref and reverses y direction when colliding with the top/bottom border
        if (rects.pong.top <= 0) {
          directionRef.current.up = false;
        }
        !move.horizontal && updateMove("y", -move.delta);
      }
      directionRef.current.paddleBounced &&
        setTimeout(() => {
          directionRef.current.paddleBounced = false;
        }, 500);

      pong.style.transform = `translate(${move.x}vw,${move.y}vh)`;

      animateRef.current = requestAnimationFrame(animate);
      // If the Pong passes the left or right border update the score and reset the round
      if (rects.pong.x < 0 || rects.pong.x > rects.border.right) {
        rects.pong.x < 0 && setScored(players.two); // Pong reaches the left side player two scores
        rects.pong.x > rects.border.right && setScored(players.one); //Pong reaches the right side player one scores
        setPlayAnimation(false); // Stop the animation
      }
    }
  };

  /**
   * Increases the speed as the round progresses
   */
  const incrSpeed = useCallback(() => {
    return setInterval(() => {
      offsetRef.current.delta < delta.max && (offsetRef.current.delta += 0.1);
    }, 7000);
  }, []);
  const intervalID = useRef<NodeJS.Timer>();

  useEffect(() => {
    intervalID.current = incrSpeed();
    offsetRef.current.delta >= delta.max && clearInterval(intervalID.current);
    return () => {
      clearInterval(intervalID.current);
    };
  }, []);
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

export default Pong;
