import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";
import { PlayerChoices, players } from "../../../util/types";

import Pong from "../Pong/Pong";
import Paddle from "../Padddle/Paddle";

import "./GameDisplay.css";
import useMouseControls from "../../../customHook/useMouseControls";
import useEmitPaddleMove from "../../../customHook/useEmitPaddleMove";
import useMobileControls from "../../../customHook/useMobileControls";

const GameDisplay = () => {
  const { player, local } = useSelector((state: RootState) => ({
    player: state.menu.player,
    local: state.menu.local,
  }));
  const [start, setStart] = useState<boolean>(true); // determines if we start, our Pong animation, used to reset the Pong position as well

  const paddle1Ref = useRef<HTMLDivElement>(null);
  const paddle2Ref = useRef<HTMLDivElement>(null);
  const emitMove = useEmitPaddleMove();
  /**
   * Resets the round by unrendering the Pong/pong
   *  @param time determines how long to wait before starting the next round defaults to 1000ms
   */
  const resetRound = (time: number = 1000) => {
    setStart(() => {
      return false;
    });
    setTimeout(() => {
      setStart(() => {
        return true;
      });
    }, time);
  };
  /**
   * MouseDrag to move Paddle
   */
  const { mouseControls } = useMouseControls();

  return (
    <>
      <div
        className="gameContainer"
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
          !local && mouseControls(e);
        }}

   
      >
        <div className="scoreContainer">
          <ScoreIndicator player={players.one} />
          <ScoreIndicator player={players.two} />
        </div>
        <Paddle player={players.one} paddleRef={paddle1Ref} />
        {start && (
          <Pong
            paddle1Ref={paddle1Ref}
            paddle2Ref={paddle2Ref}
            resetRound={resetRound}
          />
        )}
        <Paddle player={players.two} paddleRef={paddle2Ref} />
      </div>
    </>
  );
};

export default GameDisplay;

interface ScoreIndicatorProps {
  player: PlayerChoices;
}
/**
 * Used to render the score for each player
 * @param player the player to render the score for
 */
const ScoreIndicator = ({ player }: ScoreIndicatorProps) => {
  const score = useSelector((state: RootState) => state.game.score);
  return <h1 className="neonText score">{score[player]}</h1>;
};
