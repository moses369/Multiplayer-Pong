import React, { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux";
import { joinSession } from "../../../../redux/features/menu-slice";
import {
  addServer,
  deleteServer,
  updateServer,
  Server,
  fillServerList,
} from "../../../../redux/features/serverList-slice";
import { PlayerOptions } from "../../../../util/types";
import "./ServerSelect.css";

const ServerSelect = () => {
  const dispatch = useDispatch();
  const { socket, servers } = useSelector((state: RootState) => ({
    socket: state.socket.socket,
    servers: state.serverList.servers,
  }));

  useEffect(() => {
    if (servers.length === 0) {
      socket.emit("GET_SERVERS", (newServers: Server[]) => {
        if (newServers.length > 0) {
          console.log("Got servers");
          dispatch(fillServerList(newServers));
        }
      });
    }
    socket.on(
      "UPDATE_SERVERLIST",
      (server: Server, alreadySent: boolean, deleted: boolean) => {
        if (!alreadySent) {
          console.log("add server");

          dispatch(addServer(server));
        } else if (!deleted) {
          console.log('update server');
          
          dispatch(updateServer(server));
        } else if (deleted) {
          console.log('delete server');
          
          dispatch(deleteServer(server.id));
        }
      }
    );

    return () => {
      socket.removeListener("UPDATE_SERVERLIST");
    };
  }, []);

  const joinGame = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { id } = e.currentTarget.dataset;
    id &&
      socket.emit(
        "JOIN_SESSION",
        id,
        (foundSession: boolean, mobileCodes: PlayerOptions<string>) => {
          if (foundSession) {
            dispatch(joinSession({ sessionId: id, mobileCodes }));
          }
        }
      );
  };
  return (
    <div
      className={`serverContainer neonBorder ${
        servers.length === 0 && "emptyServers"
      }`}
    >
      <table>
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Players</th>
            <th>Join Game</th>
          </tr>
        </thead>
        <tbody>
          {servers.map(({ id, connectedPlayers }) => {
            return (
              <tr className="topRow" key={id}>
                <td>{id}</td>
                <td>{connectedPlayers}/2</td>
                <td>
                  <button
                    data-id={id}
                    onClick={joinGame}
                    style={{
                      pointerEvents: `${
                        connectedPlayers >= 2 ? "none" : "auto"
                      }`,
                    }}
                    className=" joinButton neonBorder neonText neonButton"
                  >
                    Join
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ServerSelect;
