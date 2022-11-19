import express from "express";
import http from "http";
import "dotenv/config";
import { Server } from "socket.io";
const app = express();
const { PORT } = process.env;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const sessions = {};
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
    socket.on("CREATE_SESSION", (id) => {
        socket.join(id);
        sessions[id] = { player1: null, player2: null, host: socket.id };
        console.log(` created session ${id}`, sessions[id]);
        console.log(io.sockets.adapter.rooms.get(id), "\n");
    });
    socket.on("JOIN_SESSION", (id, callback) => {
        console.log(callback);
        callback(!!sessions[id]);
        if (sessions[id]) {
            console.log(` joined session ${id}`, sessions[id]);
            socket.join(id);
            console.log(sessions[id].player1);
            console.log(sessions[id].player2);
            sessions[id].player1 && socket.emit('PLAYER_CONNECTED', 1, sessions[id].player1);
            sessions[id].player2 && socket.emit('PLAYER_CONNECTED', 2, sessions[id].player2);
            console.log(io.sockets.adapter.rooms.get(id), "\n");
        }
    });
    socket.on("LEAVE_SESSION", (id) => {
        console.log("before leaving", io.sockets.adapter.rooms.get(id));
        console.log(socket.id);
        socket.leave(id);
        console.log("after leaving", io.sockets.adapter.rooms.get(id));
        socket.id === sessions[id]?.host ||
            (!io.sockets.adapter.rooms.get(id) && delete sessions[id]);
        console.log(`${socket.id === sessions[id]?.host || !io.sockets.adapter.rooms.get(id)
            ? "deleted"
            : "left"} room ${id} \n`);
    });
    socket.on("CONNECT_PLAYER", (id, player, device) => {
        sessions[id][`player${player}`] = device;
        console.log(`${id} room player${player} connected`);
        socket.to(id).emit('PLAYER_CONNECTED', player, device);
    });
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
