import React from "react";
import ReactModal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux";
import { PlayerChoices, players } from "../../../util/types";
import { resetGame, togglePlayAgain } from "../../../redux/features/game-slice";

import "./GameOver.css";
import useLeaveSession from "../../../customHook/useLeaveSession";
import useBackToLobby from "../../../customHook/useBackToLobby";

const GameOver = () => {
  const winner = useSelector((state: RootState) => state.game.winner);

  return (
    <ReactModal
      className={"gameOverModal neonBorder centerAbs neonText"}
      overlayClassName={`modalOverlay`}
      isOpen={!!winner}
      children={<Contents />}
    />
  );
};

const playerText = (testcase: PlayerChoices | "") =>
  testcase === players.one ? "Player 1" : "Player 2";

const Contents = () => {
  const dispatch = useDispatch();
  const { winner, local, host } = useSelector((state: RootState) => ({
    winner: state.game.winner,
    local: state.menu.local,
    host: state.menu.host,
  }));
  const leave = useLeaveSession();
  const goToLobby = useBackToLobby(host);
  return (
    <>
      <h2>{playerText(winner)} won!</h2>
      <div className=" gameOverOptions">
        <div className={`playAgainContainer row ${local ? "localPlay" : ""}`}>
          <PlayAgain player={players.one} />
          {!local && <PlayAgain player={players.two} />}
        </div>
        <div className="row exitButtonsContainer">
          <button
            className={`neonButton neonBorder neonText`}
            onClick={() => {
              host && goToLobby();
            }}
          >
            Lobby
          </button>

          <button onClick={leave} className={`neonButton neonBorder neonText`}>
            Exit
          </button>
        </div>
      </div>
    </>
  );
};
const PlayAgain = ({ player }: { player: PlayerChoices }) => {
  const dispatch = useDispatch();
  const { currPlayer, playAgain, local, sessionId, socket } = useSelector(
    (state: RootState) => ({
      currPlayer: state.menu.player,
      local: state.menu.local,
      sessionId: state.menu.sessionId,
      playAgain: state.game.playAgain,
      socket: state.socket.socket,
    })
  );
  
  return (
    <div className={`playAgain `}>
      {!local && <h3>{playerText(player)}</h3>}
      <button
        onClick={(e) => {
          e.currentTarget.blur();
          if (local) {
            dispatch(resetGame());
          } else {
            socket.emit("PLAY_AGAIN", sessionId, currPlayer);
          }
          currPlayer === player && dispatch(togglePlayAgain(player));
        }}
        className={` playAgainButton neonButton neonText neonBorder ${
          playAgain[player] ? "ready" : ""
        }`}
      >
        Play Again
      </button>
    </div>
  );
};
export default GameOver;
