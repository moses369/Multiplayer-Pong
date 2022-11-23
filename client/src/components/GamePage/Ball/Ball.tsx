import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";
import "./Ball.css";
interface Props {
  paddle1: HTMLDivElement | null;
  paddle2: HTMLDivElement | null;
  resetRound: any;
}
const Ball = ({ paddle1, paddle2, resetRound }: Props) => {
  const { socket, sessionId } = useSelector(
    ({ socket: { socket }, menu: { sessionId } }: RootState) => ({
      socket,
      sessionId,
    })
  );
  const [playAnimation, setPlayAnimation] = useState<boolean>(true);
  const pongRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 10, y: 10 });
  const reverseRef = useRef<{ x: boolean; y: boolean; paddle: boolean }>({
    x: false,
    y: false,
    paddle: false,
  });
  const animateRef = useRef<number>(0);

  const pong = pongRef.current;

  const animate = () => {
    if (pong && paddle1 && paddle2) {
      console.log("moving");

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

      const updateMove = (axis: "x" | "y", delta: number): number =>
        (offsetRef.current[axis] += delta);
      const inBetweenPaddles = (paddle: "one" | "two"): boolean => {
        const between =
          rects.pong.top >= rects.paddles[paddle].top &&
          rects.pong.bottom <= rects.paddles[paddle].bottom;

        return paddle === "one"
          ? rects.pong.left <= rects.paddles[paddle].right && between
          : rects.pong.right >= rects.paddles[paddle].left && between;
      };

      const alternateXMove = () => {
        reverseRef.current.x
          ? updateMove("x", move.delta)
          : updateMove("x", -move.delta);

        if (inBetweenPaddles("one") && !reverseRef.current.paddle) {
          reverseRef.current.x = !reverseRef.current.x;
          reverseRef.current.paddle = true;
        } else if (inBetweenPaddles("two") && !reverseRef.current.paddle) {
          reverseRef.current.x = !reverseRef.current.x;
          reverseRef.current.paddle = true;
        }
      };

      const move: { x: number; y: number; delta: number } = {
        x: offsetRef.current.x,
        y: offsetRef.current.y,
        delta: 1,
      };
      pong.style.transform = `translate(${move.x}px,${move.y}px)`;

      if (!reverseRef.current.y) {
        if (rects.pong.bottom >= rects.border.bottom) {
          reverseRef.current.y = true;
          reverseRef.current.paddle = false;
        }
        alternateXMove();

        updateMove("y", move.delta);
      } else {
        if (rects.pong.top <= 0) {
          reverseRef.current.y = false;
          reverseRef.current.paddle = false;
        }
        alternateXMove();
        updateMove("y", -move.delta);
      }

      animateRef.current = requestAnimationFrame(animate);
      if (rects.pong.x < 0 || rects.pong.x > rects.border.right) {
        console.log("reset");

        setPlayAnimation(false);
      }
    }
  };

  useEffect(() => {
    socket.on("MOVE_BALL", () => {
      setTimeout(() => {
        console.log("Play now");

        setPlayAnimation(true);
      }, 1000);
    });
  }, [socket, setPlayAnimation]);
  useEffect(() => {
    console.log("playAnimation", playAnimation);

    if (playAnimation) {
      console.log("paly");

      animateRef.current = requestAnimationFrame(animate);
    } else {
      resetRound();
      cancelAnimationFrame(animateRef.current);
    }
  }, [playAnimation]);

  return <div className="pong" ref={pongRef}></div>;
};

export default Ball;
