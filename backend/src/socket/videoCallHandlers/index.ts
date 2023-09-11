import { Socket } from "socket.io";
import {
    Worker as MediasoupWorker,
    Router as MediasoupRouter,
    Transport as MediasoupTransport,
    Producer as MediasoupProducer,
    Consumer as MediasoupConsumer,
    WebRtcTransport,
} from 'mediasoup/node/lib/types';
import config from "../../config";

const {
    mediasoup: {
        routerOptions: {
            mediaCodecs
        }
    }
} = config;

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
    consumer: MediasoupConsumer;
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

let rooms: Rooms = {};          // { roomName1: { Router, rooms: [ sicketId1, ... ] }, ...}
let peers: Peers = {};          // { socketId1: { roomName1, socket, transports = [id1, id2,] }, producers = [id1, id2,] }, consumers = [id1, id2,], peerDetails }, ...}
let transports: Transport[] = [];     // [ { socketId1, roomName1, transport, consumer }, ... ]
let producers: Producer[] = [];      // [ { socketId1, roomName1, producer, }, ... ]
let consumers: Consumer[] = [];   // [ { socketId1, roomName1, consumer, }, ... ]

export default function registerVideoCallHandlers(socket: Socket, worker: MediasoupWorker) {
    type TPC = Transport | Producer | Consumer;

    function removeItems<T extends TPC>(
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
                    } else if (type === 'consumer' && 'consumer' in item) {
                        item.consumer.close();
                    }
                }
            }
        });

        return items.filter(item => item.socketId !== socketId);
    }


    socket.on('disconnect', () => {
        // do some cleanup
        console.log('peer disconnected')
        consumers = removeItems(consumers, socket.id, 'consumer')
        producers = removeItems(producers, socket.id, 'producer')
        transports = removeItems(transports, socket.id, 'transport')

        const peer = peers[socket.id]
        if (!peer) {
            return;
        }
        const { roomName } = peer;
        delete peers[socket.id]

        // remove socket from room
        rooms[roomName] = {
            router: rooms[roomName].router,
            peers: rooms[roomName].peers.filter(socketId => socketId !== socket.id)
        }
    })

    socket.on('joinRoom', async ({ roomName }, callback) => {
        // create Router if it does not exist
        const router = await createRoom(roomName, socket.id)

        // console.log("router: ", router);

        peers[socket.id] = {
            socket,
            roomName,           // Name for the Router this Peer joined
            transports: [],
            producers: [],
            consumers: [],
            peerDetails: {
                name: '',
                isAdmin: false,   // Is this Peer the Admin?
            }
        }

        // get Router RTP Capabilities
        const rtpCapabilities = router.rtpCapabilities

        // call callback from the client and send back the rtpCapabilities
        callback({ rtpCapabilities })
    })

    const createRoom = async (roomName: string, socketId: string) => {
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

    type CreateWebRtcTransportCallback = (
        result: {
            params: WebRtcTransport;
        }
    ) => void;

    // Client emits a request to create server side Transport
    // We need to differentiate between the producer and consumer transports
    socket.on('createWebRtcTransport', async (
        { consumer }: { consumer: MediasoupConsumer },
        callback: CreateWebRtcTransportCallback
    ) => {
        // get Room Name from Peer's properties
        const roomName = peers[socket.id].roomName

        // get Router (Room) object this peer is in based on RoomName
        const router = rooms[roomName].router


        createWebRtcTransport(router).then(
            transport => {
                callback({
                    params: {
                        id: transport.id,
                        iceParameters: transport.iceParameters,
                        iceCandidates: transport.iceCandidates,
                        dtlsParameters: transport.dtlsParameters,
                    } as WebRtcTransport,
                })

                // add transport to Peer's properties
                addTransport(transport, roomName, consumer)
            },
            error => {
                console.log(error)
            })
    })

    const addTransport = (
        transport: WebRtcTransport,
        roomName: string,
        consumer: MediasoupConsumer
    ) => {

        transports = [
            ...transports,
            { socketId: socket.id, transport, roomName, consumer, }
        ]

        peers[socket.id] = {
            ...peers[socket.id],
            transports: [
                ...peers[socket.id].transports,
                transport.id,
            ]
        }
    }

    const createWebRtcTransport = async (router: MediasoupRouter) => {
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

    const addProducer = (producer: MediasoupProducer, roomName: string) => {
        producers = [
            ...producers,
            { socketId: socket.id, producer, roomName, }
        ]

        peers[socket.id] = {
            ...peers[socket.id],
            producers: [
                ...peers[socket.id].producers,
                producer.id,
            ]
        }
    }

    const addConsumer = (consumer: MediasoupConsumer, roomName: string) => {
        // add the consumer to the consumers list
        consumers = [
            ...consumers,
            { socketId: socket.id, consumer, roomName, }
        ]

        // add the consumer id to the peers list
        peers[socket.id] = {
            ...peers[socket.id],
            consumers: [
                ...peers[socket.id].consumers,
                consumer.id,
            ]
        }
    }

    type getProducersCallback = (result: string[]) => void;

    socket.on('getProducers', (callback: getProducersCallback) => {
        //return all producer transports
        const { roomName } = peers[socket.id]

        let producerList: any[] = []
        producers.forEach(producerData => {
            if (producerData.socketId !== socket.id && producerData.roomName === roomName) {
                producerList = [
                    ...producerList,
                    {
                        producerId: producerData.producer.id,
                        socketId: producerData.socketId,
                    }
                ]
            }
        })

        // return the producer list back to the client
        callback(producerList)
    })

    const informConsumers = (roomName: string, socketId: string, id: string) => {
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

    const getTransport = (socketId: string) => {
        const [producerTransport] = transports.filter(transport => transport.socketId === socketId && !transport.consumer)
        return producerTransport.transport
    }

    // see client's socket.emit('transport-connect', ...)
    socket.on('transport-connect', ({ dtlsParameters }) => {
        console.log('DTLS PARAMS... ', { dtlsParameters })

        getTransport(socket.id).connect({ dtlsParameters })
    })

    // see client's socket.emit('transport-produce', ...)
    socket.on('transport-produce', async ({ kind, rtpParameters, appData }, callback) => {
        // call produce based on the prameters from the client
        const producer = await getTransport(socket.id).produce({
            kind,
            rtpParameters,
        })

        // add producer to the producers array
        const { roomName } = peers[socket.id]

        addProducer(producer, roomName)

        informConsumers(roomName, socket.id, producer.id)

        console.log('Producer ID: ', producer.id, producer.kind)

        producer.on('transportclose', () => {
            console.log('transport for this producer closed ')
            producer.close()
        })

        // Send back to the client the Producer's id
        callback({
            id: producer.id,
            producersExist: producers.length > 1 ? true : false
        })
    })

    // see client's socket.emit('transport-recv-connect', ...)
    socket.on('transport-recv-connect', async ({ dtlsParameters, serverConsumerTransportId }) => {
        console.log(`DTLS PARAMS: ${dtlsParameters}`)
        const consumerTransport = transports.find(transportData => (
            transportData.consumer && transportData.transport.id == serverConsumerTransportId
        ))?.transport
        await consumerTransport?.connect({ dtlsParameters })
    })

    socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
        try {

            const { roomName } = peers[socket.id]
            const router = rooms[roomName].router
            let consumerTransport = transports.find(transportData => (
                transportData.consumer && transportData.transport.id == serverConsumerTransportId
            ))?.transport

            if (!consumerTransport) {
                return;
            }

            // check if the router can consume the specified producer
            if (router.canConsume({
                producerId: remoteProducerId,
                rtpCapabilities
            })) {
                // transport can now consume and return a consumer
                const consumer = await consumerTransport.consume({
                    producerId: remoteProducerId,
                    rtpCapabilities,
                    paused: true,
                })

                consumer.on('transportclose', () => {
                    console.log('transport close from consumer')
                })

                consumer.on('producerclose', () => {
                    console.log('producer of consumer closed')
                    socket.emit('producer-closed', { remoteProducerId })

                    consumerTransport?.close()
                    transports = transports.filter(transportData => transportData.transport.id !== consumerTransport?.id)
                    consumer.close()
                    consumers = consumers.filter(consumerData => consumerData.consumer.id !== consumer.id)
                })

                addConsumer(consumer, roomName)

                // from the consumer extract the following params
                // to send back to the Client
                const params = {
                    id: consumer.id,
                    producerId: remoteProducerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    serverConsumerId: consumer.id,
                }

                // send the parameters to the client
                callback({ params })
            }
        } catch (error) {
            if (error instanceof Error) console.log(error.message)
            callback({
                params: {
                    error: error
                }
            })
        }
    })

    socket.on('consumer-resume', async ({ serverConsumerId }) => {
        console.log('consumer resume')
        const findConsumer = consumers.find(consumerData => consumerData.consumer.id === serverConsumerId)

        if (!findConsumer) {
            return;
        }

        const { consumer } = findConsumer;
        await consumer.resume()
    })
}