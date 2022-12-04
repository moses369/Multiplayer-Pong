import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../redux";
import {
  createSession,
  joinSession,
} from "../../../../redux/features/menu-slice";
import { PlayerOptions } from "../../../../util/types";

import "./MenuNav.css";

const MenuNav = () => {
  const dispatch = useDispatch();

  const { socket } = useSelector(({ socket: { socket } }: RootState) => ({
    socket,
  }));
  const [joinVal, setJoinVal] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setJoinVal(e.target.value.toUpperCase());

    /**
     * If the session is real join it, otherwise display an error
     */
  const submitSessionID = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      socket.emit(
        "JOIN_SESSION",
        joinVal,
        (foundSession: boolean, mobileCodes: PlayerOptions<string>) => {
          if (foundSession) {
            dispatch(joinSession({ sessionId: joinVal, mobileCodes }));
          } else {
            setError(true);
          }
          setJoinVal("");
        }
      );
    }
  };
  return (
    <>
      <div className="row join_container">
        <button
          className="neonButton neonText neonBorder"
          onClick={() => {
            //Creates a new session
            socket.emit(
              "CREATE_SESSION",
              (id: string, mobileCodes: PlayerOptions<string>) => {
                //uses the session id and mobile codes returned from the server
                dispatch(createSession({ sessionId: id, mobileCodes }));
              }
            );
          }}
        >
          <h3>Create Game</h3>
        </button>

        <div className="formInput neonText">
          {error && <p>Session Not Found</p>}
          <input
          className="neonBorder neonText"
            type="text"
            name="join"
            placeholder="Session/Mobile ID"
            autoComplete="off"
            maxLength={6}
            value={joinVal}
            onChange={handleChange}
            onKeyDown={submitSessionID}
          />
          <label  htmlFor="join">
            <h3 id='joinLabel'>Join Game</h3>
          </label>

        </div>
      </div>
    </>
  );
};
export default MenuNav;
