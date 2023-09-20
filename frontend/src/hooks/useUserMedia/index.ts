import { useEffect, useRef, useState } from "react";

export default function useUserMediaStream() {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: {
                    min: 640,
                    max: 1280,
                },
                height: {
                    min: 400,
                    max: 720,
                }
            }
        }).then(stream => {
            setLocalStream(stream);
        }).catch(err => {
            console.log(err);
        });
    }, []);

    return localStream;
}