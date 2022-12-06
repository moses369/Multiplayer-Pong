import express from "express";
import http from "http";
import "dotenv/config";
import { Server } from "socket.io";
const app = express();
const server = http.createServer(app);
const { PORT } = process.env;
const io = new Server(server, { cors: { origin: "*" } });
/**
 * The sessions that are currently active
 */
const sessions = {};
io.on("connection", (socket) => {
    /**
     * Rejoining the room after refreshing the page
     */
    socket.on("RE_JOIN", (id, role) => {
        if (sessions[id]) {
            role === "guest" || role === "host"
                ? (sessions[id][role].socketId = socket.id)
                : (sessions[id][role].mobile.socketId = socket.id);
            socket.join(id);
        }
    });
    /**
     *Listens for new sessions
     */
    socket.on("CREATE_SESSION", (sendIdsBack) => {
        const generatedId = checkIdIsNotTaken(sessions); //The generated id
        //Creates a empty player object for the session object
        const player = () => ({
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
        //The mobile codes to send back to the client
        const mobileCode = {
            player1: sessions[generatedId].player1.mobileCode,
            player2: sessions[generatedId].player2.mobileCode,
        };
        //Sends the sessionID and mobilecodes back to the client
        sendIdsBack(generatedId, mobileCode);
        socket.join(generatedId); //Joins the session room
        // Sends an event to update the server list
        socket.broadcast.emit("UPDATE_SERVERLIST", { id: generatedId, connectedPlayers: 1 }, false // if the session is already on the server list client side
        );
        console.log(` created session ${generatedId}`, sessions[generatedId]);
        console.log(io.sockets.adapter.rooms.get(generatedId), "\n");
    });
    /**
     * Listens for when a user attempts to join a session
     */
    socket.on("JOIN_SESSION", (id, callback) => {
        const sessionID = id.substring(0, 4); //Parses the first 4 letters to get the id in case of a mobile join
        const session = sessions[sessionID]; //finds the session
        /**
         * Sends back to the client if the session is real, if it is checks if its local, if its local
         * it sends the session is not found unless it is a mobile controller connecting
         */
        callback(session
            ? !session?.local || (session.local && id.length > 4)
                ? true
                : false
            : false, {
            player1: session?.player1.mobileCode,
            player2: session?.player2.mobileCode,
        });
        /**
         * Runs if the session is real, or if its local and its a controller joining
         */
        if (session || (sessions[sessionID].local && id.length > 4)) {
            /**
             * Used to join mobile phone controllers to the server
             */
            const joinMobile = (player) => {
                //If the mobile code is the same as the one sent connect the client to that session
                if (session[player].mobileCode === id) {
                    sessions[sessionID][player].mobile.connected = true;
                    sessions[sessionID][player].mobile.socketId = socket.id;
                    socket.emit("CONNECT_MOBILE", player); // tells the client to send the user to the controller page
                    socket.to(sessionID).emit("PLAYER_CONNECTED", player, true); //Tells other player that the phone connected
                }
            };
            // if a player is just joining as a second playe and not controller tell the users to update the server with a connected player
            if (id.length === 4) {
                sessions[sessionID].guest.connected = true;
                sessions[sessionID].guest.socketId = socket.id;
                socket.broadcast.emit("UPDATE_SERVERLIST", { id: sessionID, connectedPlayers: 2 }, true, // if the session is already on the server list client side
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
    socket.on("LEAVE_SESSION", (id, role) => {
        socket.leave(id);
        console.log(role);
        //If the session is already present
        if (sessions[id]) {
            /**
             * If the host left the room, tell connected clients to leave the socket room and update the server list to delete the session
             */
            if (role === "host") {
                socket.broadcast.emit("UPDATE_SERVERLIST", { id, connectedPlayers: 0 }, true, // if the session is already on the server list client side
                true // if the session is being deleted
                );
                socket.to(id).emit("HOST_DISCONNECTED", () => {
                    io.socketsLeave(id);
                    delete sessions[id];
                });
                /**
                 * If a other player left and it is the guest update the session info and notify the server list
                 */
            }
            else if (role === "guest") {
                sessions[id].guest.connected = false;
                sessions[id].player2.mobile.connected = false;
                sessions[id].player2.ready = false;
                socket.to(sessions[id].host.socketId).emit("PLAYER_DISCONNECTED");
                socket.broadcast.emit("UPDATE_SERVERLIST", { id, connectedPlayers: 1 }, true, // if the session is already on the server list client side
                false // if the session is being deleted
                );
            }
            else if (role === "player1" || role === "player2") {
                sessions[id][role].mobile.connected = false;
                socket.to(id).emit("MOBILE_DISCONNECTED", role);
            }
            console.log(`${role} left room ${id}`);
            console.log(`${role === "host" ? "deleted" : "left"} room ${id} \n`);
        }
    });
    /**
     * Listens for events on updating the session, if it is local or not
     */
    socket.on("UPDATE_LOCAL", (id) => {
        sessions[id].local = !sessions[id].local;
        console.log("Changed local setting to ", sessions[id].local, "\n");
        // disconnects any guest from the session if the host sets the session to local
        if (sessions[id].local && sessions[id].guest) {
            socket
                .to(sessions[id].guest.socketId)
                .to(sessions[id].player2.mobile.socketId)
                .emit("HOST_DISCONNECTED");
            sessions[id].player2.mobile.connected = false;
            sessions[id].guest.connected = false;
            sessions[id].player2.ready = false;
        }
        /**
         * If local delete session from the server list
         * else add it back to the session list
         */
        sessions[id].local
            ? socket.broadcast.emit("UPDATE_SERVERLIST", { id, connectedPlayers: 0 }, true, // if the session is already on the server list client side
            true // if the session is being deleted
            )
            : socket.broadcast.emit("UPDATE_SERVERLIST", { id, connectedPlayers: 1 }, false // if the session is already on the server list client side
            );
    });
    /**
     * Listens for when a player Ready's up
     */
    socket.on("PLAYER_READY", (id, player) => {
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
     * Gets all the active sessions and sends them back to the client to fill their server list
     */
    socket.on("GET_SERVERS", (returnServers) => {
        const servers = [];
        for (const [id, details] of Object.entries(sessions)) {
            let connectedPlayers = details.guest.connected ? 2 : 1;
            servers.push({ id, connectedPlayers });
        }
        returnServers(servers);
    });
});
server.listen(PORT, () => {
    console.log(`Socket Server listening on http://localhost:${PORT}`);
});
const randomChar = () => {
    //Getting a random char from using utf-16
    const min = 65;
    const max = 89;
    return String.fromCharCode(Math.floor(Math.random() * (max - min + 1) + min));
};
/**
 * @returns A random ID in the form of `'[A-Z][A-Z][A-Z][A-Z]'`
 */
const randomId = () => `${randomChar()}${randomChar()}${randomChar()}${randomChar()}`;
/**
 *
 * @param id The id to set the mobile code too
 * @returns A random code in a string `'id[1-100]'`
 */
const createMobileCode = (id) => `${id}${Math.floor(Math.random() * 100)}`;
/**
 * If the id is already taken,it wil generate a new one
 * @returns A random id consisting of 4 upper cased letters
 */
const checkIdIsNotTaken = (sessions) => {
    const generatedId = randomId();
    return !sessions[generatedId] ? generatedId : checkIdIsNotTaken(sessions);
};
