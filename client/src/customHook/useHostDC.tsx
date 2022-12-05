import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux";
import { useNavigate, useLocation } from "react-router-dom";

import { leaveSession } from "../redux/features/menu-slice";
import { deleteServer } from "../redux/features/serverList-slice";

const useHostDC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, sessionId, inSession } = useSelector((state: RootState) => ({
    socket: state.socket.socket,
    sessionId: state.menu.sessionId,
    inSession: state.menu.inSession,
  }));
  /**
   * If player is not in a session and not already in the menu, move them to the menu
   */
  const goHomeIfNotinSesison = () => {
    if (location.pathname !== "/" && !inSession) {
      navigate("/");
      dispatch(leaveSession());
    }
  };
  useEffect(() => {
    goHomeIfNotinSesison();
    return () => {
      goHomeIfNotinSesison();
    };
  }, [inSession]);
  /**
   * If the host discontted reset the session info and delete it from the users server list
   */
  useEffect(() => {
    socket.on("HOST_DISCONNECTED", () => {
      console.log("host disconected");
      socket.emit("LEAVE_SESSION", sessionId);
      location.pathname !== "/" && navigate("/");
      dispatch(deleteServer(sessionId));
      dispatch(leaveSession());
    });
    return () => {
      socket.removeListener("HOST_DISCONNECTED");
    };
  }, [sessionId]);
};

export default useHostDC;
