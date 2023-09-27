import {
    Router as MediasoupRouter,
    Transport as MediasoupTransport,
    Producer as MediasoupProducer,
    Consumer as MediasoupConsumer,
} from 'mediasoup/node/lib/types';
import { Socket } from "socket.io";
import { Request, Response } from "express";

declare global {
    interface Rooms {
        [key: string]: {
            router: MediasoupRouter;
            // rooms: string[];
            peers: string[];
        }
    }

    interface Peers {
        [key: string]: {
            roomName: string;
            socket: Socket;
            transports: string[];
            producers: string[];
            consumers: string[];
            peerDetails: {
                name: string;
                isAdmin: boolean;
            }
        }
    }

    interface Transport {
        socketId: string;
        roomName: string;
        transport: MediasoupTransport;
        consumer: boolean;
    }

    interface Producer {
        socketId: string;
        roomName: string;
        producer: MediasoupProducer;
    }

    interface Consumer {
        socketId: string;
        roomName: string;
        consumer: MediasoupConsumer;
    }

    type TPC = Transport | Producer | Consumer;


    interface RequestWithUser extends Request {
        user?: {
            id: string,
        }
    }

    interface ResponseWithUser extends Response {
        user?: {
            id: string,
        }
    }
}