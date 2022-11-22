import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux";
import { useNavigate, useLocation } from "react-router-dom";

import { leaveSession } from "../redux/features/menu-slice";

const useHostDC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, sessionId, inSession } = useSelector((state: RootState) => ({
    socket: state.socket.socket,
    sessionId: state.menu.sessionId,
    inSession: state.menu.inSession,
  }));
  useEffect(() => {
    location.pathname !== "/" && !inSession && navigate("/");
  }, [inSession]);
  useEffect(() => {
    socket.on("HOST_DISCONNECTED", () => {
      console.log("host disconected");
      socket.emit("LEAVE_SESSION", sessionId);
      location.pathname !== "/" && navigate("/");
      dispatch(leaveSession());
    });
  }, [socket]);
};

export default useHostDC;
