import { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux";
import { leaveSession, isController } from "../../redux/features/menu-slice";

import MenuNav from "../../components/MenuPage/MainMenu/MenuNav/MenuNav";
import Lobby from "../../components/MenuPage/Lobby/Lobby";

import "./MenuPage.css";
import { PlayerChoices } from "../../util/types";
import ServerSelect from "../../components/MenuPage/MainMenu/ServerSelect/ServerSelect";

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
  /**
   * Used to leave the session
   */
  const leave = useCallback(() => {
    if (sessionId) {
      console.log("left");

      socket.emit("LEAVE_SESSION", sessionId);
      dispatch(leaveSession());
    }
  }, [sessionId]);
  /**
   * If the player is not in a session leave the lobby and reset the session info
   */
  useEffect(() => {
    !inSession && leave();
  }, [inSession]);
  /**
   * If a controller connected send them to the controller page
   */
  useEffect(() => {
    socket.on("CONNECT_MOBILE", (player: PlayerChoices) => {
      dispatch(isController(player));

      navigate("/controller");
    });
    return () => {
      socket.removeListener("CONNECT_MOBILE");
    };
  }, []);
  return (
    <div className="menu neonText">
      <h1 id="title">PONG</h1>
      {!inSession ? (
        <>
          <MenuNav />
          <ServerSelect />
        </>
      ) : (
        <Lobby leave={leave} />
      )}
    </div>
  );
};

export default MenuPage;
