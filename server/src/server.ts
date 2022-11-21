import express, { Response, Request, NextFunction } from "express";
import cors from "cors";
import http from "http";
import "dotenv/config";
import { Server } from "socket.io";
const app: express.Application = express();
const { PORT } = process.env;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
interface Player {
  device: string;
  mobileCode: string;
}
interface session {
  [key: string]: {
    player1: Player;
    player2: Player;
    host: string;
  };
}
const sessions: session = {};
io.on("connection", (socket) => {
  /**Check for empty sessions */
  setInterval(() => {
    for (const [id, details] of Object.entries(sessions)) {
      if (!io.sockets.adapter.rooms.get(id)?.has(details.host)) {
        console.log(`${id} room Host Disconnected`);
        io.sockets.adapter.rooms.get(id) &&
          socket.to(id).emit("HOST_DISCONNECTED", () => {
            console.log("notified clients");

            io.socketsLeave(id);
          });
        console.log("\n");

        delete sessions[id];
      }
    }
  }, 5_000);

  socket.on("CREATE_SESSION", (id: string, { player1, player2 }) => {
    socket.join(id);
    const player = (code: string) => ({ device: "", mobileCode: code });
    sessions[id] = {
      player1: player(player1),
      player2: player(player2),
      host: socket.id,
    };

    console.log(` created session ${id}`, sessions[id]);
    console.log(io.sockets.adapter.rooms.get(id), "\n");
  });
  socket.on("JOIN_SESSION", (id: string, callback) => {
    const sessionID = id.substring(0, 4);
    const mobileCode = id.substring(6);

    const session = sessions[sessionID];
    callback(!!session, {
      player1: session?.player1.mobileCode,
      player2: session?.player2.mobileCode,
    });
    if (session) {
      console.log(` joined session ${id}`, session);
      console.log(session.player1.mobileCode === id);
      console.log(session.player2.mobileCode === id);

      socket.join(id);

      session.player1.device &&
        socket.emit("PLAYER_CONNECTED", "player1", session.player1.device);
      session.player2.device &&
        socket.emit("PLAYER_CONNECTED", "player2", session.player2.device);
      session.player1.mobileCode === id &&
        socket.emit("CONNECT_MOBILE", "player1");
      session.player2.mobileCode === id &&
        socket.emit("CONNECT_MOBILE", "player2");
      console.log(io.sockets.adapter.rooms.get(id), "\n");
    }
  });
  socket.on("LEAVE_SESSION", (id: string) => {
    socket.leave(id);
    console.log(
      `${socket.id} left room ${id}`,
      io.sockets.adapter.rooms.get(id)
    );

    socket.id === sessions[id]?.host ||
      (!io.sockets.adapter.rooms.get(id) && delete sessions[id]);
    console.log(
      `${
        socket.id === sessions[id]?.host || !io.sockets.adapter.rooms.get(id)
          ? "deleted"
          : "left"
      } room ${id} \n`
    );
  });
  socket.on(
    "CONNECT_PLAYER",
    (id: string, player: "player1" | "player2", device: string) => {
      sessions[id][player].device = device;
      console.log(`${id} room ${player} connected to ${device}`);
      console.log(`${sessions[id][player]} \n`);

      socket.to(id).emit("PLAYER_CONNECTED", player, device);
    }
  );

  socket.on("MOVE_PADDLE", (id, direction, player) => {
    console.log("MOVINIG", { player, id, direction });

    socket.to(id).emit("MOVING_PADDLE", direction, player);
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
