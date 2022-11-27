import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux";
import {
  createSession,
  joinSession,
  MobileCodes,
} from "../../../redux/features/menu-slice";

import "./Menu.css";

const Menu = () => {
  const dispatch = useDispatch();

  const { socket } = useSelector(({ socket: { socket } }: RootState) => ({
    socket,
  }));
  const [joinVal, setJoinVal] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setJoinVal(e.target.value.toUpperCase());
  const submitSessionID = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      socket.emit(
        "JOIN_SESSION",
        joinVal,
        (foundSession: boolean, mobileCodes: MobileCodes) => {
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
            socket.emit(
              "CREATE_SESSION",
              (id: string, mobileCodes: MobileCodes) => {
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
            placeholder="Session ID"
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
export default Menu;
