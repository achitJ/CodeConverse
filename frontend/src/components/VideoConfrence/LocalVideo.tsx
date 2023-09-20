import { RefObject, useEffect, useState } from "react";
import style from "./styles";
import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";

export default function LocalVideo(
    { localVideo }:
        { localVideo: RefObject<HTMLVideoElement> }
) {
    return (
        <div className={style.videoBox}>
            <video
                muted
                ref={localVideo}
                className={style.video}
            />
        </div>
    )
}

export function MuteButton({ userMediaStream }: { userMediaStream: RefObject<MediaStream> }) {
    const [muted, setMuted] = useState(false);

    const muteHandler = () => {
        setMuted(!muted);
    }

    useEffect(() => {
        if (userMediaStream) {
            userMediaStream.current?.getAudioTracks().map(track => {
                track.enabled = !muted;
            });
        }
    }, [muted]);

    return (
        <div className="rounded-full cursor-pointer" onClick={muteHandler}>
            {!muted ? <IconMicrophone size={48} /> : <IconMicrophoneOff size={48} />}
        </div>
    )
}