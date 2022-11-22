import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../redux";

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
  const [allReady, setAllReady] = useState<boolean>(false);
  useEffect(() => {
    setAllReady(local);
  }, [local]);
  useEffect(() => {
    socket.on("READY_TO_START", () => {
      setAllReady(true);
      console.log("Ready");
    });
    socket.on("MOBILE_DISCONNECT", () => {
      setAllReady(false);
    });
    if (!host && !isMobile) {
      socket.on("START_GAME", () => {
        console.log("host started game");

        navigate("/game");
      });
    } else {
      socket.removeListener("START_GAME");
    }
  }, [socket, setAllReady, host, isMobile]);
  useEffect(() => {
    if (host) console.log(allReady);
  }, [allReady, host]);

  const start = () => {
    console.log(host && allReady);

    if (host && allReady) {
      navigate("/game");
      socket.emit("STARTING_GAME", sessionId);
    }
  };
  return <button onClick={start}>Start</button>;
};

export default StartButton;
