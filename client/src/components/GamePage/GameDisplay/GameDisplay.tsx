import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux";
import { PlayerChoices, players } from "../../../util/types";
import ReactModal from "react-modal";
import Pong from "../Pong/Pong";
import Paddle from "../Padddle/Paddle";
import GameOver from "../GameOver/GameOver";
import "./GameDisplay.css";
import { randomizePongPosition,syncPongPosition } from "../../../redux/features/game-slice";

const GameDisplay = () => {
  const dispatch = useDispatch();
  const { socket, host, local, sessionId } = useSelector(
    (state: RootState) => ({
      socket: state.socket.socket,
      host: state.menu.host,
      local: state.menu.local,
      sessionId: state.menu.sessionId,
    })
  );
  const [start, setStart] = useState<boolean>(true); // determines if we start, our Pong animation, used to reset the Pong position as well

  const paddle1Ref = useRef<HTMLDivElement>(null);
  const paddle2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    !host &&
    socket.on("SYNC_PONG", (top, left, up, horizontal) => {
      dispatch(syncPongPosition({ top, left, up, horizontal }));
    });
  },[])

  /**
   * Resets the round by unrendering the Pong/pong
   *  @param time determines how long to wait before starting the next round defaults to 1000ms
   */
  const resetRound = (time: number = 1000) => {
    setStart(() => {
      return false;
    });
    host && dispatch(randomizePongPosition({ sessionId, socket }));
    setTimeout(() => {
      setStart(() => {
        return true;
      });
    }, time);
  };

  return (
    <>
      <GameOver />
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
