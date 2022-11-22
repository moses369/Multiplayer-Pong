import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux";
import {
  createSession,
  joinSession,
  MobileCodes,
} from "../../../redux/features/menu-slice";

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
      <div>
        <div>
          <button
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
    </>
  );
};
export default Menu;
