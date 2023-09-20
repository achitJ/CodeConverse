"use client"

import { SocketContext } from "@/contexts/Socket";
import { useContext, useEffect, useState } from "react";
import useMediaSoup from "@/hooks/useMediasoup";
// import useUserMediaStream from "@/hooks/useUserMedia";
import LocalVideo, { MuteButton } from "./LocalVideo";
import style from "./styles";

export default function MeetRoom({ id }: { id: string }) {
    const socket = useContext(SocketContext);
    // const userMediaStream = useUserMediaStream();
    const { userMediaStream, localVideo, consumerTransports } = useMediaSoup(socket, id);
    const [consumers, setConsumers] = useState<Record<string, ConsumerTransport[]>>({});
    const [newConsumer, setNewConsumer] = useState<ConsumerTransport[]>([]);

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
            <div className="w-full rounded-sm flex justify-center flex-wrap gap-4 p-2">
                <LocalVideo localVideo={localVideo} />
                {Object.keys(consumers).map((socketId) => (
                    <div key={socketId} className={style.videoBox}>

                        {consumers[socketId].map((consumer) => {
                            const { track } = consumer.consumer;
                            const mediaStream = new MediaStream([track]);


                            if (track.kind === "video") {
                                return (
                                    <video
                                        key={consumer.remoteProducerId}
                                        autoPlay
                                        ref={(video) => {
                                            if (video) {
                                                console.log({ mediaStream })
                                                video.srcObject = mediaStream;
                                            }
                                        }}
                                        className={style.video}
                                    />
                                )
                            } else if (track.kind === "audio") {
                                return (
                                    <audio
                                        key={consumer.remoteProducerId}
                                        autoPlay
                                        ref={(audio) => {
                                            if (audio) {
                                                console.log({ mediaStream })
                                                audio.srcObject = mediaStream;
                                            }
                                        }}
                                        className="max-w-none"
                                    />
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

            </div>
            <div className="w-full bg-gray-200 h-24 fixed bottom-0 flex justify-center items-center">
                <MuteButton userMediaStream={userMediaStream} />
            </div>
        </>
    );
}