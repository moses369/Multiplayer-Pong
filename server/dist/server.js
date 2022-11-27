import express from "express";
import http from "http";
import "dotenv/config";
import { Server } from "socket.io";
const app = express();
const { PORT } = process.env;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const randomChar = () => {
    //Getting a random char from using utf-16
    const min = 65;
    const max = 89;
    return String.fromCharCode(Math.floor(Math.random() * (max - min + 1) + min));
};
const randomId = () => `${randomChar()}${randomChar()}${randomChar()}${randomChar()}`;
const createMobileCode = (id) => `${id}${Math.floor(Math.random() * 100)}`;
const sessions = {};
const checkIdIsNotTaken = () => {
    const generatedId = randomId();
    return !sessions[generatedId] ? generatedId : checkIdIsNotTaken();
};
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
    socket.on('disconnect', () => {
        console.log('room dced from', socket, '\n');
    });
    socket.on("CREATE_SESSION", (sendIdsBack) => {
        const generatedId = checkIdIsNotTaken();
        const player = () => ({
            device: "",
            mobileCode: createMobileCode(generatedId),
            socketId: "",
        });
        sessions[generatedId] = {
            player1: player(),
            player2: player(),
            host: socket.id,
            guest: "",
            local: false,
        };
        const mobileCode = {
            player1: sessions[generatedId].player1.mobileCode,
            player2: sessions[generatedId].player2.mobileCode,
        };
        sendIdsBack(generatedId, mobileCode);
        socket.join(generatedId);
        console.log(` created session ${generatedId}`, sessions[generatedId]);
        console.log(io.sockets.adapter.rooms.get(generatedId), "\n");
    });
    socket.on("JOIN_SESSION", (id, callback) => {
        const sessionID = id.substring(0, 4);
        const session = sessions[sessionID];
        callback(!!session
            ? !session.local || (session.local && id.length > 4)
                ? true
                : false
            : false, {
            player1: session?.player1.mobileCode,
            player2: session?.player2.mobileCode,
        });
        if (session || (sessions[sessionID].local && id.length > 4)) {
            const checkForDeviceConnections = (player) => {
                session[player].device &&
                    socket.emit("PLAYER_CONNECTED", player, session[player].device);
            };
            const joinMobile = (player) => {
                if (session[player].mobileCode === id) {
                    sessions[sessionID][player].device = "mobile";
                    sessions[sessionID][player].socketId = socket.id;
                    socket.emit("CONNECT_MOBILE", player);
                    socket.to(sessionID).emit("PLAYER_CONNECTED", player, "mobile");
                }
                if (session.player1.device && session.player2.device) {
                    socket.to(sessions[sessionID].host).emit("READY_TO_START");
                }
            };
            id.length === 4 && (sessions[sessionID].guest = socket.id);
            checkForDeviceConnections("player1");
            checkForDeviceConnections("player2");
            joinMobile("player1");
            joinMobile("player2");
            socket.join(sessionID);
            console.log(` joined session ${sessionID}`, session);
            console.log(io.sockets.adapter.rooms.get(sessionID), "\n");
        }
    });
    socket.on("LEAVE_SESSION", (id) => {
        socket.leave(id);
        if (sessions[id]) {
            const noHost = socket.id === sessions[id].host;
            if (noHost) {
                socket.to(id).emit("HOST_DISCONNECTED", () => {
                    io.socketsLeave(id);
                    delete sessions[id];
                });
            }
            console.log(`${socket.id} left room ${id}`);
            console.log(`${noHost ? "deleted" : "left"} room ${id} \n`);
        }
    });
    socket.on("CONNECT_PLAYER", (id, player, device) => {
        sessions[id][player].device = device;
        console.log(`${id} room ${player} connected to ${device}`);
        console.log(`${sessions[id][player]} `);
        socket.to(id).emit("PLAYER_CONNECTED", player, device);
        if (sessions[id].player1.device && sessions[id].player2.device)
            console.log(id, "Players ready \n");
        socket.to(sessions[id].host).emit("READY_TO_START");
    });
    socket.on("UPDATE_LOCAL", (id) => {
        sessions[id].local = !sessions[id].local;
        console.log("Changed local setting to ", sessions[id].local, "\n");
        if (sessions[id].local && sessions[id].guest) {
            socket.to(sessions[id].guest).emit("HOST_DISCONNECTED");
        }
    });
    socket.on("STARTING_GAME", (id) => {
        console.log(`Room ${id} starting game \n`);
        socket.to(id).emit("START_GAME");
    });
    socket.on('PLAY_BALL', () => {
        socket.emit('MOVE_BALL');
    });
    socket.on("MOVE_PADDLE", (id, direction, player, stop) => {
        console.log("MOVINIG", { player, id, direction, stop });
        socket.to(id).emit("MOVING_PADDLE", direction, player, stop);
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
