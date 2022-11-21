import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux";
import { MobileCodes } from "../../redux/features/menu-slice";

interface ChoosePlayerProps {
  playerNum: 1 | 2;
}
const ChoosePlayer = ({ playerNum }: ChoosePlayerProps) => {
  const dispatch = useDispatch();
  const { sessionId, socket, player, mobileCode } = useSelector(
    ({
      menu: { sessionId, player, mobileCode },
      socket: { socket },
    }: RootState) => ({
      sessionId,
      socket,
      player,
      mobileCode,
    })
  );

  const [deviceSelected, setDeviceSelected] = useState<MobileCodes>({
    player1: "",
    player2: "",
  });
  const devices = { mobile: "mobile", keys: "keyboard" };
  const accessDeviceSelected = () => deviceSelected[`player${playerNum}`];

  const connectPlayer = (device: string) => {
    if (playerNum === parseInt(player[6])) {
      socket.emit("CONNECT_PLAYER", sessionId, player, device);
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
      {accessDeviceSelected() !== devices.mobile ? (
        <button
          style={active(devices.mobile)}
          onClick={() => connectPlayer(devices.mobile)}
        >
          Mobile
        </button>
      ) : (
        <p>Enter code in Join Session {mobileCode[`player${playerNum}`]}</p>
      )}
    </div>
  );
};
export default ChoosePlayer;
