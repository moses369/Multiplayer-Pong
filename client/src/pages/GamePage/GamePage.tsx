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

const GamePage = () => {
  const dispatch = useDispatch();

  const { local, socket } = useSelector((state: RootState) => ({
    local: state.menu.local,
    socket: state.socket.socket,
  }));
  const goToLobby = useBackToLobby();
  useEffect(() => {
    socket.on('ON_PLAY_AGAIN',(player:PlayerChoices) => {
      console.log('wants to play again');
      
      dispatch(togglePlayAgain(player))
    })
    socket.on("PLAYER_DISCONNECTED", () => {
      console.log("Player left in game");
      goToLobby();
      dispatch(playerDisconnect(players.two));
    });
    socket.on("GO_TO_LOBBY", () => {
      console.log('go to lobby');
      
      goToLobby();
    });

    return () => {
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
