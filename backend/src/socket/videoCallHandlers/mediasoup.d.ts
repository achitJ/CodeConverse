interface Rooms {
    [key: string]: {
        router: import("mediasoup/node/lib/types").Router;
        // rooms: string[];
        peers: string[];
    }
}

interface Peers {
    [key: string]: {
        roomName: string;
        socket: import("socket.io").Socket;
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
    transport: import("mediasoup/node/lib/types").Transport;
    consumer: boolean;
}

interface Producer {
    socketId: string;
    roomName: string;
    producer: import("mediasoup/node/lib/types").Producer;
}

interface Consumer {
    socketId: string;
    roomName: string;
    consumer: import("mediasoup/node/lib/types").Consumer;
}

type TPC = Transport | Producer | Consumer;
