import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import {
  playerDisconnect,
  toggleReady,
  updateMobileConnection,
} from "../redux/features/menu-slice";

import { PlayerChoices, players } from "../util/types";
import { useEffect, useState } from "react";
import { syncPongPosition } from "../redux/features/game-slice";
/**
 * Listens for guest connections and syncs pong postion fr guest
 */
const usePlayerConnectsInLobby = (setGuestConnected: React.Dispatch<React.SetStateAction<boolean>>) => {
    const dispatch = useDispatch();
    const { host, sessionId, socket, local, pongStartPos } = useSelector(
      (state: RootState) => ({
        host: state.menu.host,
        sessionId: state.menu.sessionId,
        socket: state.socket.socket,
        local: state.menu.local,
        pongStartPos: state.game.pongStartPos,
      })
    );
  
    useEffect(() => {
        socket.on("PLAYER_CONNECTED", (playerConnected, mobileConnected) => {
          if (host && !mobileConnected) {
            socket.emit(
              "PONG_POSITION",
              sessionId,
              pongStartPos
            );
          }
        setGuestConnected(true);
          dispatch(
            updateMobileConnection({ player: playerConnected, mobileConnected })
          );
          console.log(playerConnected, "connected", 'did mobile connect', mobileConnected);
        });
  
        socket.on("PLAYER_READY_UP", (player: PlayerChoices) => {
          dispatch(toggleReady(player));
        });
  
        host &&
          socket.on("PLAYER_DISCONNECTED", () => {
            console.log("Player left");
            setGuestConnected(false);
            dispatch(playerDisconnect(players.two));
          });

        socket.on("MOBILE_DISCONNECTED", (player) => {
          dispatch(updateMobileConnection({ player, mobileConnected: false }));
        });

        !host &&
          socket.on("SYNC_PONG", (top, left, up, horizontal) => {
            dispatch(syncPongPosition({ top, left, up, horizontal }));
          });

      return () => {
        socket.removeListener("PLAYER_CONNECTED");
        socket.removeListener("PLAYER_READY_UP");
        socket.removeListener("PLAYER_DISCONNECTED");
        socket.removeListener("MOBILE_DISCONNECTED");
        socket.removeListener("SYNC_PONG");
      };
    }, [local]);


}

export default usePlayerConnectsInLobby