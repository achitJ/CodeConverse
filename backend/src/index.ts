import express, { Request, Response } from 'express';
import { Server, createServer } from 'http';
import { port } from './config';
import { Server as SocketServer } from 'socket.io';
import mediasoup from 'mediasoup';
import {
    Worker as mediasoupWorker,
    Router as mediasoupRouter,
    Transport as mediasoupTransport,
    Producer as mediasoupProducer,
    Consumer as mediasoupConsumer,
} from 'mediasoup/node/lib/types';


//create an interface for the rooms
interface Rooms {
    [key: string]: {
        router: mediasoupRouter;
        rooms: string[];
    }
}

//create an interface for the peers
interface Peers {
    [key: string]: {
        roomName: string;
        socket: SocketIO.Socket;
        transports: string[];
        producers: string[];
        consumers: string[];
        peerDetails: {
            name: string;
            isAdmin: boolean;
        }
    }
}

//create an interface for the transport
interface Transport {
    socketId: string;
    roomName: string;
    transport: mediasoupTransport;
    consumer: mediasoupConsumer;
}

//create an interface for the producer
interface Producer {
    socketId: string;
    roomName: string;
    producer: mediasoupProducer;
}

//create an interface for the consumer
interface Consumer {
    socketId: string;
    roomName: string;
    consumer: mediasoupConsumer;
}

const app = express();
let serverListener: Server;
let worker: mediasoupWorker;
let rooms: Rooms = {};          // { roomName1: { Router, rooms: [ sicketId1, ... ] }, ...}
let peers: Peers = {};          // { socketId1: { roomName1, socket, transports = [id1, id2,] }, producers = [id1, id2,] }, consumers = [id1, id2,], peerDetails }, ...}
let transports: Transport[] = [];     // [ { socketId1, roomName1, transport, consumer }, ... ]
let producers: Producer[] = [];      // [ { socketId1, roomName1, producer, }, ... ]
let consumers: Consumer[] = [];   // [ { socketId1, roomName1, consumer, }, ... ]

(async () => {
    // createExpressServer();
    await createMediaSoupWorker();
    // createSocketServer();
})();

function createExpressServer() {
    serverListener = createServer(app);

    app.all("*", (req: Request, res: Response) => {
        console.log({ url: req.url, host: req.hostname });
        req.get
        res.send("Hello World");
    });

    serverListener.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

async function createMediaSoupWorker() {

    console.log(mediasoup)

    // worker = await mediasoup.createWorker({
    //     rtcMinPort: 2000,
    //     rtcMaxPort: 2020,
    // });
    // console.log(`worker pid ${worker.pid}`);

    // worker.on('died', error => {
    //     // This implies something serious happened, so kill the application
    //     console.error('mediasoup worker has died');
    //     setTimeout(() => process.exit(1), 2000); // exit in 2 seconds
    // });

    // return worker;
}

function createSocketServer() {
    const io = new SocketServer(serverListener, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const connections = io.of("/socket");


}