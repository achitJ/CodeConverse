export { };
import * as mediasoupClient from 'mediasoup-client';

declare global {

    type ConsumerTransport = {
        socketId: string,
        remoteProducerId: string,
        consumerTransport: mediasoupClient.types.Transport,
        consumer: mediasoupClient.types.Consumer,
    }
}