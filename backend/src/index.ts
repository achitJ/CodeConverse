import 'dotenv/config';
import { Server } from 'http';
import { 
    createExpressServer, 
    createMediaSoupWorker, 
    createSocketServer,
    connectToMongoDB
} from './loaders';
import { Namespace, Socket } from 'socket.io';
import {
    Worker as mediasoupWorker
} from 'mediasoup/node/lib/types';
import registerVideoCallHandlers from './socket/videoCallHandlers';

let serverListener: Server;
let worker: mediasoupWorker;
let socketConnections: Namespace;

(async () => {
    await connectToMongoDB();
    serverListener = createExpressServer();
    worker = await createMediaSoupWorker();
    socketConnections = await createSocketServer(serverListener);

    socketConnections.on('connection', (socket: Socket) => {
        console.log('socket connected')

        registerVideoCallHandlers(socket, worker);
    });
})();