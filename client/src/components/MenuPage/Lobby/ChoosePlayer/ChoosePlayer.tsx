import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../redux";
import {
  playerDisconnect,
  toggleReady,
  updateMobileConnection,
} from "../../../../redux/features/menu-slice";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { PlayerChoices, players } from "../../../../util/types";

import "./ChoosePlayer.css";

interface ChoosePlayerProps {
  playerNum: 1 | 2;
guestConnected?:boolean ;

  
}

const ChoosePlayer = ({ playerNum,guestConnected, }: ChoosePlayerProps) => {
  const dispatch = useDispatch();
  const {
    sessionId,
    socket,
    player,
    mobileCode,
    local,
    mobileConnected,
    host,
    ready,
  } = useSelector((state: RootState) => ({
    sessionId: state.menu.sessionId,
    socket: state.socket.socket,
    player: state.menu.player,
    mobileCode: state.menu.mobileCode,
    local: state.menu.local,
    mobileConnected: state.menu.mobileConnected[`player${playerNum}`],
    host: state.menu.host,
    ready: state.menu.readyStatus[`player${playerNum}`],
  }));

  const isSamePlayer = () => playerNum === parseInt(player[6]);
 console.log(guestConnected);
 


  return (
    <div className="choosePlayerContainer">
      <h2
        className={`playerIndicator ${
          !local && isSamePlayer() && "samePlayer" //Adds an indicator to show which player the player connected is
        }
        ${!host && playerNum === 1 && "hostInd"}
        ${playerNum === 2 && guestConnected && "connectedInd"}
    
        `}
      >
        {`Player ${playerNum} `}
      </h2>

      <p>{playerNum === 1 ? "Left" : "Right"} Paddle </p>
      <div className="row controlContainer">
        <div className="keyContainer">
          <h3 className="indicatorTitle">Keyboard</h3>
          <div className="keyBtn">
            <KeyBoardControl
              char={playerNum === 1 ? "W" : <AiOutlineArrowUp />}
            />
            <KeyBoardControl
              char={playerNum === 1 ? "S" : <AiOutlineArrowDown />}
            />
          </div>
        </div>
        <div className="mobileContainer">
          <h3 className="indicatorTitle">Mobile</h3>
          <div
            className={`mobileIndicator neonBorder ${
              mobileConnected && "active"
            }`}
          >
            {((!local && isSamePlayer()) || local) && (
              <span id="mobileText">{mobileCode[`player${playerNum}`]}</span>
            )}
          </div>
        </div>
      </div>
      {!local && (
        <button
          className={`neonButton neonBorder neonText readyUp ${
            ready && "ready"
          }`}
          onClick={(e) => {
            if (isSamePlayer()) {
              e.currentTarget.blur()
              dispatch(toggleReady(`player${playerNum}`));
              socket.emit("PLAYER_READY", sessionId, player);
            }
          }}
          style={{
            pointerEvents:
              (!local && isSamePlayer()) || local ? "auto" : "none", // If online dont allow the player to click the others controls
          }}
        >
          Ready
        </button>
      )}
    </div>
  );
};
export default ChoosePlayer;

interface KeyProps {
  char: string | React.ReactNode;
}

// Displayes the keyboard controls for each player
const KeyBoardControl = ({ char }: KeyProps) => {
  return (
    <div className={`keyIndicator neonBorder `}>
      {/* <p className="centerAbs keyBtnText">{char}</p> */}
      {char}
    </div>
  );
};
