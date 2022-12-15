import express from "express";
import http from "http";
import "dotenv/config";
import { Server } from "socket.io";
const app: express.Application = express();
const server = http.createServer(app);

const { PORT } = process.env;
const io = new Server(server, { cors: { origin: "*" } });

/**
 * The sessions that are currently active
 */
const sessions: Sessions = {};
const connections = new Map<string, string>();
const newConnection = (id: string, role: Role) => `${id}${role}`;
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    const details = connections.get(socket.id);
    if (details) {
      const sessionID = details.substring(0, 4);
      const role = details.substring(4);

      if (sessions[sessionID]) {
        const session = sessions[sessionID];

        setTimeout(() => {
          const sessionDetail =
            role === "guest" || role === "host"
              ? session[role]
              : role === "player1" || role === "player2"
              ? session[role].mobile
              : null;
          if (sessionDetail?.socketId === socket.id) {
            console.log("They is gone", sessionID, role);
            sessionDetail.connected = false;
            if (role === "host") {
              io.emit(
                "UPDATE_SERVERLIST",
                { sessionID, connectedPlayers: 0 },
                true, // if the session is already on the server list client side
                true // if the session is being deleted
              );
              io.to(sessionID).emit("HOST_DISCONNECTED", () => {
                io.socketsLeave(sessionID);
                delete sessions[sessionID];
              });
            } else if (role === "guest") {
              session.guest.connected = false;
              session.player2.mobile.connected = false;
              session.player2.ready = false;
              socket.to(session.host.socketId).emit("PLAYER_DISCONNECTED");
              socket.broadcast.emit(
                "UPDATE_SERVERLIST",
                { sessionID, connectedPlayers: 1 },
                true, // if the session is already on the server list client side
                false // if the session is being deleted
              );
            } else if (role === "player1" || role === "player2") {
              session[role].mobile.connected = false;
              socket.to(sessionID).emit("MOBILE_DISCONNECTED", role);
            }
          }
          connections.delete(socket.id);
        }, 3_000);
      }
    }
    console.log();
  });
  /**
   * Rejoining the room after refreshing the page
   */
  socket.on("RE_JOIN", (id, role: Role) => {
    if (sessions[id]) {
      role === "guest" || role === "host"
        ? (sessions[id][role].socketId = socket.id)
        : (sessions[id][role].mobile.socketId = socket.id);
      connections.set(socket.id, newConnection(id, role));
      if (role === "guest")
        socket.to(id).emit("PLAYER_CONNECTED", "player2", false);
      if (role === "player2" || role === "player1")
        socket.to(id).emit("PLAYER_CONNECTED", role, true);
      socket.join(id);
    }
  });
  /**
   *Listens for new sessions
   */
  socket.on("CREATE_SESSION", (sendIdsBack) => {
    const generatedId = checkIdIsNotTaken(sessions); //The generated id

    //Creates a empty player object for the session object
    const player = (): Player => ({
      mobile: { connected: false, socketId: "" },
      mobileCode: createMobileCode(generatedId),
      ready: false,
    });
    //Generates an initial session object
    sessions[generatedId] = {
      player1: player(),
      player2: player(),
      host: { connected: true, socketId: socket.id },
      guest: { connected: false, socketId: "" },
      local: false,
    };
    connections.set(socket.id, newConnection(generatedId, "host"));
    //The mobile codes to send back to the client
    const mobileCode = {
      player1: sessions[generatedId].player1.mobileCode,
      player2: sessions[generatedId].player2.mobileCode,
    };
    //Sends the sessionID and mobilecodes back to the client
    sendIdsBack(generatedId, mobileCode);
    socket.join(generatedId); //Joins the session room
    // Sends an event to update the server list
    socket.broadcast.emit(
      "UPDATE_SERVERLIST",
      { id: generatedId, connectedPlayers: 1 },
      false // if the session is already on the server list client side
    );
    console.log(` created session ${generatedId}`, sessions[generatedId]);
    console.log(io.sockets.adapter.rooms.get(generatedId), "\n");
  });
  /**
   * Listens for when a user attempts to join a session
   */
  socket.on("JOIN_SESSION", (id: string, callback) => {
    const sessionID = id.substring(0, 4); //Parses the first 4 letters to get the id in case of a mobile join

    const session = sessions[sessionID]; //finds the session
    /**
     * Sends back to the client if the session is real, if it is checks if its local, if its local
     * it sends the session is not found unless it is a mobile controller connecting
     */
    callback(
      session
        ? !session?.local || (session?.local && id.length > 4)
          ? true
          : false
        : false,
      {
        player1: session?.player1.mobileCode,
        player2: session?.player2.mobileCode,
      }
    );
    /**
     * Runs if the session is real, or if its local and its a controller joining
     */
    if (session || (sessions[sessionID]?.local && id.length > 4)) {
      /**
       * Used to join mobile phone controllers to the server
       */
      const joinMobile: CheckPlayer = (player) => {
        //If the mobile code is the same as the one sent connect the client to that session
        if (session[player].mobileCode === id) {
          sessions[sessionID][player].mobile.connected = true;
          sessions[sessionID][player].mobile.socketId = socket.id;
          connections.set(socket.id, newConnection(sessionID, player));

          socket.emit("CONNECT_MOBILE", player); // tells the client to send the user to the controller page
          socket.to(sessionID).emit("PLAYER_CONNECTED", player, true); //Tells other player that the phone connected
        }
      };
      // if a player is just joining as a second playe and not controller tell the users to update the server with a connected player
      if (id.length === 4) {
        sessions[sessionID].guest.connected = true;
        sessions[sessionID].guest.socketId = socket.id;
        connections.set(socket.id, newConnection(sessionID, "guest"));
        socket.broadcast.emit(
          "UPDATE_SERVERLIST",
          { id: sessionID, connectedPlayers: 2 },
          true, // if the session is already on the server list client side
          false // if the session is being deleted
        );
      }
      //Checks for device connections to emit and if the players joined on their mobile
      /**
       * Checks if the connected players have already selected a device and send it back to the client
       */

      session.player1.mobile.connected &&
        socket.emit("PLAYER_CONNECTED", "player1", true);
      session.player1.ready && socket.emit("PLAYER_READY_UP", "player1");

      joinMobile("player1");
      joinMobile("player2");

      socket.join(sessionID);

      socket.to(sessionID).emit("PLAYER_CONNECTED", "player2", false);
      console.log(` joined session ${sessionID}`, session);
      console.log(io.sockets.adapter.rooms.get(sessionID), "\n");
    }
  });
  /**
   * Listens for when a user leaves a session
   */
  socket.on(
    "LEAVE_SESSION",
    (id: string, role: "host" | "guest" | PlayerChoices) => {
      socket.leave(id);
      console.log(role);

      //If the session is already present
      if (sessions[id]) {
        connections.delete(socket.id);

        /**
         * If the host left the room, tell connected clients to leave the socket room and update the server list to delete the session
         */
        if (role === "host") {
          socket.broadcast.emit(
            "UPDATE_SERVERLIST",
            { id, connectedPlayers: 0 },
            true, // if the session is already on the server list client side
            true // if the session is being deleted
          );
          socket.to(id).emit("HOST_DISCONNECTED", () => {
            io.socketsLeave(id);
            delete sessions[id];
          });
          /**
           * If a other player left and it is the guest update the session info and notify the server list
           */
        } else if (role === "guest") {
          sessions[id].guest.connected = false;
          sessions[id].player2.mobile.connected = false;
          sessions[id].player2.ready = false;
          socket.to(sessions[id].host.socketId).emit("PLAYER_DISCONNECTED");
          socket.broadcast.emit(
            "UPDATE_SERVERLIST",
            { id, connectedPlayers: 1 },
            true, // if the session is already on the server list client side
            false // if the session is being deleted
          );
        } else if (role === "player1" || role === "player2") {
          sessions[id][role].mobile.connected = false;
          socket.to(id).emit("MOBILE_DISCONNECTED", role);
        }

        console.log(`${role} left room ${id}`);
        console.log(`${role === "host" ? "deleted" : "left"} room ${id} \n`);
      }
    }
  );

  /**
   * Listens for events on updating the session, if it is local or not
   */
  socket.on("UPDATE_LOCAL", (id) => {
    sessions[id].local = !sessions[id].local;
    console.log("Changed local setting to ", sessions[id].local, "\n");
    // disconnects any guest from the session if the host sets the session to local
    if (sessions[id].local && sessions[id].guest.connected) {
      socket
        .to(sessions[id].guest.socketId)
        .to(sessions[id].player2.mobile.socketId)
        .emit("HOST_DISCONNECTED");
      sessions[id].player2.mobile.connected = false;
      sessions[id].guest.connected = false;
      sessions[id].player2.ready = false;
    }
    sessions[id].player1.ready = false;
    /**
     * If local delete session from the server list
     * else add it back to the session list
     */
    sessions[id].local
      ? socket.broadcast.emit(
          "UPDATE_SERVERLIST",
          { id, connectedPlayers: 0 },
          true, // if the session is already on the server list client side
          true // if the session is being deleted
        )
      : socket.broadcast.emit(
          "UPDATE_SERVERLIST",
          { id, connectedPlayers: 1 },
          false // if the session is already on the server list client side
        );
  });
  /**
   * Listens for when a player Ready's up
   */
  socket.on("PLAYER_READY", (id, player: PlayerChoices) => {
    sessions[id][player].ready = !sessions[id][player].ready;
    socket.to(id).emit("PLAYER_READY_UP", player);
    console.log(` Session ${id} player Ready ${player}\n`);
  });
  /**
   * Listens for when a host starts the game and wants to let the guest know
   */
  socket.on("STARTING_GAME", (id) => {
    console.log(`Room ${id} starting game \n`);

    socket.to(id).emit("START_GAME");
  });

  /**
   * Listens for when to move the paddle in multiplayer sessions, or from mobile controllers
   */
  socket.on("MOVE_PADDLE", (id, direction, player, move, holding) => {
    console.log("MOVINIG", { player, id, direction, move });
    socket.to(id).emit("MOVING_PADDLE", direction, player, move, holding);
    socket.emit("MOVING_PADDLE", direction, player, move, holding);
  });
  /**
   * Gets inital pong position in multiplayer
   */
  socket.on("PONG_POSITION", (id, { top, left, up, horizontal }) => {
    console.log(top, left, up, horizontal, "PONGGG POSSS");
    socket.to(id).emit("SYNC_PONG", top, left, up, horizontal);
  });
  /**
   * Gets the pong position during the game
   */
  socket.on('SEND_PONG',(id,move) => {
    console.log('SYNCING PONG MOVE');
    
    socket.to(id).emit("GET_PONG", move);
    
  })
  /**
   * Gets all the active sessions and sends them back to the client to fill their server list
   */
  socket.on("GET_SERVERS", (returnServers) => {
    const servers = [];
    for (const [id, details] of Object.entries(sessions)) {
      if (details.local) continue;
      let connectedPlayers: number = details.guest.connected ? 2 : 1;

      servers.push({ id, connectedPlayers });
    }
    returnServers(servers);
  });
  socket.on("PLAY_AGAIN", (id, player) => {
    console.log("Play again they say", id, player);

    socket.to(id).emit("ON_PLAY_AGAIN", player);
  });
  socket.on("BACK_TO_LOBBY", (id) => {
    console.log("GO BACK TO LOBBY", id);

    sessions[id].player1.ready = false;
    sessions[id].player2.ready = false;
    socket.to(id).emit("GO_TO_LOBBY");
  });
});

server.listen(PORT, () => {
  console.log(`Socket Server listening on http://localhost:${PORT}`);
});

type PlayerChoices = "player1" | "player2";
type Role = "host" | "guest" | PlayerChoices;
/**
 * Interface for the Player object for session info
 */
interface Player {
  mobile: Connected;
  mobileCode: string;
  ready: boolean;
}
/**
 * Function interface to check the info for a player
 */
interface CheckPlayer {
  (player: PlayerChoices): any;
}

/**
 * The object carrying the info for each session
 */
interface Sessions {
  [key: string]: {
    player1: Player;
    player2: Player;
    host: Connected;
    guest: Connected;
    local: boolean;
  };
}
interface Connected {
  connected: boolean;
  socketId: string;
}
const randomChar = () => {
  //Getting a random char from using utf-16
  const min = 65;
  const max = 89;
  return String.fromCharCode(Math.floor(Math.random() * (max - min + 1) + min));
};
/**
 * @returns A random ID in the form of `'[A-Z][A-Z][A-Z][A-Z]'`
 */
const randomId = () =>
  `${randomChar()}${randomChar()}${randomChar()}${randomChar()}`;
/**
 *
 * @param id The id to set the mobile code too
 * @returns A random code in a string `'id[1-100]'`
 */
const createMobileCode = (id: string) =>
  `${id}${Math.floor(Math.random() * 100)}`;
/**
 * If the id is already taken,it wil generate a new one
 * @returns A random id consisting of 4 upper cased letters
 */
const checkIdIsNotTaken = (sessions: Sessions): string => {
  const generatedId = randomId();
  return !sessions[generatedId] ? generatedId : checkIdIsNotTaken(sessions);
};
