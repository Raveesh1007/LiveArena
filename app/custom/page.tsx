import {videoCodecs} from 'livekit-client';
import { VideoConferenceClientImpl } from './VideoConferenceclientImpl';
import { isVideoCodec } from '@/lib/types';

export default function CustomRoomConnection(props: {
    searchParams: {
        livekitURL: string;
        token?: string;
        codec?: string;
    };
}) {
    const {livekitURL, token, codec} = props.searchParams;
    if(typeof livekitURL! == 'string'){
        return <h2>Missing LiveKitURL</h2>
    }
    if(typeof token !== 'string'){
        return <h2>Missing Livekit Token</h2>
    }
    if(codec !== undefined && !isVideoCodec(codec)){
        return <h2>Invalid codec, if defined it has to be [{videoCodecs.join(', ')}].</h2>;
    }
    return (
        <main data-lk-theme="default">
            <VideoConferenceClientImpl livekitURL='{livekitURL}' token = {token} codec = {codec}/>
        </main>
    );

}