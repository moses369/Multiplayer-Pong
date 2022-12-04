import express, { Response, Request, NextFunction } from "express";
import cors from "cors";
import http from "http";
import "dotenv/config";
import { Server } from "socket.io";
import { Socket } from "dgram";
const app: express.Application = express();
const { PORT } = process.env;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
type PlayerChoices = "player1" | "player2";
interface Player {
  device: string;
  mobileCode: string;
  socketId: string;
}
interface CheckPlayer {
  (player: PlayerChoices): any;
}
interface session {
  [key: string]: {
    player1: Player;
    player2: Player;
    host: string;
    guest: string;
    local: boolean;
  };
}
/**
 * @returns A random character ranging from A - Z
 */
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
 * The sessions that are currently active
 */
const sessions: session = {};
/**
 * If the id is already taken,it wil generate a new one
 * @returns A random id consisting of 4 upper cased letters
 */
const checkIdIsNotTaken = (): string => {
  const generatedId = randomId();
  return !sessions[generatedId] ? generatedId : checkIdIsNotTaken();
};
io.on("connection", (socket) => {
  /**
   * Check for empty sessions every 10 seconds
   */
  setInterval(() => {
    for (const [id, details] of Object.entries(sessions)) {
      // If the session has no host then disconnect connected players
      if (!io.sockets.adapter.rooms.get(id)?.has(details.host)) {
        console.log(`${id} room Host Disconnected`);
        //If the session still has players after the host ledt notify them and kick them out
        if (io.sockets.adapter.rooms.get(id)) {
          socket.to(id).emit("HOST_DISCONNECTED", () => {
            io.socketsLeave(id); // kicks all sockets connected to the room out of the server after they ack the notification
            console.log("notified clients");
          });
          io.emit("UPDATE_SERVERLIST", { id, connectedPlayers: 0 }, true, true); // deletes the session from the clients server list
          console.log("\n");
        }

        delete sessions[id];
      }
    }
  }, 10_000);

  /**
   *Listens for new sessions
   */
  socket.on("CREATE_SESSION", (sendIdsBack) => {
    const generatedId = checkIdIsNotTaken(); //The generated id

    //Creates a empty player object for the session object
    const player = (): Player => ({
      device: "",
      mobileCode: createMobileCode(generatedId),
      socketId: "",
    });
    //Generates an initial session object
    sessions[generatedId] = {
      player1: player(),
      player2: player(),
      host: socket.id,
      guest: "",
      local: false,
    };
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
        ? !session?.local || (session.local && id.length > 4)
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
    if (session || (sessions[sessionID].local && id.length > 4)) {
      /**
       * Checks if the connected players have already selected a device and send it back to the client
       */
      const checkForDeviceConnections: CheckPlayer = (player) => {
        session[player].device &&
          socket.emit("PLAYER_CONNECTED", player, session[player].device);
      };
      /**
       * Used to join mobile phone controllers to the server
       */
      const joinMobile: CheckPlayer = (player) => {
        //If the mobile code is the same as the one sent connect the client to that session
        if (session[player].mobileCode === id) {
          sessions[sessionID][player].device = "mobile";
          sessions[sessionID][player].socketId = socket.id;
          socket.emit("CONNECT_MOBILE", player); // tells the client to send the user to the controller page
          socket.to(sessionID).emit("PLAYER_CONNECTED", player, "mobile"); //Tells other player that the phone connected
        }
        // If both devices are set then send the host a ready to start event
        if (session.player1.device && session.player2.device) {
          socket.to(sessions[sessionID].host).emit("READY_TO_START");
        }
      };
      // if a player is just joining as a second playe and not controller tell the users to update the server with a connected player
      if (id.length === 4) {
        sessions[sessionID].guest = socket.id;
        socket.broadcast.emit(
          "UPDATE_SERVERLIST",
          { id: sessionID, connectedPlayers: 2 },
          true, // if the session is already on the server list client side
          false // if the session is being deleted
        );
      }
      //Checks for device connections to emit and if the players joined on their mobile
      checkForDeviceConnections("player1");
      checkForDeviceConnections("player2");
      joinMobile("player1");
      joinMobile("player2");
      socket.join(sessionID);

      console.log(` joined session ${sessionID}`, session);
      console.log(io.sockets.adapter.rooms.get(sessionID), "\n");
    }
  });
  /**
   * Listens for when a user leaves a session
   */
  socket.on("LEAVE_SESSION", (id: string) => {
    socket.leave(id);
    //If the session is already present
    if (sessions[id]) {
      const noHost = socket.id === sessions[id].host;
      /**
       * If the host left the room, tell connected clients to leave the socket room and update the server list to delete the session
       */
      if (noHost) {
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
      } else if (socket.id === sessions[id].guest) {
        sessions[id].guest = "";
        socket.broadcast.emit(
          "UPDATE_SERVERLIST",
          { id, connectedPlayers: 1 },
          true, // if the session is already on the server list client side
          false // if the session is being deleted
        );
      }

      console.log(`${socket.id} left room ${id}`);
      console.log(`${noHost ? "deleted" : "left"} room ${id} \n`);
    }
  });
  /**
   * Listens for when  player selects/ connects their device
   */
  socket.on(
    "CONNECT_PLAYER",
    (id: string, player: PlayerChoices, device: string) => {
      // Lets the client know a device connected and updates the session info
      sessions[id][player].device = device;
      socket.to(id).emit("PLAYER_CONNECTED", player, device);

      console.log(`${id} room ${player} connected to ${device}`);
      console.log(`${sessions[id][player]} `);

      // if both devices have been selected lets the host know they can start
      if (sessions[id].player1.device && sessions[id].player2.device) {
        socket.to(sessions[id].host).emit("READY_TO_START");
        console.log(id, "Players ready \n");
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
    if (sessions[id].local && sessions[id].guest) {
      socket.to(sessions[id].guest).emit("HOST_DISCONNECTED");
    }
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
    socket.to(id).emit("MOVING_PADDLE", direction, player, move,holding);
    socket.emit("MOVING_PADDLE", direction, player, move,holding);
  });
  /**
   * Gets all the active sessions and sends them back to the client to fill their server list
   */
  socket.on("GET_SERVERS", (returnServers) => {
    const servers = [];
    for (const [id, details] of Object.entries(sessions)) {
      let connectedPlayers: number = details.guest ? 2 : 1;

      servers.push({ id, connectedPlayers });
    }
    returnServers(servers);
  });
});

server.listen(PORT, () => {
  console.log(`Socket Server listening on http://localhost:${PORT}`);
});
// express.json();
// app.use(cors())
// app.use(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     console.log({ method: req.method }, { url: req.url });
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// app.use((req: Request, res: Response, next: NextFunction) => {
//   try {
//     res.status(404).json({ message: "Page Not Found" });
//   } catch (error) {
//     next(error);
//   }
// });
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Internal Server Error" });
// })
