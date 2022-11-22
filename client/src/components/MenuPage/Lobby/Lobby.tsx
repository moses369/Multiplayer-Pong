import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../redux";
import {
  createSession,
  joinSession,
  leaveSession,
  MobileCodes,
  setLocal,
  setPlayer,
} from "../../../redux/features/menu-slice";

import ChoosePlayer from '../ChoosePlayer/ChoosePlayer'
import StartButton from '../StartButton/StartButton'
interface Lobby {
    leave: () => void;
}
const Lobby = ({leave}:Lobby) => {
    const dispatch = useDispatch()
    const { host, sessionId, socket,  local } = useSelector(
        ({
          menu: { host, sessionId,  local },
          socket: { socket },
        }: RootState) => ({
          host,
          sessionId,
          socket,
          
          local,
        })
      );
  return (
    <>
    <button onClick={() => leave()}>Back</button>
    <button
      onClick={() => {
        if(host){ 
          socket.emit('UPDATE_LOCAL',sessionId)
          dispatch(setLocal())};
      }}
    >
      {local ? "Local" : "Online"}
    </button>
    <p>{host ? `${sessionId} Host` : sessionId}</p>
    <ChoosePlayer playerNum={1} />
    <ChoosePlayer playerNum={2} />
    <StartButton />
  </>
  )
}

export default Lobby