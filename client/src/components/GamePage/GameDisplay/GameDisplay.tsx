import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";

import Ball from "../Ball/Ball";
import Paddle from "../Padddle/Paddle";

import "./GameDisplay.css";

const GameDisplay = () => {
  const { socket, sessionId } = useSelector(
    ({ socket: { socket }, menu: { sessionId } }: RootState) => ({
      socket,
      sessionId,
    })
  );
  const [start, setStart] = useState<boolean>(true);

  const paddle1Ref = useRef<HTMLDivElement>(null);
  const paddle2Ref = useRef<HTMLDivElement>(null);


  const resetRound = () => {
    setStart(() => {
      return false;
    });
    setTimeout(() => {
      setStart(() => {
        return true;
      });
    }, 1000);
  };

  return (
    <>
      {
        <div className="game_container">
          <Paddle player={"player1"} paddleRef={paddle1Ref} />
          {start && (
            <Ball
              paddle1Ref={paddle1Ref}
              paddle2Ref={paddle2Ref}
              resetRound={resetRound}
            />
          )}
          <Paddle player={"player2"} paddleRef={paddle2Ref} />
        </div>
      }
    </>
  );
};

export default GameDisplay;
