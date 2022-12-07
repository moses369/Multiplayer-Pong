import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "../redux";
import { resetGame } from "../redux/features/game-slice";
import { leaveSession } from "../redux/features/menu-slice";
/**
 * 
 * @returns a function used to leave the game session
 */
const useLeaveSession = () => {
  const dispatch = useDispatch();
  const { sessionId, socket } = useSelector((state: RootState) => ({
    sessionId: state.menu.sessionId,
    socket: state.socket.socket,
  }));
  /**
   * Used to leave the session
   */
return useCallback(() => {
    if (sessionId) {
      console.log("left");

      socket.emit(
        "LEAVE_SESSION",
        sessionId,
        sessionStorage.getItem(sessionId)
      );
      dispatch(leaveSession());
      dispatch(resetGame())
    }
  }, [sessionId]);

};

export default useLeaveSession;
