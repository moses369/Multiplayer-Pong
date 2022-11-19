import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux";
import {
  createSession,
  joinSession,
  leaveSession,
  setPlayer,
} from "../../redux/features/menu-slice";
const Menu = () => {
  const dispatch = useDispatch();
  const { host, sessionPassword, socket, inSession } = useSelector(
    ({
      menu: { host, sessionPassword, inSession },
      socket: { socket },
    }: RootState) => ({
      host,
      sessionPassword,
      socket,
      inSession,
    })
  );
  const [joinVal, setJoinVal] = useState<string>("");

  const [error, setError] = useState<boolean>(false);
  const leave = useCallback(() => {
    sessionPassword && socket.emit("LEAVE_SESSION", sessionPassword);
    dispatch(leaveSession());
  }, [socket, sessionPassword]);
  useEffect(() => {
    !inSession && leave();
  }, [inSession]);
  useEffect(() => {
    host && socket.emit("CREATE_SESSION", sessionPassword);
  }, [sessionPassword, host]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setJoinVal(e.target.value.toUpperCase());
  const submitSessionID = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      socket.emit("JOIN_SESSION", joinVal, (foundSession: boolean) => {
        if (foundSession) {
          dispatch(joinSession(joinVal));
        } else {
          setError(true);
        }
        setJoinVal("");
      });
    }
  };
  return (
    <>
      <h1>PONG</h1>
      {!inSession ? (
        <div>
          <div>
            <button
              onClick={() => {
                dispatch(createSession());
              }}
            >
              <h3>Create Game</h3>
            </button>
          </div>
          <div>
            <h3>Join Game</h3>
            <label htmlFor="join">Insert Password</label>
            <input
              type="text"
              name="join"
              value={joinVal}
              onChange={handleChange}
              onKeyDown={submitSessionID}
            />
            {error && <p>Session Not Found</p>}
          </div>
        </div>
      ) : (
        <>
          <button onClick={() => leave()}>Back</button>
          <p>{host ? `${sessionPassword} Host` : sessionPassword}</p>
          <ChoosePlayer playerNum={1} />
          <ChoosePlayer playerNum={2} />
        </>
      )}{" "}
    </>
  );
};
export default Menu;
interface ChoosePlayerProps {
  playerNum: 1 | 2;
}
const ChoosePlayer = ({ playerNum }: ChoosePlayerProps) => {
  const dispatch = useDispatch();
  const { sessionPassword, socket, player } = useSelector(
    ({ menu: { sessionPassword, player }, socket: { socket } }: RootState) => ({
      sessionPassword,
      socket,
      player,
    })
  );
  const [playerSelected, setPlayerSelected] = useState({
    player1: null,
    player2: null,
  });
  const updateDevice = (device: string) => {
    socket.emit("CONNECT_PLAYER", sessionPassword, playerNum, device);
    setPlayerSelected((old) => ({ ...old, [`player${playerNum}`]: device }));
  };
  const connectPlayer = (device: string, playerButton: 1 | 2) => {
    console.log("selected player", device, player);
    if (!playerSelected[`player${playerNum}`] && !player) {
      dispatch(setPlayer(playerNum));
      updateDevice(device);
    } else if (playerButton === player) {
      updateDevice(device);
    }
  };

  useEffect(() => {
    socket.on("PLAYER_CONNECTED", (player, device) => {
      console.log(player, device);

      setPlayerSelected((old) => ({ ...old, [`player${player}`]: device }));
    });
  }, [socket]);
  const active = (device:string) =>({
    border: playerSelected[`player${playerNum}`] === device ? "1px solid red" : "",
  });
  return (
    <div>
      <h3>{`Player ${playerNum}`}</h3>
      <p>
        {playerNum === 1 ? "Left" : "Right"} Paddle{" "}
        {playerSelected[`player${playerNum}`] && `Selected`}
      </p>
      <button
        style={active("keyboard")}
        onClick={() => connectPlayer("keyboard", playerNum)}
      >
        Keyboard
      </button>
      <button style={active("mobile")} onClick={() => connectPlayer("mobile", playerNum)}>
        Mobile
      </button>
    </div>
  );
};
