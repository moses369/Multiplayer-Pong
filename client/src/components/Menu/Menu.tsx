import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux";
import {
  createSession,
  joinSession,
  leaveSession,
  MobileCodes,
} from "../../redux/features/menu-slice";

import ChoosePlayer from "../ChoosePlayer/ChoosePlayer";
const Menu = () => {
  const dispatch = useDispatch();
  const { host, sessionId, socket, inSession } = useSelector(
    ({
      menu: { host, sessionId, inSession },
      socket: { socket },
    }: RootState) => ({
      host,
      sessionId,
      socket,
      inSession,
    })
  );
  const [joinVal, setJoinVal] = useState<string>("");

  const [error, setError] = useState<boolean>(false);
  const leave = useCallback(() => {
    sessionId && socket.emit("LEAVE_SESSION", sessionId);
    dispatch(leaveSession());
  }, [socket, sessionId]);
  useEffect(() => {
    !inSession && leave();
  }, [inSession]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setJoinVal(e.target.value.toUpperCase());
  const submitSessionID = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      socket.emit("JOIN_SESSION", joinVal, (foundSession: boolean,mobileCodes:MobileCodes) => {
        if (foundSession) {
          
          
          dispatch(joinSession({sessionId:joinVal,mobileCodes}));
        } else {
          setError(true);
        }
        setJoinVal("");
      });
    }
  };
  return (
    <>
      <h1>PONG</h1>
      {!inSession ? (
        <div>
          <div>
            <button
              onClick={() => {
                dispatch(createSession(socket));
              }}
            >
              <h3>Create Game</h3>
            </button>
          </div>
          <div>
            <h3>Join Game</h3>
            <label htmlFor="join">Insert Password</label>
            <input
              type="text"
              name="join"
              value={joinVal}
              onChange={handleChange}
              onKeyDown={submitSessionID}
            />
            {error && <p>Session Not Found</p>}
          </div>
        </div>
      ) : (
        <>
          <button onClick={() => leave()}>Back</button>
          <p>{host ? `${sessionId} Host` : sessionId}</p>
          <ChoosePlayer playerNum={1} />
          <ChoosePlayer playerNum={2} />
        </>
      )}{" "}
    </>
  );
};
export default Menu;

