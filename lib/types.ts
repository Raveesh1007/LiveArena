import { LocalAudioTrack, LocalVideoTrack, videoCodecs } from 'livekit-client';
import { VideoCodec } from 'livekit-client';

export interface SessionProps{
    roomname: string;
    identity: string;
    audioTrack?: LocalAudioTrack;
    videoTrack?: LocalVideoTrack;
    region?: string;
    turnServer?: RTCIceServer;
    forceRelay?: boolean;

}

export interface TokenResult{
    identity: string;
    accessToken: string;
}

export function isVideoCodec(codec: string): codec is VideoCodec{
    return videoCodecs.includes(codec as VideoCodec);
}

export type connectionDetails = {
    serverurl: string;
    roomName: string;
    participantName: string;
    participantToken: string;
};