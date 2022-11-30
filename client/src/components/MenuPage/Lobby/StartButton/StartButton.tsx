import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../../redux";

import "./StartButton.css";
const StartButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket, host, local, sessionId, isMobile } = useSelector(
    ({
      socket: { socket },
      menu: { host, local, sessionId, isMobile },
    }: RootState) => ({
      socket,
      host,
      local,
      sessionId,
      isMobile,
    })
  );
  const [allReady, setAllReady] = useState<boolean>(false); //Determines if everyone readyed up
  /**
   * If local allow the player to start whenever
   */
  useEffect(() => {
    setAllReady(local);
  }, [local]);

  /**
   * Listens for socket events
   */
  useEffect(() => {
    // If all players connected set ready to start to true
    socket.on("READY_TO_START", () => {
      setAllReady(true);
      console.log("Ready");
    });
    // If a mobile phone controller disconnected set it to false
    socket.on("MOBILE_DISCONNECT", () => {
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
      socket.removeListener("READY_TO_START");
      socket.removeListener("MOBILE_DISCONNECT");
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
      className=" neonButton neonText neonBorder"
      onClick={start}
    >
      Start
    </button>
  );
};

export default StartButton;
