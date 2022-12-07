import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";
import { RootState } from "../../redux";
import { leaveSession, isController } from "../../redux/features/menu-slice";
import { PlayerChoices } from "../../util/types";

import Lobby from "../../components/MenuPage/Lobby/Lobby";
import MenuNav from "../../components/MenuPage/MainMenu/MenuNav/MenuNav";
import ServerSelect from "../../components/MenuPage/MainMenu/ServerSelect/ServerSelect";
import Rules from "../../components/MenuPage/MainMenu/Rules/Rules";

import "./MenuPage.css";
import useLeaveSession from "../../customHook/useLeaveSession";
const MenuPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket, inSession } = useSelector((state: RootState) => ({
    socket: state.socket.socket,
    inSession: state.menu.inSession,
  }));
  const [showRules, setShowRules] = useState(false);
  const leave = useLeaveSession();
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
  const toggleModal = () => {
    setShowRules((show) => !show);
  };
  return (
    <div className="menu neonText">
      <h1 id="title">PONG</h1>
      {!inSession ? (
        <>
          <MenuNav />
          <button
            onClick={toggleModal}
            className="neonText neonButton neonBorder help"
          >
            ?
          </button>

          <div className="row menuBody">
            <ServerSelect />
            <span id="notInModal">
              {" "}
              <Rules />
            </span>
          </div>
          <ReactModal
            onRequestClose={toggleModal}
            className={"rulesModal neonBorder centerAbs neonText"}
            overlayClassName={`modalOverlay`}
            isOpen={showRules}
            children={<Rules inModal />}
          />
        </>
      ) : (
        <>
          <Lobby />
        </>
      )}
    </div>
  );
};

export default MenuPage;
