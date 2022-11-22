import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux";
import { moveSocket, Rect } from "../../../redux/features/paddle-slice";

import Ball from "../Ball/Ball";
import Paddle from "../Padddle/Paddle";

import "./GameDisplay.css";

const GameDisplay = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector(({ socket: { socket } }: RootState) => ({
    socket,
  }));

  const [start, setStart] = useState<boolean>(false);

  const paddle1Ref = useRef<HTMLDivElement>(null);
  const paddle2Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTimeout(() => {
      !start && setStart(true);
    }, 1000);
  }, [start]);
  useEffect(() => {
    socket.on(
      "MOVING_PADDLE",
      (direction: "up" | "down", player: "player1" | "player2") => {
        const border: Rect = {
          top: 0,
          right: document?.body.clientWidth,
          bottom: document?.body.clientHeight,
          left: 0,
        };
        if (paddle1Ref.current && paddle2Ref.current) {
          const paddle =
            player === "player1" ? paddle1Ref.current : paddle2Ref.current;
          dispatch(
            moveSocket({
              direction,
              player,
              border,
              paddle,
            })
          );
        }
      }
    );
  }, [socket]);

  return (
    <>
      {
        <div className="game_container">
          <Paddle player={"player1"} paddleRef={paddle1Ref} />
          {start && (
            <Ball
              paddle1={paddle1Ref.current}
              paddle2={paddle2Ref.current}
              setStart={setStart}
            />
          )}
          <Paddle player={"player2"} paddleRef={paddle2Ref} />
        </div>
      }
    </>
  );
};

export default GameDisplay;
