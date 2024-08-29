'use client';
import * as React from 'react';
import { LocalAudioTrack, Track } from 'livekit-client';
import {
  useMaybeLayoutContext,
  useLocalParticipant,
  MediaDeviceMenu,
  TrackToggle,
  useRoomContext,
  useIsRecording,
} from '@livekit/components-react';
import styles from '../styles/SettingsMenu.module.css';

/**
 * @alpha
 */
export interface SettingsMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * @alpha
 */
export function SettingsMenu(props: SettingsMenuProps) {
  const layoutContext = useMaybeLayoutContext();
  const room = useRoomContext();
  const recordingEndpoint = process.env.NEXT_PUBLIC_LK_RECORD_ENDPOINT;

  const settings = React.useMemo(() => {
    return {
      media: { camera: true, microphone: true, label: 'Media Devices', speaker: true },
      effects: { label: 'Effects' },
      recording: recordingEndpoint ? { label: 'Recording' } : undefined,
    };
  }, []);

  const tabs = React.useMemo(
    () => Object.keys(settings).filter((t) => t !== undefined) as Array<keyof typeof settings>,
    [settings],
  );
  const { microphoneTrack } = useLocalParticipant();

  const [activeTab, setActiveTab] = React.useState(tabs[0]);
  const [isNoiseFilterEnabled, setIsNoiseFilterEnabled] = React.useState(true);

  React.useEffect(() => {
    const micPublication = microphoneTrack;
    if (micPublication && micPublication.track instanceof LocalAudioTrack) {
      const currentProcessor = micPublication.track.getProcessor();
      if (currentProcessor && !isNoiseFilterEnabled) {
        micPublication.track.stopProcessor();
      } else if (!currentProcessor && isNoiseFilterEnabled) {
        import('@livekit/krisp-noise-filter')
          .then(({ KrispNoiseFilter, isKrispNoiseFilterSupported }) => {
            if (!isKrispNoiseFilterSupported()) {
              console.error('Enhanced noise filter is not supported for this browser');
              setIsNoiseFilterEnabled(false);
              return;
            }
            micPublication?.track
              // @ts-ignore
              ?.setProcessor(KrispNoiseFilter())
              .then(() => console.log('successfully set noise filter'));
          })
          .catch((e) => console.error('Failed to load noise filter', e));
      }
    }
  }, [isNoiseFilterEnabled, microphoneTrack]);

  const isRecording = useIsRecording();
  const [initialRecStatus, setInitialRecStatus] = React.useState(isRecording);
  const [processingRecRequest, setProcessingRecRequest] = React.useState(false);

  React.useEffect(() => {
    if (initialRecStatus !== isRecording) {
      setProcessingRecRequest(false);
    }
  }, [isRecording, initialRecStatus]);

  const toggleRoomRecording = async () => {
    if (!recordingEndpoint) {
      throw TypeError('No recording endpoint specified');
    }
    if (room.isE2EEEnabled) {
      throw Error('Recording of encrypted meetings is currently not supported');
    }
    setProcessingRecRequest(true);
    setInitialRecStatus(isRecording);
    let response: Response;
    if (isRecording) {
      response = await fetch(recordingEndpoint + `/stop?roomName=${room.name}`);
    } else {
      response = await fetch(recordingEndpoint + `/start?roomName=${room.name}`);
    }
    if (response.ok) {
    } else {
      console.error(
        'Error handling recording request, check server logs:',
        response.status,
        response.statusText,
      );
      setProcessingRecRequest(false);
    }
  };

  return (
    <div className="Settings-Menu" style={{ width: '100%'}} {...props}>
        <div className = {styles.tabs}>
            {tabs.map(
                (tab)=>
                settings[tab]&&(
                    <button
                    className={`${styles.tab} lk-button`}
                    key = {tab}
                    onClick = {()=> setActiveTab(tab)}
                    aria-pressed = {activeTab === tab}
                    >{
                        // @ts-ignore
                        settings[tab].label
                      }
                      </button>
                ),
                )}
        </div>
        <div className="tab-content">
            {activeTab === 'media' && (
                <>
                    <h3>Camera</h3>
                    <section className="lk-button-group">
                        <TrackToggle source = {Track.Source.Camera}>Camera</TrackToggle>
                        
                    </section>
                </>
            )}
        </div>

    </div>
  )