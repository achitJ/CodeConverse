import {
    Worker as MediasoupWorker,
    Router as MediasoupRouter,
    Producer as MediasoupProducer,
    Consumer as MediasoupConsumer,
    WebRtcTransport,
} from 'mediasoup/node/lib/types';
import config from '../../config';

const {
    mediasoup: {
        routerOptions: {
            mediaCodecs
        }
    }
} = config;

export function removeItems<T extends TPC>(
    items: T[],
    socketId: string,
    type: 'transport' | 'producer' | 'consumer'
): T[] {
    items.forEach(item => {
        if (item.socketId === socketId) {
            if (item.socketId === socketId) {
                if (type === 'transport' && 'transport' in item) {
                    item.transport.close();
                } else if (type === 'producer' && 'producer' in item) {
                    item.producer.close();
                } else if (
                    type === 'consumer' &&
                    'consumer' in item &&
                    typeof item.consumer !== 'boolean'
                ) {
                    item.consumer.close();
                }
            }
        }
    });

    return items.filter(item => item.socketId !== socketId);
}

export const addTransport = (
    transport: WebRtcTransport,
    roomName: string,
    consumer: boolean,
    socketId: string,
    transports: Transport[],
    peers: Peers,
) => {

    transports.push({
        socketId,
        transport,
        roomName,
        consumer
    });

    peers[socketId] = {
        ...peers[socketId],
        transports: [
            ...peers[socketId].transports,
            transport.id,
        ]
    }
}

export const createWebRtcTransport = async (router: MediasoupRouter) => {
    return new Promise<WebRtcTransport>(async (resolve, reject) => {
        try {
            // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
            const webRtcTransportOptions = {
                listenIps: [
                    {
                        ip: '0.0.0.0', // replace with relevant IP address
                        announcedIp: '127.0.0.1',
                    }
                ],
                enableUdp: true,
                enableTcp: true,
                preferUdp: true,
            }

            // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
            let transport: WebRtcTransport = await router.createWebRtcTransport(webRtcTransportOptions);
            console.log(`transport id: ${transport.id}`);

            transport.on('dtlsstatechange', dtlsState => {
                if (dtlsState === 'closed') {
                    transport.close();
                    console.log('transport closed');
                }
            });

            resolve(transport)

        } catch (error) {
            reject(error)
        }
    })
}

export const createRoom = async (
    roomName: string, 
    socketId: string, 
    rooms: Rooms,
    worker: MediasoupWorker,
) => {
    let currRouter: MediasoupRouter;
    let peers: string[] = [];

    if (rooms[roomName]) {
        currRouter = rooms[roomName].router
        peers = rooms[roomName].peers || []
    } else {
        currRouter = await worker.createRouter({ mediaCodecs })
    }

    console.log(`Router ID: ${currRouter.id}`, peers.length)

    rooms[roomName] = {
        router: currRouter,
        peers: [...peers, socketId],
    }

    return currRouter
}

export const addProducer = (
    producer: MediasoupProducer, 
    roomName: string,
    producers: Producer[],
    socketId: string,
    peers: Peers,
) => {

    producers.push({
        socketId,
        producer,
        roomName,
    });

    peers[socketId] = {
        ...peers[socketId],
        producers: [
            ...peers[socketId].producers,
            producer.id,
        ]
    }
}

export const addConsumer = (
    consumer: MediasoupConsumer, 
    roomName: string,
    socketId: string,
    consumers: Consumer[],
    peers: Peers,
) => {
    // add the consumer to the consumers list
    consumers.push({
        socketId,
        consumer,
        roomName,
    });

    // add the consumer id to the peers list
    peers[socketId] = {
        ...peers[socketId],
        consumers: [
            ...peers[socketId].consumers,
            consumer.id,
        ]
    }
}

export const informConsumers = (
    roomName: string, 
    socketId: string, 
    id: string,
    producers: Producer[],
    peers: Peers,
) => {
    console.log(`just joined, id ${id} ${roomName}, ${socketId}`)
    // A new producer just joined
    // let all consumers to consume this producer
    producers.forEach(producerData => {
        if (producerData.socketId !== socketId && producerData.roomName === roomName) {
            const producerSocket = peers[producerData.socketId].socket
            // use socket to send producer id to producer
            producerSocket.emit('new-producer', { producerId: id, socketId })
        }
    })
}