import React from 'react'
import GameDisplay from '../../components/GamePage/GameDisplay/GameDisplay'
import useMouseControls from "../../customHook/useMouseControls";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";

import './GamePage.css'
const GamePage = () => {
  const { player, local } = useSelector((state: RootState) => ({
    player: state.menu.player,
    local: state.menu.local,
  }));
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
  )
}

export default GamePage