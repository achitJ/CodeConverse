"use client"

import { SocketContext } from "@/contexts/Socket";
import { useContext, useEffect, useState } from "react";
import useMediaSoup from "@/hooks/useMediasoup";

export default function MeetRoom({ params }: { params: { id: string } }) {
    const socket = useContext(SocketContext);
    const {localVideo, consumerTransports} = useMediaSoup(socket, params.id);
    const [consumers, setConsumers] = useState<Record<string, ConsumerTransport[]>>({});

    useEffect(() => {
        //group by socketId and save as array
        const grouped = consumerTransports.reduce((acc, curr) => {
            if (acc[curr.socketId]) {
                acc[curr.socketId].push(curr);
            } else {
                acc[curr.socketId] = [curr];
            }
            return acc;
        }, {} as Record<string, ConsumerTransport[]>);

        console.log(grouped);

        setConsumers(grouped);
    }, [consumerTransports]);

    return (
        <>
            <video muted ref={localVideo} style={{ width: "360px", backgroundColor: "black" }} />
            {Object.keys(consumers).map((socketId) => (
                <div key={socketId}>
                    {consumers[socketId].map((consumer) => {
                        const { track } = consumer.consumer;
                        const mediaStream = new MediaStream([track]);


                        if(track.kind === "video") {
                            return (
                                <video 
                                    key={consumer.remoteProducerId} 
                                    autoPlay 
                                    ref={(video) => {
                                        if(video) {
                                            console.log({mediaStream})
                                            video.srcObject = mediaStream;
                                        }
                                    }}
                                    style={{ width: "360px", backgroundColor: "black" }}
                                />
                            )
                        } else if(track.kind === "audio") {
                            return (
                                <audio key={consumer.remoteProducerId} autoPlay/>
                            )
                        }

                        return (
                            <div key={consumer.remoteProducerId}>
                                {consumer.remoteProducerId}
                            </div>
                        )
                    })}
                </div>
            ))}
        </>
    );
}