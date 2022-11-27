import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux";
import {
  MobileCodes,
  updateSelectedDevice,
} from "../../../redux/features/menu-slice";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";

import "./ChoosePlayer.css";
interface ChoosePlayerProps {
  playerNum: 1 | 2;
}
interface Devices {
  mobile: "mobile";
  keys: "keyboard";
}
const devices: Devices = { mobile: "mobile", keys: "keyboard" };

const ChoosePlayer = ({ playerNum }: ChoosePlayerProps) => {
  const dispatch = useDispatch();
  const { sessionId, socket, player, mobileCode, local, deviceSelected } =
    useSelector(
      ({
        menu: { sessionId, player, mobileCode, local, deviceSelected },
        socket: { socket },
      }: RootState) => ({
        sessionId,
        socket,
        player,
        mobileCode,
        local,
        deviceSelected,
      })
    );

  const accessDeviceSelected = () => deviceSelected[`player${playerNum}`];

  const connectKeys = () => {
    if (playerNum === parseInt(player[6]) || local) {
      !local && socket.emit("CONNECT_PLAYER", sessionId, player, devices.keys);
      dispatch(
        updateSelectedDevice({
          player: `player${playerNum}`,
          device: devices.keys,
        })
      );
    }
  };
  useEffect(() => {
    console.log(deviceSelected);
  }, [deviceSelected]);

  useEffect(() => {
    socket.on("PLAYER_CONNECTED", (playerConnected, device) => {
      console.log(playerConnected, "connected", device);

      dispatch(updateSelectedDevice({ player: playerConnected, device }));
    });
    socket.on("MOBILE_DISCONNECT", (player1Device, player2Device) => {
      if (deviceSelected.player1 !== player1Device) {
        dispatch(
          updateSelectedDevice({ player: "player1", device: player1Device })
        );
      }
      if (deviceSelected.player2 !== player2Device) {
        dispatch(
          updateSelectedDevice({ player: "player2", device: player2Device })
        );
      }
    });
  }, [socket]);
  const active = (device: string) =>
    accessDeviceSelected() === device && "active";
  return (
    <div className="choosePlayerContainer">
      <h2 className="playerIndicator">{`Player ${playerNum}`}</h2>
      <p>
        {playerNum === 1 ? "Left" : "Right"} Paddle{" "}
      </p>
      <h3 className="controlTitle">Controls</h3>
      <div className="row controlContainer">
        <div>
          <h3 className="indicatorTitle">Keyboard</h3>
          <button className="keyBtn" onClick={connectKeys}>
            <KeyBoardControl
              active={active}
              char={playerNum === 1 ? "W" : <AiOutlineArrowUp />}
            />
            <KeyBoardControl
              active={active}
              char={playerNum === 1 ? "S" : <AiOutlineArrowDown />}
            />
          </button>
        </div>
        <div>
          <h3 className="indicatorTitle">Mobile</h3>
          <div
            className={`mobileIndicator neonBorder ${active(devices.mobile)}`}
          >
            <span id="mobileText">{mobileCode[`player${playerNum}`]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChoosePlayer;

interface KeyProps {
  active: (device: string) => string | false;
  char: string | React.ReactNode;
}
const KeyBoardControl = ({ char, active }: KeyProps) => {
  return (
    <div className={`keyIndicator neonBorder ${active(devices.keys)}`}>
      <p className="centerAbs keyBtnText">{char}</p>
    </div>
  );
};
