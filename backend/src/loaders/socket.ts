import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';


export default async function createSocketServer(serverListener: Server) {
    const io = new SocketServer(serverListener, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    const connections = io.of("/meet");

    return connections;
}