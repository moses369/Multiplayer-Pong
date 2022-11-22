import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux";
import { startGame } from "../../../redux/features/menu-slice";

const StartButton = () => {
  const dispatch = useDispatch();
  const { socket, host, local } = useSelector(
    ({ socket: { socket }, menu: { host, local } }: RootState) => ({
      socket,
      host,
      local,
    })
  );
  const [allReady, setAllReady] = useState<boolean>(false);
  useEffect(() => {
    setAllReady(local);
  }, [local]);
  useEffect(() => {
    socket.on("READY_TO_START", () => {
      setAllReady(true);
    });
  }, [socket, setAllReady]);
  return (
    <button onClick={() => host && allReady && dispatch(startGame())}>
      Start
    </button>
  );
};

export default StartButton;
