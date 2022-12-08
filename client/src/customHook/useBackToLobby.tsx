import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux";
import { players } from "../util/types";
import { resetGame } from "../redux/features/game-slice";
import { toggleReady } from "../redux/features/menu-slice";
import { useNavigate } from "react-router-dom";
const useBackToLobby = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket, sessionId } = useSelector((state: RootState) => ({
    sessionId: state.menu.sessionId,
    socket: state.socket.socket,
  }));
  return () => {
    navigate("/");
    dispatch(resetGame());
    dispatch(toggleReady(players.one));
    dispatch(toggleReady(players.two));
    socket.emit("BACK_TO_LOBBY", sessionId);
  };
};

export default useBackToLobby;
