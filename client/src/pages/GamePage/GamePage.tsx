import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux";
import { playerDisconnect } from "../../redux/features/menu-slice";
import { PlayerChoices, players } from "../../util/types";
import useMouseControls from "../../customHook/useMouseControls";
import useBackToLobby from "../../customHook/useBackToLobby";

import GameDisplay from "../../components/GamePage/GameDisplay/GameDisplay";

import "./GamePage.css";
import { togglePlayAgain } from "../../redux/features/game-slice";

const GamePage = ({
  setShowGuestDC,
}: {
  setShowGuestDC: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dispatch = useDispatch();

  const { local, socket } = useSelector((state: RootState) => ({
    local: state.menu.local,
    socket: state.socket.socket,
  }));
  const goToLobby = useBackToLobby();
  useEffect(() => {
    socket.on("ON_PLAY_AGAIN", (player: PlayerChoices) => {
      dispatch(togglePlayAgain(player));
    });
    socket.on("PLAYER_DISCONNECTED", () => {
      setShowGuestDC(true);
      goToLobby();
      dispatch(playerDisconnect(players.two));
    });
    socket.on("GO_TO_LOBBY", () => {
      goToLobby();
    });
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      sessionStorage.clear();
    });
    return () => {
      socket.removeListener("ON_PLAY_AGAIN");
      socket.removeListener("PLAYER_DISCONNECTED");
      socket.removeListener("GO_TO_LOBBY");
    };
  }, [socket]);

  /**
   * MouseDrag to move Paddle
   */
  const { mouseControls } = useMouseControls();
  return (
    <div
      className="gameContainer playSurface"
      onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
        !local && mouseControls(e);
      }}
    >
      <GameDisplay />
    </div>
  );
};

export default GamePage;
