import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import './styles.scss';
import Layout from '../../components/Layout';
import ReactPlayer from 'react-player';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  useIonViewWillLeave
} from '@ionic/react';
import {trash} from 'ionicons/icons';
import VertoSession from '../../verto/VertoSession';
import {UpdateMetadata, VlrService} from '../../services';
import StreamTable from './StreamTable';
import {FreeVlrResponse, SharedStreamTest} from '../../shared/types';
import {StreamService} from '../../services/StreamService';
import {RouteComponentProps} from 'react-router';
import {HTMLVideoStreamElement} from '../WatchParty/types';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';

export const getFakeAudioMediaStreamTrack = () => {
  const audioContext = new AudioContext();
  const audioDestination = audioContext.createMediaStreamDestination();
  return audioDestination.stream.getAudioTracks()[0];
};

enum StreamType {
  Db = 'db',
  Custom = 'custom'
}

enum RoomStatus {
  Connecting = 'Connecting to',
  Connected = 'Connected to',
  Disconnected = 'Disconnected from'
}

const updateRoomMeta = async (roomId: string, streamId: number) => {
  const updateMetaData: UpdateMetadata = {
    channelDescription: '',
    channelGenre: '',
    channelLanguage: '',
    channelLogo: '',
    streamUrl: '',
    roomId: roomId,
    streamCamera: false,
    streamId,
    isPrivate: true,
    channelName: 'Stream test'
  };

  await VlrService.updateMetadata(updateMetaData);
};

export type UpdateTableStream = {
  id: number,
  playedSuccessfully: boolean,
  lastActive: string
};

type VideoSettings = {
  aspectRatio?: number,
  height?: number,
  width?: number,
  frameRate?: number
};

const StreamTestPage: FC<RouteComponentProps> = () => {
  const {astraUrl} = useSelector(({webConfig}: ReduxSelectors) => webConfig);

  const streamUrlInputRef = useRef<HTMLIonInputElement>(null);
  const errorsBottomRef = useRef<HTMLDivElement>(null);
  const vertoSession = useRef<VertoSession | null>(null);
  const streamConnectionAttemptsTimeout = useRef<NodeJS.Timeout>();
  const vlr = useRef<FreeVlrResponse | null>(null);
  const selectedStream = useRef<SharedStreamTest | null>(null);
  const streamConnectionAttempts = useRef<number>(1);
  const reactPlayerVideoRef = useRef<HTMLVideoStreamElement | null>(null);

  const [streamUrl, setStreamUrl] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [hasAudio, setHasAudio] = useState<boolean>(false);
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [loadPlayer, setLoadPlayer] = useState<boolean>(false);
  const [streamType, setStreamType] = useState<StreamType>(StreamType.Db);
  const [updateTableStream, setUpdateTableStream] = useState<UpdateTableStream>();
  const [videoSettings, setVideoSettings] = useState<VideoSettings | null>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  useIonViewWillLeave(() => {
    setLoadPlayer(false);
    vertoSession.current?.hangup();
    streamConnectionAttemptsTimeout.current && clearTimeout(streamConnectionAttemptsTimeout.current);
  }, []);

  useEffect(() => {
    // Get mic permission. It is needed by webrtc
    navigator.mediaDevices.getUserMedia({audio: true, video: false}).then();

    const onBeforeUnloadListener = () => {
      vertoSession.current?.hangup();
    };

    window.addEventListener('beforeunload', onBeforeUnloadListener);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnloadListener);
    };
  }, []);

  useEffect(() => {
    if (!loadPlayer) {
      reactPlayerVideoRef.current = null;
    }
  }, [loadPlayer]);

  const handlePlayerStreamReady = useCallback((reactPlayer: ReactPlayer) => {
    const videoElement = reactPlayer.getInternalPlayer() as HTMLVideoStreamElement;

    try {
      videoElement.play()
        .then(() => {
          setShowSpinner(false);
          reactPlayerVideoRef.current = videoElement;

          let capturedStream: MediaStream | null = null;
          if (videoElement.captureStream) {
            capturedStream = videoElement.captureStream();
          } else if (videoElement.mozCaptureStream) {
            capturedStream = videoElement.mozCaptureStream();
          }
          setHasAudio(capturedStream ? !!capturedStream.getAudioTracks().length : false);
          setHasVideo(capturedStream ? !!capturedStream.getVideoTracks().length : false);

          if (capturedStream && capturedStream.getVideoTracks().length && capturedStream.getVideoTracks()[0].getSettings()) {
            const {aspectRatio, height, width, frameRate} = capturedStream.getVideoTracks()[0].getSettings();
            setVideoSettings({
              aspectRatio,
              height,
              width,
              frameRate
            });
          }

          if (selectedStream.current) {
            const playedSuccessfully = true;
            StreamService.updatePlayedSuccessfully(selectedStream.current.id, playedSuccessfully)
              .then(({data}) => {
                setUpdateTableStream({
                  id: data.id,
                  playedSuccessfully,
                  lastActive: data.last_active
                });
              });
          }
        })
        .catch((err: any) => console.log('Play error', err));
    } catch (e) {
      console.log('Catch error', e);
    }
  }, []);

  const handlePlayerStreamError = (err: any, context: any) => {
    if (!reactPlayerVideoRef.current) {
      setLoadPlayer(false);

      if (streamConnectionAttempts.current === 15 && selectedStream.current) {
        const playedSuccessfully = false;
        StreamService.updatePlayedSuccessfully(selectedStream.current.id, playedSuccessfully)
          .then(({data}) => {
            setUpdateTableStream({
              id: data.id,
              playedSuccessfully,
              lastActive: data.last_active
            });
          });

        streamConnectionAttempts.current = 1;
      } else {
        streamConnectionAttempts.current++;
      }

      streamConnectionAttemptsTimeout.current = setTimeout(() => {
        setLoadPlayer(true);
      }, 4000);
    }

    if (context) {
      if (context.type && context.url && context.response) {
        setErrors(prevState => [
          ...prevState,
          `[${new Date().toLocaleTimeString()}] --${context.response.text || 'Check browser console for more info'} (${context.response.code})-- ${context.url}`
        ]);
      }

      if (context.fatal) {
        setLoadPlayer(false);
      }
    }

    console.log(context);
  };

  const handlePlayerLoad = () => {
    if (loadPlayer) {
      setLoadPlayer(false);
      setTimeout(() => setLoadPlayer(true));
    } else {
      setLoadPlayer(true);
    }
  };

  const resetValues = () => {
    streamConnectionAttemptsTimeout.current && clearTimeout(streamConnectionAttemptsTimeout.current);
    streamConnectionAttempts.current = 1;
    setVideoSettings(null);
    setHasAudio(false);
    setHasVideo(false);
  };

  const handleStreamPlay = (stream: SharedStreamTest) => {
    resetValues();
    selectedStream.current = stream;
    setStreamUrl(stream.url);
    setShowSpinner(true);

    if (vertoSession.current) {
      const regex = new RegExp(astraUrl);

      if (!astraUrl || regex.test(stream.url)) {
        StreamService.requestAstraStreamOpening(stream.url).then();
        setLoadPlayer(false);
        setTimeout(() => {
          setLoadPlayer(true);
        });
      }

      return;
    }

    const execute = async () => {
      const {data} = await VlrService.getFreeVlr();
      vlr.current = data;

      await updateRoomMeta(vlr.current?.public_id, stream.id);

      const moderatorUsername = vlr.current?.moderator_username;
      const moderatorPassword = vlr.current?.moderator_password;

      setRoomStatus(RoomStatus.Connecting);

      vertoSession.current = new VertoSession({
        realNumber: vlr.current?.room_id,
        fsUrl: vlr.current?.fs_url || undefined,
        callerName: moderatorUsername,
        moderatorUsername,
        moderatorPassword,
        localStream: new MediaStream([getFakeAudioMediaStreamTrack()]),
        connectionType: "stream_test_2",
        incomingBandwidth: 0,
        outgoingBandwidth: 1300,
        destinationNumber: `stream_test_stream_720`
      });

      vertoSession.current?.notification.onBootstrappedParticipants.subscribe((participants) => {
        setRoomStatus(RoomStatus.Connected);

        const participantsInTheRoom = participants.filter(p => !p.me);
        if (participantsInTheRoom.length) {
          participantsInTheRoom.forEach(p => vertoSession.current?.removeParticipant(p.participantId));
        }
        setLoadPlayer(true);
      });

      const resetParams = () => {
        setRoomStatus(RoomStatus.Disconnected);
        setLoadPlayer(false);
        setShowSpinner(false);
      };

      vertoSession.current?.notification.onEarlyCallError.subscribe(() => {
        resetParams();
      });

      vertoSession.current?.notification.onDestroy.subscribe(() => {
        resetParams();
      });
    };

    execute().catch(e => {
      console.error(e);
      handleStop();
    });
  };

  const handleOnSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    vertoSession.current?.hangup();
    vlr.current = null;
    setShowSpinner(true);
    setStreamUrl((streamUrlInputRef.current?.value as string) || '');
    handlePlayerLoad();
  };

  const handleStop = () => {
    selectedStream.current = null;
    resetValues();
    setLoadPlayer(false);
    setShowSpinner(false);
    vertoSession.current?.hangup();
    vertoSession.current = null;
  };

  return (
    <Layout className="stream-test-page">
      <IonGrid>
        <IonRow>
          <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="6" sizeXl="6" className="select-stream-col">
            <IonSegment value={streamType} onIonChange={e => setStreamType(e.detail.value as StreamType)}>
              <IonSegmentButton value={StreamType.Db}>
                <IonLabel>DB STREAMS</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value={StreamType.Custom}>
                <IonLabel>CUSTOM STREAM</IonLabel>
              </IonSegmentButton>
            </IonSegment>
            <div className="stream-table-holder" hidden={streamType !== StreamType.Db}>
              <StreamTable
                vertoSession={vertoSession.current}
                updateStream={updateTableStream}
                onPlay={handleStreamPlay}
                onStop={handleStop}
              />
            </div>
            <form className="custom-stream-form" onSubmit={handleOnSubmit} hidden={streamType !== StreamType.Custom}>
              <IonItem>
                <IonLabel position="stacked">Stream url</IonLabel>
                <IonInput ref={streamUrlInputRef} placeholder="Enter stream url"/>
              </IonItem>
              <IonButton type="submit">Load</IonButton>
              <IonButton type="button" onClick={handleStop} color="dark">Stop</IonButton>
            </form>
          </IonCol>
          <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="6" sizeXl="6" className="play-stream-col">
            {
              loadPlayer &&
              <ReactPlayer
                url={streamUrl}
                width="100%"
                height="auto"
                config={{
                  file: {
                    attributes: {
                      crossOrigin: 'true'
                    }
                  }
                }}
                controls
                onReady={handlePlayerStreamReady}
                onError={handlePlayerStreamError}
                style={{display: reactPlayerVideoRef.current ? 'block' : 'none'}}
              />
            }

            <div className="stream-info">
              {showSpinner &&
                <IonItem>
                  <IonSpinner name="bubbles"/>
                </IonItem>
              }

              {
                roomStatus && vlr.current &&
                <IonItem lines="none">{roomStatus} vlr {vlr.current?.public_id}</IonItem>
              }
              {
                selectedStream.current &&
                <IonItem lines="none">
                  {selectedStream.current.name}
                  {selectedStream.current.country && ` (${selectedStream.current.country})`}
                  {selectedStream.current.genre && ` - Genre: ${selectedStream.current.genre}`}
                </IonItem>
              }
              <IonItem lines="none">Audio: {hasAudio ? 'Yes' : 'No'}</IonItem>
              <IonItem lines="none">Video: {hasVideo ? 'Yes' : 'No'}</IonItem>
              {
                videoSettings &&
                <>
                  <IonItem lines="none">Resolution: {videoSettings.width}x{videoSettings.height} (Aspect
                    ratio: {videoSettings.aspectRatio || 'N/A'})</IonItem>
                  <IonItem lines="none">Frame rate: {videoSettings.frameRate || 'N/A'}</IonItem>
                </>
              }
              <IonList>
                <header>
                  <h2>Errors</h2>
                  <IonButtons>
                    <IonButton onClick={() => setErrors([])} title="Clear errors">
                      <IonIcon icon={trash} slot="icon-only"/>
                    </IonButton>
                  </IonButtons>
                </header>

                <div className="errors">
                  {
                    errors.map((error, index) =>
                      <IonItem lines="none" key={index}>{error}</IonItem>
                    )
                  }
                  <div ref={errorsBottomRef}/>
                </div>
              </IonList>
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
    </Layout>
  );
};

export default StreamTestPage;
