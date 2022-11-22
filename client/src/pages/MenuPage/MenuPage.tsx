import { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux";
import { leaveSession, setPlayer } from "../../redux/features/menu-slice";

import Menu from "../../components/MenuPage/Menu/Menu";
import Lobby from "../../components/MenuPage/Lobby/Lobby";

import './MenuPage.css'

const MenuPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { host, sessionId, socket, inSession, local } = useSelector(
    ({
      menu: { host, sessionId, inSession, local },
      socket: { socket },
    }: RootState) => ({
      host,
      sessionId,
      socket,
      inSession,
      local,
    })
  );
  const leave = useCallback(() => {
    sessionId && socket.emit("LEAVE_SESSION", sessionId);
    dispatch(leaveSession());
  }, [socket, sessionId]);

  useEffect(() => {
    !inSession && leave();
  }, [inSession]);

  useEffect(() => {
    socket.on("CONNECT_MOBILE", (player: "player1" | "player2") => {
      dispatch(setPlayer(player));
      navigate("/controller");
    });
  }, [socket]);
  return (
    <div className="menu" >

      <h1>PONG</h1>
      {!inSession ? <Menu /> : <Lobby leave={leave} />}
    </div>
  );
};

export default MenuPage;
