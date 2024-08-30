'use Client';
import { decodePassphrase } from '@/lib/client-utils';
import { DebugMode } from '@/lib/debug';
import { connectionDetails } from '@/lib/types';
import { RecordingIndicator } from '@/lib/Recordinglogo';
import { SettingsMenu } from '@/lib/SettingMenu';
import {
    formatChatMessageLinks,
    LiveKitRoom,
    LocalUserChoices,
    PreJoin,
    VideoConference,
} from '@livekit/components-react';
import {
    ExternalE2EEKeyProvider,
    RoomOptions,
    VideoCodec,
    VideoPresets,
    Room,
    DeviceUnsupportedError,
    RoomConnectOptions,
    VideoPreset,
    setLogLevel,
  } from 'livekit-client';

import { useRouter } from 'next/navigation';
import React from 'react';

const CONN_DETAILS_ENDPOINT =
  process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details';
const SHOW_SETTINGS_MENU = process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU == 'true';

export function PageClientImpl(props:{
    roomName: string;
    region: string;
    hq: boolean;
    codec: VideoCodec;
}) {
    const[preJoinChoices, setPreJoinChoices] = React.useState<LocalUserChoices | undefined>(
        undefined,
    );
    const preJoinDefaults = React.useMemo(() => {
        return {
            userName: '',
            videoEnabled: true,
            audioEnabled: true,
        };
    }, []);
    const [connectionDetails, setConnectionDetails] = React.useState<connectionDetails | undefined>(
        undefined,
    );

    const handlePreJoinSubmit = React.useCallback(async(values: LocalUserChoices) => {
        setPreJoinChoices(values);
        const url = new URL('/',window.location.origin);
        url.pathname =  CONN_DETAILS_ENDPOINT;
        url.searchParams.append('roomName', props.roomName);
        url.searchParams.append('participantName', values.username);
        if(props.region){
            url.searchParams.append('region', props.region);
        }
        const connectionDetailsResp = await fetch(url.toString());
        const connectionDetailsData = await connectionDetailsResp.json();
        setConnectionDetails(connectionDetailsData);
    }, []);

    const handlePreJoinError = React.useCallback((e: any) =>console.error(e),[]);

    return (
        <main data-lk-theme = "default">
            {connectionDetails === undefined || preJoinChoices === undefined ? (
                <div style={{display: 'grid', placeItems: 'center', height: '100%'}}>
                    <PreJoin
                        defaults = {preJoinDefaults}
                        onSubmit= { handlePreJoinSubmit }
                        onError = { handlePreJoinError }
                        />
                </div>
            ) : (
                <VideoConferenceComponent
          connectionDetails={connectionDetails}
          userChoices={preJoinChoices}
        options={{ codec: props.codec, hq: props.hq }}
        />
      )}
    </main>
  );
}

function VideoConferenceComponent(props: {
    userChoices: LocalUserChoices;
    connectionDetails: connectionDetails;
    options: {
      hq: boolean;
      codec: VideoCodec;
    };
  }) {
    const e2eePassphrase = 
    typeof window !== 'undefined' && decodePassphrase(location.hash.substring(1));

    const worker = 
    typeof window ! == 'undefined' && e2eePassphrase && 
    new Worker(new URL('livekit-e2ee-worker.js', import.meta.url));

    const e2eeEnabled = !!(e2eePassphrase && worker);
    const keyprovider = new ExternalE2EEKeyProvider();

    const roomOptions = React.useMemo((): RoomOptions => {
        let videoCodec: VideoCodec | undefined = props.options.codec ? props.options.codec : 'vp9';
        if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
          videoCodec = undefined;
        }

        return {
            videoCaptureDefaults: {
            deviceId: props.userChoices.videoDeviceId,
            resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720,
            },
            publishDefaults: {
            dtx: false,
            videoSimulcastLayers: props.options.hq 
                ? [VideoPresets.h1080, VideoPresets.h720]
                : [VideoPresets.h540, VideoPresets.h360],
            red: !e2eeEnabled,
            videoCodec,
            },
            audioCaptureDefaults: {
            deviceId: props.userChoices.audioDeviceId ?? undefined, 
            },
            adaptiveStream: { pixelDensity: 'screen' },
            dynacast: true,
            e2ee: e2eeEnabled
        ? {
            keyProvider: keyprovider,
            worker,
          }
        : undefined,
        };
        setLogLevel('debug');
    }, [props.userChoices, props.options.hq, props.options.codec]);
        
    const room = React.useMemo(() => new Room (roomOptions),[]);
    if(e2eeEnabled){
        keyprovider.setKey(decodePassphrase(e2eePassphrase));
        room.setE2EEEnabled(true).catch((e) =>{
        if (e instanceof DeviceUnsupportedError){
            alert('Youre trying to join a encrypted meeting, but your browser does not support it, please update it and join it', 

            );
            console.error(e);
        }
        });
    }
    const connectOptions = React.useMemo(() : RoomConnectOptions => {
        return {
            autoSubscribe: true,
        };
    }, []);

    const router = useRouter();
    const handleOnLeave = React.useCallback(() =>router.push('/'), [router]);

    return (
        <>
        <LiveKitRoom
        room = {room}
        token = {props.connectionDetails.participantToken}
        serverUrl='{props.connectionDetails.serverurl}'
        connectOptions={connectOptions}
        video = {props.userChoices.videoEnabled}
        audio = {props.userChoices.audioEnabled}
        onDisconnected={handleOnLeave}
        >
            <VideoConference
            chatMessageFormatter={formatChatMessageLinks}
            SettingsComponent={SHOW_SETTINGS_MENU ? SettingsMenu : undefined}
            />
            <DebugMode />
            <RecordingIndicator />
            </LiveKitRoom>
        </>
    );
}

