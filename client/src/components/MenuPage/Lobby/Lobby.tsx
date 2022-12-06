
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux";

import {
  setLocal,
  updateMobileConnection,
} from "../../../redux/features/menu-slice";

import ChoosePlayer from "./ChoosePlayer/ChoosePlayer";
import StartButton from "./StartButton/StartButton";
import ControlsDisplay, { SlideControls } from './ControlsDisplay/ControlsDisplay'
import "./Lobby.css";

interface Lobby {
  leave: () => void;
}
const Lobby = ({ leave }: Lobby) => {
  const dispatch = useDispatch();
  const { host, sessionId, socket, local } = useSelector(
    (state: RootState) => ({
      host: state.menu.host,
      sessionId: state.menu.sessionId,
      socket: state.socket.socket,
      local: state.menu.local,
    })
  );

  return (
    <div className={`${!host && "guest"} lobyyContainer neonBorder`}>
      <div className="row lobbyNav">
        <button
          className="neonButton neonText neonBorder"
          onClick={() => leave()}
        >
          Back
        </button>

        {host ? (
          <>
            <SessionID className="pcID" />
            <button
              className="neonButton neonText neonBorder changeSatusBtn"
              onClick={() => {
                //Updates wether the session is local or online
                socket.emit("UPDATE_LOCAL", sessionId);
                dispatch(setLocal());
                dispatch(
                  updateMobileConnection({
                    player: "player2",
                    mobileConnected: false,
                  })
                );
              }}
            >
              {local ? "Local" : "Online"}
            </button>
          </>
        ) : (
          <SessionID />
        )}
      </div>
      {host && <SessionID className="mobileID" />}
      <ControlsDisplay />
      <div>
        <div className="row lobbyPlayer">
          {" "}
          <ChoosePlayer playerNum={1} />
          <SlideControls/>
          <ChoosePlayer playerNum={2} />
        </div>
      </div>
      <StartButton />
    </div>
  );
};

export default Lobby;

const SessionID = ({ className }: { className: string }) => {
  const sessionId = useSelector(
    ({ menu: { sessionId } }: RootState) => sessionId
  );
  return <h2 className={`${className} id`}>Session ID: {sessionId}</h2>;
};
SessionID.defaultProps = {
  className: "",
};



