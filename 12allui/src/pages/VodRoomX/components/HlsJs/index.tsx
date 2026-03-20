import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import Hls, {HlsConfig} from 'hls.js';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonPopover,
  IonRouterLink,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/react';
import {HTMLVideoStreamElement} from '../../types';
import VertoSession from '../../../../verto/VertoSession';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../../redux/shared/types';
import axios from 'axios';
import {API_URL} from '../../../../shared/constants';
import appStorage from '../../../../shared/appStorage';
import {setErrorToast} from '../../../../redux/actions/toastActions';
import {CapStream, CHROMIUM, Tune, TUNES_INITIAL, TuneType, WP_HLS} from '../shared/hls';

interface HlsJsProps {
  open: boolean;
  onClose: () => void;
  streamUrl?: string | null;
  setStreamUrl: (value: string | null) => void;
}

const HlsJs: FC<HlsJsProps> = ({open, onClose, streamUrl, setStreamUrl}: HlsJsProps) => {
  const dispatch = useDispatch();

  const roomRef = useRef<HTMLVideoElement>(null);
  const origRef = useRef<HTMLVideoStreamElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const profile = useSelector(({profile}: ReduxSelectors) => profile);

  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [pop, setPop] = useState<{ show: boolean, event?: any }>({show: false});
  const [tunes, setTunes] = useState<Tune[]>(TUNES_INITIAL);
  const [selectedTunes, setSelectedTunes] = useState<Tune[]>([]);
  const [capStream, setCapStream] = useState<CapStream>({width: null, height: null});
  const [vertoSession, setVertoSession] = useState<VertoSession | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [publicRoomId, setPublicRoomId] = useState<string>('');
  const [moderatorUsername, setModeratorUsername] = useState<string>('');
  const [streamResolution, setStreamResolution] = useState<{ width: number, height: number } | null>(null);
  const [selectResolution, setSelectResolution] = useState<string>('1');

  useEffect(() => {
    const storageTunes: Tune[] | null = appStorage.getObject(WP_HLS);

    if (storageTunes) {
      setSelectedTunes(storageTunes);
      setTunes(prevState => prevState.map(t => ({...t, isChecked: !!storageTunes.find(st => st.name === t.name)})));
    }
  }, []);

  useEffect(() => {
    const data = {};
    const config = {
      headers: {
        Authorization: `Bearer ${profile.jwt}`,
      }
    };

    axios
      .post(`${API_URL}/vlr`, data, config)
      .then(({data}) => {
        const {room_id, public_id, moderator_username} = data;
        setRoomId(room_id);
        setPublicRoomId(public_id);
        setModeratorUsername(moderator_username);
      })
      .catch((error) => console.log(error));
  }, [profile.jwt]);

  const handleApply = () => {
    if (!streamUrl) {
      return;
    }

    if (!origRef.current) {
      alert('No video ref');
      return;
    }

    handleDisconnect();

    appStorage.setItem(WP_HLS, JSON.stringify(selectedTunes));

    const config: Partial<HlsConfig> = {};

    selectedTunes.forEach(({name, value}: Tune) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'number' && isNaN(value)) {
          return;
        }
        // @ts-ignore
        config[name] = value;
      }
    });

    const hls = new Hls(config);
    setHlsInstance(hls);

    hls.attachMedia(origRef.current);

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(streamUrl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const play = async () => {
          const origEl = origRef.current;
          if (!origEl) {
            alert('No video ref on play');
            return;
          }

          await origEl.play();

          let capturedStream: MediaStream;

          if (origEl.captureStream) {
            capturedStream = origEl.captureStream();
          } else if (origEl.mozCaptureStream) {
            const stream = origEl.mozCaptureStream();
            const tracks = [stream.getAudioTracks()[0]];

            if (stream.getVideoTracks().length) {
              tracks.push(stream.getVideoTracks()[0]);
            }

            capturedStream = new MediaStream(tracks);

            if (audioRef.current) {
              audioRef.current.srcObject = stream;
              audioRef.current.play().then();
            }
          } else {
            throw new Error('Capture stream is not supported');
          }

          const establishSession = () => {
            const session = new VertoSession({
              streamNumber: `${roomId}_stream`,
              realNumber: roomId,
              callerName: moderatorUsername,
              localStream: capturedStream,
              isHost: true,
              giveFloor: true,
              isHostSharedVideo: true,
              connectionType: "stream_hls",
              incomingBandwidth: 1500,
              outgoingBandwidth: 1300,
              destinationNumber: `${roomId}_stream_720`

            });

            setVertoSession(session);

            session.notification.onPlayRemoteVideo.subscribe((stream: MediaStream) => {
              if (roomRef?.current) {
                roomRef.current.srcObject = stream;
              }
            });

            session.notification.onBootstrappedParticipants.subscribe(() => {
              session.togglePrimaryMic();
            });
          };

          const width = capturedStream.getVideoTracks()[0].getSettings().width as number;
          const height = capturedStream.getVideoTracks()[0].getSettings().height as number;
          setCapStream({width, height});

          if (streamResolution === null) {
            establishSession();
          } else {
            capturedStream.getVideoTracks()[0]
              .applyConstraints({width: streamResolution.width, height: streamResolution.height})
              .then(() => {
                console.log('STREAM SETTINGS', capturedStream.getVideoTracks()[0].getSettings());
                establishSession();
              })
              .catch(err => {
                dispatch(setErrorToast('Error while trying to apply video constraints'));
                console.error(err);
              });
          }
        };

        play().catch(err => console.error(err));
      });
    });
  };

  const handlePop = (event: React.MouseEvent) => {
    event.persist();
    setPop({show: true, event});
  };

  const dismissPop = () => setPop({show: false});

  const okPop = () => {
    setSelectedTunes(tunes.filter(t => t.isChecked));
    dismissPop();
  };

  const handleDisconnect = () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      setHlsInstance(null);
    }

    if (vertoSession) {
      vertoSession.hangup();
      vertoSession.notification.removeAllSubscribers();
      setVertoSession(null);
    }
  };

  const handleWillDismiss = () => {
    handleDisconnect();
    onClose();
  };

  const handleResolutionSelection = (value: string) => {
    setSelectResolution(value);

    switch (value) {
      case '1':
        setStreamResolution(null);
        return;
      case '180':
        setStreamResolution({width: 320, height: 180});
        return;
      case '360':
        setStreamResolution({width: 640, height: 360});
        return;
      case '480':
        setStreamResolution({width: 854, height: 480});
        return;
      case '720':
        setStreamResolution({width: 1280, height: 720});
        return;
    }
  };

  return (
    <div className="hls-js-component">
      <IonModal
        isOpen={open}
        onWillDismiss={handleWillDismiss}
        backdropDismiss={false}
        className="hls-js-modal"
      >
        <IonToolbar>
          <IonTitle>HLS</IonTitle>
        </IonToolbar>

        <main>
          <section className="room-section">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Room Stream</IonCardTitle>
                <IonCardSubtitle>Room ID: {publicRoomId || 'N/A'}</IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>
                <video ref={roomRef} className="room-video" autoPlay/>
              </IonCardContent>
            </IonCard>
          </section>

          <section className="config-section">
            <IonCard>
              <IonCardContent className="config-list-content">
                <div className="config-top">
                  <div className="input-container">
                    <IonItem className="input-item" color="light">
                      <IonInput
                        placeholder="Type .m3u8 url"
                        value={streamUrl}
                        onIonChange={(e) => setStreamUrl(e.detail.value || null)}
                      />
                    </IonItem>

                    <IonItem color="light" className="select-resolution" disabled={!CHROMIUM}>
                      <IonLabel position="floating">Change stream resolution</IonLabel>
                      <IonSelect
                        value={selectResolution}
                        onIonChange={(e) => handleResolutionSelection(e.detail.value)}
                      >
                        <IonSelectOption value="1">
                          Original {capStream.width && `${capStream.width}x${capStream.height}`}
                        </IonSelectOption>
                        <IonSelectOption value="180">320x180</IonSelectOption>
                        <IonSelectOption value="360">640x360</IonSelectOption>
                        <IonSelectOption value="480">854x480</IonSelectOption>
                        <IonSelectOption value="720">1280x720</IonSelectOption>
                      </IonSelect>
                    </IonItem>

                    {!CHROMIUM &&
                    <IonText color="warning" className="message-resolution">Change stream resolution is applicable only
                      on chrome and edge</IonText>}
                  </div>

                  <div className="output-container">
                    <video ref={origRef} className="original-video" controls/>
                    <audio ref={audioRef} hidden/>
                  </div>
                </div>

                <IonItem className="hls-configs-header" color="secondary">
                  <IonLabel>HLS Configs</IonLabel>
                  <IonButton onClick={handlePop} color="dark" fill="solid" slot="end">Add config</IonButton>
                </IonItem>

                <div className="selected-tunes">
                  {selectedTunes.map((t: Tune) => (
                    <IonItem key={t.name} color="light" lines="none">
                      {
                        t.type === TuneType.Boolean ?
                          <>
                            <IonLabel>{t.name}</IonLabel>
                            <IonToggle
                              checked={t.value as boolean}
                              onIonChange={e => setSelectedTunes(prevState => prevState.map(prev => {
                                if (prev.name === t.name) {
                                  prev.value = e.detail.checked;
                                }
                                return {...prev};
                              }))}
                            />
                          </> :
                          <>
                            <IonLabel position="floating">{t.name}</IonLabel>
                            <IonInput
                              type="number"
                              placeholder="Type value"
                              value={t.value as number}
                              onIonChange={(e) => (t.value = (e.detail.value !== undefined && e.detail.value !== null) ? parseInt(e.detail.value) : null)}
                            />
                          </>
                      }
                    </IonItem>
                  ))}
                </div>

                <IonToolbar>
                  <IonButton onClick={handleApply} color="primary" fill="solid">Apply</IonButton>
                </IonToolbar>
              </IonCardContent>
            </IonCard>
          </section>
        </main>

        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleDisconnect}>Disconnect video and room</IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={handleWillDismiss} color="primary">Close</IonButton>
          </IonButtons>
        </IonToolbar>

        <IonPopover
          className="hls-js-config-pop"
          isOpen={pop.show}
          event={pop.event}
          onDidDismiss={dismissPop}
        >
          <IonList color="light">
            <IonListHeader>
              <IonRouterLink
                href="https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning"
                target="_blank">To check properties description click here</IonRouterLink>
            </IonListHeader>

            <div className="config-props-list">
              {tunes.map(({name, isChecked}: Tune, index: number) => (
                <IonItem key={name} lines="none">
                  <IonCheckbox
                    checked={isChecked}
                    slot="start"
                    onIonChange={(e) => {
                      setTunes(prevState => {
                        prevState[index].isChecked = e.detail.checked;
                        return prevState;
                      });
                    }}
                  />
                  <IonLabel>{name}</IonLabel>
                </IonItem>
              ))}
            </div>
          </IonList>

          <IonToolbar>
            <IonButtons slot="end">
              <IonButton onClick={dismissPop}>Dismiss</IonButton>
              <IonButton onClick={okPop}>Ok</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonPopover>
      </IonModal>
    </div>
  );
};

export default HlsJs;
