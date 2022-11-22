import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";
import { MobileCodes } from "../../../redux/features/menu-slice";

interface ChoosePlayerProps {
  playerNum: 1 | 2;
}
const ChoosePlayer = ({ playerNum }: ChoosePlayerProps) => {
  const { sessionId, socket, player, mobileCode,local } = useSelector(
    ({
      menu: { sessionId, player, mobileCode,local },
      socket: { socket },
    }: RootState) => ({
      sessionId,
      socket,
      player,
      mobileCode,local
    })
  );

  const [deviceSelected, setDeviceSelected] = useState<MobileCodes>({
    player1: "",
    player2: "",
  });
  const devices = { mobile: "mobile", keys: "keyboard" };
  const accessDeviceSelected = () => deviceSelected[`player${playerNum}`];

  const connectPlayer = (device: string) => {
    if (playerNum === parseInt(player[6]) || local) {
      !local && socket.emit("CONNECT_PLAYER", sessionId, player, device);
      setDeviceSelected((old) => ({ ...old, [`player${playerNum}`]: device }));
    }
  };

  useEffect(() => {
    socket.on("PLAYER_CONNECTED", (player, device) => {
      console.log(player, device);

      setDeviceSelected((old) => ({ ...old, [player]: device }));
    });
  }, [socket]);
  const active = (device: string) => ({
    border: accessDeviceSelected() === device ? "1px solid red" : "",
  });
  return (
    <div>
      <h3>{`Player ${playerNum}`}</h3>
      <p>
        {playerNum === 1 ? "Left" : "Right"} Paddle{" "}
        {accessDeviceSelected() && `Selected`}
      </p>
      <button
        style={active(devices.keys)}
        onClick={() => connectPlayer(devices.keys)}
      >
        Keyboard
      </button>
      <button
        style={active(devices.mobile)}
      >
        Mobile
      </button>
      <p>Enter code in Join Session {mobileCode[`player${playerNum}`]}</p>
    </div>
  );
};
export default ChoosePlayer;
