import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";
import { PlayerChoices, players } from "../../../util/types";

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
        <div className="gameContainer">
          <div className="scoreContainer">
            <ScoreIndicator player={players.one} />
            <ScoreIndicator player={players.two} />
          </div>
          <Paddle player={players.one} paddleRef={paddle1Ref} />
          {start && (
            <Ball
              paddle1Ref={paddle1Ref}
              paddle2Ref={paddle2Ref}
              resetRound={resetRound}
            />
          )}
          <Paddle player={players.two} paddleRef={paddle2Ref} />
        </div>
      }
    </>
  );
};

export default GameDisplay;
interface ScoreIndicatorProps {
  player: PlayerChoices;
}
const ScoreIndicator = ({ player }: ScoreIndicatorProps) => {
  const score = useSelector((state: RootState) => state.game.score);
  return <h1 className="neonText score">{score[player]}</h1>;
};
