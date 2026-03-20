import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonRange,
  IonReorder,
  IonReorderGroup,
  IonText
} from '@ionic/react';
import {ItemReorderEventDetail} from '@ionic/core';
import {
  albumsOutline,
  pauseOutline,
  playBackOutline,
  playForwardOutline,
  playOutline,
  repeatOutline,
  volumeLowOutline,
  volumeMediumOutline,
  volumeMuteOutline,
  volumeOffOutline
} from 'ionicons/icons';
import {VideoJsPlayer} from 'video.js';
import {useTranslation} from 'react-i18next';
import appStorage from '../../../shared/appStorage';
import {INIT_GAIN_VOL, INIT_VOL} from '../../../shared/constants';
import {FileStreamSource, MyStreamSource} from '../types';
import {useDispatch} from 'react-redux';
import {setInRoom} from '../../../redux/actions/inRoomActions';

type Props = {
  vjs: VideoJsPlayer;
  talking: boolean;
  myStream: MyStreamSource | MyStreamSource[] | null;
  files: FileStreamSource[] | null;
  gainNode?: GainNode;
  onSyncAudio?: (muted: boolean, volume: number, targetPlayer?: VideoJsPlayer) => void;
  onTrackChange: () => void;
};

type Time = { display: string; seconds: number };
type PlayIndex = { back: number; current: number; forward: number };
type Vol = { muted: boolean; value: number; lastValue: number; muteWhenSpeak: boolean; lowerWhenSpeak: boolean; userMuted: boolean };
type ManageVol = { muteWhenSpeak: 'true' | 'false'; lowerWhenSpeak: 'true' | 'false' };

const INIT_TIME = {display: '0:00:00', seconds: 0};
const MANAGE_VOLUME_WHEN_SPEAKING = 'manageVolumeWhenSpeaking';

const getDisplayTime = (h: number, m: number, s: number, showH: boolean, showM: boolean) => {
  const hDisplay = showH ? `${h}:` : '';
  const mDisplay = showM ? `${m.toString().padStart(2, '0')}:` : '';
  const sDisplay = s.toString().padStart(2, '0');

  return `${hDisplay}${mDisplay}${sDisplay}`;
};

const parseTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 3600 % 60);

  return {h, m, s};
};

const parseTrackDuration = (duration: number) => {
  // -1 to keep alive the peer stream
  return Math.round(duration) - 1;
};

const PlayerControlBar: FC<Props> = ({
                                       vjs,
                                       talking,
                                       myStream,
                                       files,
                                       gainNode,
                                       onTrackChange,
                                       onSyncAudio
                                     }: Props) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const [copyList, setCopyList] = useState<FileStreamSource[]>([]);
  const [showSeekSlider, setShowSeekSlider] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playIndex, setPlayIndex] = useState<PlayIndex>({back: 0, current: 0, forward: 1});
  const [vol, setVol] = useState<Vol>({
    muted: false,
    value: INIT_VOL,
    lastValue: INIT_VOL,
    muteWhenSpeak: true,
    lowerWhenSpeak: false,
    userMuted: false
  });
  const [duration, setDuration] = useState<Time>(INIT_TIME);
  const [currentTime, setCurrentTime] = useState<Time>(INIT_TIME);
  const [seek, setSeek] = useState<boolean>(false);
  const [showTrackList, setShowTrackList] = useState<boolean>(false);
  const [reorderedList, setReorderedList] = useState<FileStreamSource[]>([]);
  const [loop, setLoop] = useState<boolean>(false);
/*
  useEffect(() => {
    const data: ManageVol | null = appStorage.getObject(MANAGE_VOLUME_WHEN_SPEAKING);
    console.log('MANAGE_VOLUME_WHEN_SPEAKING',data)
    if (data) {
      setVol(prevState => ({
        ...prevState,
        muteWhenSpeak: data.muteWhenSpeak === 'true',
        lowerWhenSpeak: data.lowerWhenSpeak === 'true'
      }));
    }
  }, []);
 */
  useEffect(() => {
    const updateMetaData = () => {
      const dur = vjs.duration();

      if (dur === 0 || isNaN(dur) || dur === Infinity) {
        setShowSeekSlider(false);
        return;
      }

      setShowSeekSlider(true);

      const seconds = parseTrackDuration(dur);

      const {h, m, s} = parseTime(seconds);

      setDuration({
        seconds,
        display: getDisplayTime(h, m, s, h > 0, m > 0)
      });
    };

    updateMetaData();

    vjs.on('loadedmetadata', () => {
      updateMetaData();
    });

    vjs.on('play', () => {
      setIsPlaying(true);
    });

    let stuckTimeout: NodeJS.Timeout;

    vjs.on('pause', () => {
      setIsPlaying(false);
      stuckTimeout && clearTimeout(stuckTimeout);
    });

    vjs.on('timeupdate', () => {
      if (vjs.duration() === Infinity) {
        if (myStream && vjs.currentTime() > 0) {
          stuckTimeout && clearTimeout(stuckTimeout);

          // if video stuck, reset stream
          stuckTimeout = setTimeout(() => {            
            // @@@ 
            console.log('@@@ DISABLING STUCK STREAM HANDLE');

            vjs.src(myStream);
            vjs.play()?.then(() => onTrackChange());
          }, 1000);
        }
        return;
      }

      const totalDuration = parseTrackDuration(vjs.duration());
      const time = parseTime(totalDuration);

      const seconds = Math.round(vjs.currentTime());
      const {h, m, s} = parseTime(seconds);

      setCurrentTime({
        seconds,
        display: getDisplayTime(h, m, s, time.h > 0, time.m > 0)
      });

      if (seconds === totalDuration) {
        if (reorderedList.length === 0) {
          vjs.pause();
        } else {
          setPlayIndex(prevState => {
            if (prevState.current === prevState.forward) {
              if (vjs.loop()) {
                if (reorderedList.length === 1) {
                  vjs.currentTime(0);
                } else {
                  vjs.src(reorderedList[0]);
                  vjs.play()?.then(() => onTrackChange());
                  return {back: 0, current: reorderedList[0].id, forward: 1};
                }
              } else {
                vjs.pause();
              }
              return prevState;
            }

            const currentTrackIndex = reorderedList.findIndex(l => l.id === prevState.current);
            const next = reorderedList[currentTrackIndex + 1];
            vjs.src(next);
            vjs.play()?.then(() => onTrackChange());

            const forward = (currentTrackIndex + 2) < reorderedList.length ? (currentTrackIndex + 2) : next.id;

            return {back: currentTrackIndex, current: next.id, forward};
          });
        }
      }
    });

    let loading = false;
    vjs.on('error', () => {
      if (!loading) {
        loading = true;
        dispatch(setInRoom({loadingStream: loading}));
      }

      if (myStream) {
        vjs.src(myStream);
      } else if (files) {
        vjs.src(files[0]);
      }

      vjs.play()
        ?.then(() => {
          loading = false;
          dispatch(setInRoom({loadingStream: loading}));
          onTrackChange();
        });

      console.log('TRYING TO RECONNECT');
    });

    return () => {
      stuckTimeout && clearTimeout(stuckTimeout);
      vjs.off('loadedmetadata');
      vjs.off('play');
      vjs.off('pause');
      vjs.off('timeupdate');
    };
  }, [reorderedList, myStream, vjs, onTrackChange, files, dispatch]);

  useEffect(() => {
    if (myStream && (Array.isArray(myStream) ? myStream[0].src !== vjs.currentSrc() : myStream.src !== vjs.currentSrc())) {
      dispatch(setInRoom({loadingStream: true}));
      vjs.src(myStream);
      vjs.play()?.then(() => {
        dispatch(setInRoom({loadingStream: false}));
        onTrackChange();
      });
    }
  }, [vjs, myStream, onTrackChange, dispatch]);

  useEffect(() => {
    if (files && files[0].src !== vjs.currentSrc()) {
      vjs.src(files);
      vjs.play()?.then(() => {
        onTrackChange();
        setCopyList(files);
      });
    }
  }, [vjs, files, onTrackChange]);


  useEffect(() => {
  if (vol.userMuted) return;

  if (vol.muteWhenSpeak) {
    onSyncAudio?.(talking, vol.value, vjs);
    setVol(prev => ({...prev, muted: talking}));
  } else if (vol.lowerWhenSpeak) {
    const volume = talking ? 0.1 : vol.lastValue;
    onSyncAudio?.(false, volume, vjs);
    setVol(prev => ({
      ...prev, 
      lastValue: prev.value, 
      value: volume, 
      muted: false
    }));
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [talking, vol.muteWhenSpeak, vol.lowerWhenSpeak, onSyncAudio, vjs]);

  useEffect(() => {
    if (files) {
      setCopyList(files.map(f => ({...f})));
    }
  }, [files]);

  useEffect(() => {
    if (copyList) {
      setReorderedList(copyList.map(l => ({...l})));
      setPlayIndex(prevState => ({...prevState, forward: copyList.length - 1}));
    }
  }, [copyList]);

  const onPlayVideo = () => {
    if (isPlaying) {
      vjs.pause();
    } else {
      if (parseTrackDuration(vjs.duration()) === Math.round(vjs.currentTime())) {
        vjs.currentTime(0);
      }

      vjs.play();
    }

    setIsPlaying(!isPlaying);
  };

  const onChangeTrack = (dir: 'back' | 'forward') => {
    const index = reorderedList.findIndex(r => r.id === playIndex.current);
    let track: FileStreamSource;
    if (dir === 'back') {
      track = reorderedList[index - 1];
    } else {
      const next = index + 1;
      track = reorderedList[next === reorderedList.length ? 0 : next];
    }
    vjs.src(track);
    vjs.play()?.then(() => onTrackChange());
    setPlayIndex(prevState => ({...prevState, current: track.id}));
  };

 
  const onMuteVideo = () => {
    const newMutedState = !vol.muted;
    vjs.muted(newMutedState);
    onSyncAudio?.(newMutedState, vol.value, vjs);
    setVol({...vol, muted: newMutedState, userMuted: newMutedState});
  };

  const onTrackClick = (track: FileStreamSource) => {
    vjs.src(track);
    vjs.play()?.then(() => onTrackChange());
    setPlayIndex(prevState => ({...prevState, current: track.id}));
  };

  const handleVolumeFocus = () => {
    setVol({...vol, muted: false});
    vjs.muted(false);
  };

  const handleVolumeChange = (value: number) => {
  if (!vol.muted) {
    onSyncAudio?.(false, value, vjs);
    if (vol.value !== value) {
      setVol({...vol, value});
    }
  }
};

  const handleReorder = ({detail}: CustomEvent<ItemReorderEventDetail>) => {
    detail.complete();
    setReorderedList(prevState => {
      prevState.splice(detail.to, 0, prevState.splice(detail.from, 1)[0]);
      setPlayIndex(prev => ({...prev, back: prevState[0].id, forward: prevState[prevState.length - 1].id}));
      return prevState;
    });
  };

  const handleTrackListClick = () => {
    setShowTrackList(prevState => !prevState);
  };

  const handleMuteWhenSpeak = () => {
    const data: ManageVol = {
      muteWhenSpeak: (!vol.muteWhenSpeak) ? 'true' : 'false',
      lowerWhenSpeak: 'false'

    };
    appStorage.setObject(MANAGE_VOLUME_WHEN_SPEAKING, data);
    setVol(prevState => ({...prevState, muteWhenSpeak: !prevState.muteWhenSpeak, lowerWhenSpeak: false}));
  };

  const handleLowerVolumeWhenSpeak = () => {
    const data: ManageVol = {
      lowerWhenSpeak: (!vol.lowerWhenSpeak) ? 'true' : 'false',
      muteWhenSpeak: 'false'

    };
    appStorage.setObject(MANAGE_VOLUME_WHEN_SPEAKING, data);
    setVol(prevState => ({...prevState, muteWhenSpeak: false, lowerWhenSpeak: !prevState.lowerWhenSpeak}));
  };

  return (
    <div className="player-control-bar">
      <div className="player-control-bar-inner">
        {
          copyList.length > 1 &&
          <IonReorderGroup
            disabled={false} hidden={!showTrackList}
            className="file-list"
            onIonItemReorder={handleReorder}
          >
            {
              copyList.map((l) => (
                <IonItem button key={l.id} onClick={() => onTrackClick(l)} lines="none">
                  <IonIcon icon={playOutline} slot="start" color={playIndex.current === l.id ? 'success' : ''}/>
                  <IonLabel color={playIndex.current === l.id ? 'success' : 'medium'}>{l.fileName}</IonLabel>
                  <IonReorder slot="end"/>
                </IonItem>
              ))
            }
          </IonReorderGroup>
        }

        <IonButtons className="controllers">
          {
            copyList.length > 1 &&
            <>
              <IonButton onClick={handleTrackListClick}>
                <IonIcon slot="icon-only" icon={albumsOutline} color={showTrackList ? 'success' : ''}/>
              </IonButton>
              <IonButton
                className="play-back-btn"
                onClick={() => onChangeTrack('back')}
                disabled={playIndex.current === playIndex.back}
              >
                <IonIcon slot="icon-only" icon={playBackOutline}/>
              </IonButton>
            </>
          }

          <IonButton onClick={onPlayVideo}>
            <IonIcon slot="icon-only" icon={isPlaying ? pauseOutline : playOutline}/>
          </IonButton>

          {
            copyList.length > 1 &&
            <IonButton
              className="play-forward-btn"
              onClick={() => onChangeTrack('forward')}
              disabled={playIndex.current === playIndex.forward && !loop}
            >
              <IonIcon slot="icon-only" icon={playForwardOutline}/>
            </IonButton>
          }

          <IonButton className="mute-btn" onClick={onMuteVideo}>
            <IonIcon slot="icon-only" icon={vol.muted ? volumeMuteOutline : volumeMediumOutline}/>
          </IonButton>

          <IonItem className="video-volume" lines="none">
            <IonRange
              max={1}
              step={0.1}
              value={vol.muted ? 0 : vol.value}
              onIonFocus={handleVolumeFocus}
              onIonChange={(e) => handleVolumeChange(+e.detail.value)}
              color="dark"
            />
          </IonItem>
          {
            showSeekSlider &&
            <IonItem className="video-seek" lines="none">
              <IonText slot="start">{currentTime.display} / {duration.display}</IonText>

              <IonRange
                className="track-seek"
                max={duration.seconds}
                value={currentTime.seconds}
                onMouseDown={() => setSeek(true)}
                onMouseUp={() => setTimeout(() => setSeek(false), 100)}
                onIonChange={(e) => {
                  if (seek) {
                    vjs.currentTime(+e.detail.value);
                  }
                }}
                color="dark"
              />
            </IonItem>
          }

          <IonButton onClick={handleMuteWhenSpeak} title={t('controlBar.muteVideoWhenSpeaking')}>
            <IonIcon icon={volumeOffOutline} slot="icon-only" color={vol.muteWhenSpeak ? 'success' : ''}/>
          </IonButton>

          <IonButton onClick={handleLowerVolumeWhenSpeak} title={t('controlBar.lowerVolumeWhenSpeaking')}>
            <IonIcon icon={volumeLowOutline} slot="icon-only" color={vol.lowerWhenSpeak ? 'success' : ''}/>
          </IonButton>
        </IonButtons>
      </div>
    </div>
  );
};

export default PlayerControlBar;
