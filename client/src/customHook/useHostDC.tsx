import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux";

import { leaveSession } from "../redux/features/menu-slice";

const useHostDC = () => {
    
  const dispatch = useDispatch();
  const { socket } = useSelector((state: RootState) => ({
    socket: state.socket.socket,
  }));
  useEffect(() => {
    socket.on("HOST_DISCONNECTED", () => {
        console.log('host disconected');
        
      dispatch(leaveSession());
    });
  }, [socket]);
};

export default useHostDC;
