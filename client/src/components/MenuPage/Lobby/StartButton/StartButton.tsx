import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../../redux";

import "./StartButton.css";
const StartButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket, host, local, sessionId, isMobile,readyStatus } = useSelector(
    (state: RootState) => ({
      socket:state.socket.socket,
      host:state.menu.host,
      local:state.menu.local,
      sessionId:state.menu.sessionId,
      isMobile:state.menu.isMobile,
      readyStatus:state.menu.readyStatus
    })
  );
  const [allReady, setAllReady] = useState<boolean>(false); //Determines if everyone readyed up
  /**
   * If local allow the player to start whenever
   */
  useEffect(() => {
    setAllReady(local);
    if(readyStatus.player1 && readyStatus.player2){
      setAllReady(true)
    }
  }, [local,readyStatus]);

  /**
   * Listens for socket events
   */
  useEffect(() => {
    // If a mobile phone controller disconnected set it to false
    socket.on("PLAYER_DISCONNECTED", () => {
      setAllReady(false);
    });

    // If not the host and not a controller navigate to the game board
    if (!host && !isMobile) {
      socket.on("START_GAME", () => {
        console.log("host started game");

        navigate("/game");
      });
    }
    return () => {
      socket.removeListener("START_GAME");
      socket.removeListener("PLAYER_DISCONNECTED");
    };
  }, [socket, setAllReady, host, isMobile]);

  /**
   * On click of start button, only the host and if everuone is ready it will start the game
   */
  const start = () => {

    if (host && allReady) {
      navigate("/game");
      socket.emit("STARTING_GAME", sessionId);
    }
  };
  return (
    <button
      id="start"
      className={`${allReady ? 'ready':''} neonButton neonText neonBorder`}
      onClick={start}
      style={{
        pointerEvents:
          (allReady ? "auto" : "none")
      }}
    >
      Start
    </button>
  );
};

export default StartButton;
