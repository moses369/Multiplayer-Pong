import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux";
import { setLocal } from "../../../redux/features/menu-slice";

import ChoosePlayer from "./ChoosePlayer/ChoosePlayer";
import StartButton from "./StartButton/StartButton";

import "./Lobby.css";

interface Lobby {
  leave: () => void;
}
const Lobby = ({ leave }: Lobby) => {
  const dispatch = useDispatch();
  const { host, sessionId, socket, local } = useSelector(
    ({ menu: { host, sessionId, local }, socket: { socket } }: RootState) => ({
      host,
      sessionId,
      socket,
      local,
    })
  );
  return (
    <div className="lobyyContainer neonBorder">
      <div className="row lobbyNav">
        <button
          className="neonButton neonText neonBorder"
          onClick={() => leave()}
        >
          Back
        </button>

        {host ? (
          <>
            <SessionID />
            <button
              className="neonButton neonText neonBorder changeSatusBtn"
              onClick={() => {
                //Updates wether the session is local or online
                socket.emit("UPDATE_LOCAL", sessionId);
                dispatch(setLocal());
                
              }}
            >
              {local ? "Local" : "Online"}
            </button>
          </>
        ) : (
          <SessionID />
        )}
      </div>
      <div className="row lobbyPlayer" >

      <ChoosePlayer playerNum={1} />
      <ChoosePlayer playerNum={2} />
      </div>
      <StartButton />
    </div>
  );
};

export default Lobby;

const SessionID = () => {
  const sessionId = useSelector(
    ({ menu: { sessionId } }: RootState) => sessionId
  );
  return <h2>Session ID: {sessionId}</h2>;
};
