import { useEffect, useRef, useState } from "react";
import * as mediasoupClient from "mediasoup-client";
import { Socket } from "socket.io-client";

export default function useMediaSoup(socket: Socket | null, roomName: string) {
    const localVideo = useRef<HTMLVideoElement>(null);
    const rtpCapabilities = useRef<mediasoupClient.types.RtpCapabilities | null>(null);
    const producerTransport = useRef<mediasoupClient.types.Transport | undefined>(undefined);
    const audioProducer = useRef<mediasoupClient.types.Producer | undefined>(undefined);
    const videoProducer = useRef<mediasoupClient.types.Producer | undefined>(undefined);
    const audioParams = useRef<mediasoupClient.types.ProducerOptions | undefined>(undefined);
    const videoParams = useRef<mediasoupClient.types.ProducerOptions | undefined>(undefined);
    const [consumerTransports, setConsumerTransports] = useState<ConsumerTransport[]>([]);
    const consumingTransports = useRef<string[]>([]);
    const device = useRef<mediasoupClient.Device | null>(null);

    const connectSendTransport = async () => {
        // we now call produce() to instruct the producer transport
        // to send media to the Router
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
        // this action will trigger the 'connect' and 'produce' events above

        try {
            audioProducer.current = await producerTransport.current?.produce(audioParams.current);
            videoProducer.current = await producerTransport.current?.produce(videoParams.current);
        } catch (error) {
            console.log(error);
            console.log({
                audioProducer: audioProducer.current,
                videoProducer: videoProducer.current
            })
        }


        audioProducer.current?.on('trackended', () => {
            console.log('audio track ended')

            // close audio track
        })

        audioProducer.current?.on('transportclose', () => {
            console.log('audio transport ended')

            // close audio track
        })

        videoProducer.current?.on('trackended', () => {
            console.log('video track ended')

            // close video track
        })

        videoProducer.current?.on('transportclose', () => {
            console.log('video transport ended')

            // close video track
        })
    }

    const signalNewConsumerTransport = async (remoteProducer: { producerId: string, socketId: string }) => {
        //check if we are already consuming the remoteProducerId
        if (consumingTransports.current.includes(remoteProducer.producerId)) return;
        consumingTransports.current.push(remoteProducer.producerId);

        console.log(remoteProducer);

        await socket?.emit('createWebRtcTransport', { consumer: true }, ({ params }: { params: any }) => {
            // The server sends back params needed 
            // to create Send Transport on the client side
            if (params.error) {
                console.log(params.error)
                return
            }
            // console.log(`PARAMS... ${params}`)

            let consumerTransport
            try {
                consumerTransport = device.current?.createRecvTransport(params)
            } catch (error) {
                // exceptions: 
                // {InvalidStateError} if not loaded
                // {TypeError} if wrong arguments.
                console.log(error)
                return
            }

            consumerTransport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    // Signal local DTLS parameters to the server side transport
                    // see server's socket.on('transport-recv-connect', ...)
                    await socket?.emit('transport-recv-connect', {
                        dtlsParameters,
                        serverConsumerTransportId: params.id,
                    })

                    // Tell the transport that parameters were transmitted.
                    callback()
                } catch (error) {
                    // Tell the transport that something was wrong
                    if (error instanceof Error)
                        errback(error)
                }
            })

            if (consumerTransport) {
                connectRecvTransport(consumerTransport, remoteProducer, params.id)
            }
        })
    }

    const connectRecvTransport = async (
        consumerTransport: mediasoupClient.types.Transport,
        remoteProducer: { producerId: string, socketId: string },
        serverConsumerTransportId: any
    ) => {
        // for consumer, we need to tell the server first
        // to create a consumer based on the rtpCapabilities and consume
        // if the router can consume, it will send back a set of params as below
        await socket?.emit('consume', {
            rtpCapabilities: device.current?.rtpCapabilities,
            remoteProducerId: remoteProducer.producerId,
            serverConsumerTransportId,
        }, async ({ params }: any) => {
            if (params.error) {
                console.log('Cannot Consume')
                return
            }

            // console.log(`Consumer Params ${params}`)
            // then consume with the local consumer transport
            // which creates a consumer
            const consumer = await consumerTransport?.consume({
                id: params.id,
                producerId: params.producerId,
                kind: params.kind,
                rtpParameters: params.rtpParameters
            })

            console.log({ consumer, remoteProducer });

            const newConsumerTransport: ConsumerTransport = {
                socketId: remoteProducer.socketId,
                remoteProducerId: remoteProducer.producerId,
                consumerTransport,
                consumer
            }

            console.log({ newConsumerTransport, lmao: remoteProducer })

            setConsumerTransports(prev => [
                ...prev,
                newConsumerTransport
            ]);

            socket.emit('consumer-resume', { serverConsumerId: params.serverConsumerId })
        })
    }

    // server informs the client of a new producer just joined
    socket?.on('new-producer', (producer) => signalNewConsumerTransport(producer))

    const getProducers = () => {
        socket?.emit('getProducers', (producers: { producerId: string, socketId: string }[]) => {
            // for each of the producer create a consumer
            // producerIds.forEach(id => signalNewConsumerTransport(id))
            producers.forEach(signalNewConsumerTransport)
        })
    }

    const createSendTransport = () => {
        // see server's socket.on('createWebRtcTransport', sender?, ...)
        // this is a call from Producer, so sender = true
        socket?.emit('createWebRtcTransport', { consumer: false }, ({ params }: any) => {
            // The server sends back params needed 
            // to create Send Transport on the client side
            if (params.error) {
                console.log(params.error)
                return
            }

            console.log(params)

            // creates a new WebRTC Transport to send media
            // based on the server's producer transport params
            // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
            producerTransport.current = device.current?.createSendTransport(params)

            // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
            // this event is raised when a first call to transport.produce() is made
            // see connectSendTransport() below
            producerTransport.current?.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    // Signal local DTLS parameters to the server side transport
                    // see server's socket.on('transport-connect', ...)
                    await socket.emit('transport-connect', {
                        dtlsParameters,
                    })

                    // Tell the transport that parameters were transmitted.
                    callback()

                } catch (error) {
                    if (error instanceof Error)
                        errback(error)
                }
            })

            producerTransport.current?.on('produce', async (parameters, callback, errback) => {
                // console.log(parameters)

                try {
                    // tell the server to create a Producer
                    // with the following parameters and produce
                    // and expect back a server side producer id
                    // see server's socket.on('transport-produce', ...)
                    await socket?.emit('transport-produce', {
                        kind: parameters.kind,
                        rtpParameters: parameters.rtpParameters,
                        appData: parameters.appData,
                    }, ({ id, producersExist }: any) => {
                        // Tell the transport that parameters were transmitted and provide it with the
                        // server side producer's id.
                        callback({ id })

                        // if producers exist, then join room
                        if (producersExist) {
                            getProducers()
                        }
                    })
                } catch (error) {
                    if (error instanceof Error)
                        errback(error)
                }
            })

            connectSendTransport()
        })
    }

    // A device is an endpoint connecting to a Router on the
    // server side to send/recive media
    const createDevice = async () => {
        if (!rtpCapabilities.current) return console.log('No RTP Capabilities');

        try {
            const newDevice = new mediasoupClient.Device()
            device.current = newDevice;

            // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
            // Loads the device with RTP capabilities of the Router (server side)
            await newDevice.load({
                // see getRtpCapabilities() below
                routerRtpCapabilities: rtpCapabilities.current
            })

            // console.log('Device RTP Capabilities', newDevice.rtpCapabilities)

            // once the device loads, create transport
            createSendTransport()

        } catch (error) {
            console.log(error)
            if (error instanceof Error && error.name === 'UnsupportedError')
                console.warn('browser not supported')
        }
    }

    useEffect(() => {
        socket?.on('connect', async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: {
                        width: {
                            min: 640,
                            max: 1920,
                        },
                        height: {
                            min: 400,
                            max: 1080,
                        }
                    }
                });

                console.log(stream)

                if (localVideo.current) {
                    localVideo.current.srcObject = stream;
                    localVideo.current.play();
                }

                audioParams.current = {
                    track: stream.getAudioTracks()[0],
                    ...audioParams.current
                };

                videoParams.current = {
                    track: stream.getVideoTracks()[0],
                    ...videoParams.current
                };

                socket.emit('joinRoom', roomName, (
                    { rtpCapabilities: data }:
                        { rtpCapabilities: mediasoupClient.types.RtpCapabilities }
                ) => {
                    rtpCapabilities.current = data;

                    createDevice();
                });
            } catch (error) {
                console.log(error);
            }
        });

        socket?.on('producer-closed', ({ remoteProducerId }) => {
            // server notification is received when a producer is closed
            // we need to close the client-side consumer and associated transport
            setConsumerTransports(prev => {
                const producerToClose = prev.find(transportData => transportData.remoteProducerId === remoteProducerId);
                producerToClose?.consumerTransport.close();
                producerToClose?.consumer.close();
                
                return prev.filter(transportData => transportData.remoteProducerId !== remoteProducerId);
            })
        })
    }, [socket]);

    return { localVideo, consumerTransports };
}