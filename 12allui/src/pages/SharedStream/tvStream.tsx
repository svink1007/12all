import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {RouteComponentProps, useParams} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import {HTMLVideoStreamElement} from '../WatchParty/types';
import VertoSession from '../../verto/VertoSession';
import {Participant} from '../../verto/models';
import FullscreenListeners from '../WatchParty/LivingRoom/FullscreenListeners';
import ProgressLoader from '../../components/ProgressLoader';
import NoVideoCanvas from '../../components/NoVideoCanvas';
import {SharedStream, Vlr} from '../../shared/types';
import {IonContent, IonPage, isPlatform, useIonViewWillEnter, useIonViewWillLeave} from '@ionic/react';
import EstablishVertoSession from './EstablishVertoSession';
import PlayerBarStream from './PlayerBarStream';
import initTvStream from './initTvStream';
import startTvStreamVlr from './startTvStreamVlr';
import exitStreamVlr from './exitStreamVlr';
import {setErrorToast, setInfoToast} from '../../redux/actions/toastActions';
import {useTranslation} from 'react-i18next';
import {VlrService} from '../../services';
import {StreamService} from '../../services/StreamService';
import {streamLoadingStart} from '../../redux/actions/streamLoadingActions';
import {API_URL, MAIN_CONTENT_ID} from '../../shared/constants';
import {ChangeStreamParams} from './index';

export type StreamVlr = {
  moderator: {
    username: string;
    password: string;
  };
  updateMetadata: boolean;
  roomId: string;
  publicId: string;
  fsUrl: string;
  vlrId: number;
  upSpeedUrl: string | null;
};

export type UpdateStreamVlr = {
  username: string;
  password: string;
  updateMetadata: boolean;
};

const SharedStreamTvPage: FC<RouteComponentProps> = () => {
  const {t} = useTranslation();
  const {id, roomId} = useParams<{ id: string | 'camera', roomId?: string }>();
  const dispatch = useDispatch();
  const profile = useSelector(({profile}: ReduxSelectors) => profile);
  const jwt: any = null;
  const {astraUrl} = useSelector(({webConfig}: ReduxSelectors) => webConfig);

  const pageRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLVideoStreamElement>(null);
  const vertoSession = useRef<VertoSession | null>(null);
  const timeLoading = useRef<NodeJS.Timeout | null>(null);
  const butref = useRef<HTMLInputElement | null>(null);
  const streamVlr = useRef<StreamVlr>({
    roomId: '',
    publicId: '',
    fsUrl: '',
    updateMetadata: true,
    moderator: {username: '', password: ''},
    vlrId: 0,
    upSpeedUrl: ''
  });
  const userMediaAudioRef = useRef<MediaStream>();
  const userMediaVideoRef = useRef<MediaStream | null>(null);
  const noVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const sharedStreamData = useRef<SharedStream>();
  const caller = useRef<string>(profile.nickname || `User_${new Date().getMilliseconds()}`);
  const isStreamingCamera = useRef<boolean>(false);
  const [isRoomPrivate, setIsRoomPrivate] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [showProgressbar, setShowProgressbar] = useState<boolean>(false);
  const [showLoadingCancel, setShowLoadingCancel] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [imHost, setImHost] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [micMuted] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [volume, setVolume] = useState<number>(1);
  const [streamName, setStreamName] = useState<string>('');
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  // const [openSelectFsResolution, setOpenSelectFsResolution] = useState<boolean>(false);
  // const [fsResolution, setFsResolution] = useState<number>();

  const handleNoVideoTrack = useCallback((track: MediaStreamTrack) => {
    noVideoTrackRef.current = track;
  }, []);

  const startNewRoom = useCallback(() => {
    // setOpenSelectFsResolution(true);
    startTvStreamVlr({
      timeLoading,
      sharedStreamData,
      streamVlr,
      setShowLoadingCancel,
      setProgress,
      setImHost
    });
  }, []);

  const joinRoom = useCallback((vlr: Vlr) => {
    timeLoading.current = setTimeout(() => setShowLoadingCancel(true), 10000);

    setShowProgressbar(true);

    handleFullscreenChange();

    streamVlr.current = {
      roomId: vlr.room_id,
      publicId: vlr.public_id,
      fsUrl: vlr.fs_url || '',
      updateMetadata: false,
      moderator: {
        username: '',
        password: ''
      },
      vlrId: vlr.id,
      upSpeedUrl: vlr.up_speed_url
    };

    setProgress(0.2);
    setImHost(false);
  }, []);

  const handleRoomExit = useCallback(() => {
    exitStreamVlr({
      imHost,
      isStreamingCamera: isStreamingCamera.current,
      vertoSession,
      streamVlr,
      participants,
      userId: profile.id
    });
  }, [participants, imHost, profile.id]);

  const updateStreamParams = useCallback(({streamName, streamUrl}: ChangeStreamParams) => {
    setStreamName(streamName);
    setStreamUrl(streamUrl);
  }, []);

  useIonViewWillEnter(() => {
    if (id === 'camera' && !roomId) {
      dispatch(setErrorToast('sharedStream.noStreamRoomId'));
      return;
    }

    initTvStream({
      id,
      roomId,
      jwt,
      setIsFullscreen,
      setLoading,
      setShowProgressbar,
      setProgress,
      sharedStreamData,
      onStartNewRoom: startNewRoom,
      onJoinRoom: joinRoom,
      onExitRoom: (errorMessage?: string) => {
        if (errorMessage) {
          dispatch(setErrorToast(errorMessage));
        } else {
          dispatch(setInfoToast(isPlatform('ios') ? 'notifications.iosNoStreamSupport' : 'notifications.roomNotActiveLogin'));
        }
      }
    });
  }, []);

  useIonViewWillLeave(() => {
    userMediaAudioRef.current?.getAudioTracks().forEach(track => track.stop());
    userMediaVideoRef.current?.getVideoTracks().forEach(track => track.stop());
    timeLoading.current && clearTimeout(timeLoading.current);
  }, []);

  useEffect(() => {
    const onBeforeUnloadListener = () => {
      handleRoomExit();
    };

    window.addEventListener('beforeunload', onBeforeUnloadListener);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnloadListener);
    };
  }, [handleRoomExit]);

  useEffect(() => {
    if (sharedStreamData.current) {
      setStreamName(sharedStreamData.current.name);
      setStreamUrl(sharedStreamData.current.url);
      setIsRoomPrivate(sharedStreamData.current?.is_adult_content || false);
    }

    if (imHost && streamVlr.current.updateMetadata && sharedStreamData.current) {
      const updateMetaData = {
        phoneNumber: '918826658880',
        token: '9l7SawQy6fqUkVGzcwvVAwftsdQ18cu3',
        roomId: streamVlr.current.publicId,
        streamCamera: false,
        streamId: sharedStreamData.current.id,
        streamUrl: sharedStreamData.current.url,
        isPrivate: sharedStreamData.current.is_adult_content || false,
        channelLogo: sharedStreamData.current.logo_image?.url ? `${API_URL}${sharedStreamData.current.logo_image.url}` : sharedStreamData.current.logo,
        channelName: `${sharedStreamData.current.name} ${t('sharedStream.by')} ${caller.current}`,
        channelGenre: sharedStreamData.current.genre,
        channelDescription: '',
        channelLanguage: sharedStreamData.current.language
      };

      console.log(updateMetaData);

      VlrService.updateMetaDataTv(updateMetaData);

      // axios.post('https://wp.12all.tv:1357/vlr/update-meta-data', updateMetaData).then();
      // VlrService.updateMetadata(updateMetaData).then();
    }
  }, [imHost, t]);

  const handleFullscreenChange = () => {
    setIsFullscreen(prevState => {
      if (prevState) {
        document.exitFullscreen().then();
      } else {
        pageRef.current?.requestFullscreen().then();
      }
      return !prevState;
    });
  };

  useEffect(() => {
    if (progress === 1) {

      pageRef.current?.requestFullscreen().catch((err) => {
        console.log('fullscreen err:', err?.message || err);
      });
    }

  }, [progress]);

  const handlePlayerVolumeChange = (value: number) => {
    setVolume(value);
    if (roomRef.current) {
      roomRef.current.volume = value;
    }
  };

  const handleDismissLoading = useCallback(() => {
    setProgress(0.9);

    if (roomRef.current) {
      roomRef.current.muted = false;
      setLoading(false);
      setShowProgressbar(false);
      setProgress(1);
    }

    timeLoading.current && clearTimeout(timeLoading.current);
  }, []);

  const handleProgressChange = useCallback((value: number) => {
    setProgress(value);
  }, []);

  const handleParticipantsChange = useCallback((participants: Participant[]) => {
    setParticipants(participants);
  }, []);

  const handleCanLeaveChange = useCallback(() => {
  }, []);

  const handleUpdateStreamVlr = useCallback(({username, password, updateMetadata}: UpdateStreamVlr) => {
    streamVlr.current.moderator.username = username;
    streamVlr.current.moderator.password = password;
    streamVlr.current.updateMetadata = updateMetadata;
  }, []);

  const handleUserMediaChange = useCallback((stream: MediaStream) => {
    userMediaAudioRef.current = stream;
    userMediaVideoRef.current = stream;
  }, []);

  const handleImHostChange = useCallback((value: boolean) => {
    setImHost(value);
  }, []);

  const handleStreamCameraChange = useCallback(() => {
    isStreamingCamera.current = true;
  }, []);

  const handleVertoSessionChange = useCallback((session: VertoSession) => {
    vertoSession.current = session;

    vertoSession.current?.notification.onChatMessageStreamChange.subscribe((params) => {
      if (sharedStreamData.current) {
        sharedStreamData.current.url = params.streamUrl;
        sharedStreamData.current.name = params.streamName;
        sharedStreamData.current.is_adult_content = params.isAdult;
      }

      updateStreamParams(params);
    });
  }, [updateStreamParams]);

  const handleStreamIsPlaying = useCallback(() => {
    if (sharedStreamData.current) {
      StreamService.updatePlayedSuccessfully(sharedStreamData.current.id, true).then();
    }
  }, []);

  const handleStreamPlayFail = () => {
    if (sharedStreamData.current) {
      StreamService.updatePlayedSuccessfully(sharedStreamData.current.id, false).then();
    }
  };

  // const handlePlayerStreamChange = useCallback((stream: MediaStream) => {
  //   setPlayerStream(stream);
  // }, []);


  const handleStreamChange = ({id, name, url, logo, is_adult_content, epg_channel}: SharedStream | any) => {
    if (streamName === name && streamUrl === url) {
      return;
    }

    const regex = new RegExp(astraUrl);

    if (!astraUrl || regex.test(url)) {
      StreamService.requestAstraStreamOpening(url).then();
    }

    VlrService.patchMetadata({
      channelName: `${name} ${t('sharedStream.by')} ${caller.current}`,
      streamId: id,
      publicId: streamVlr.current.publicId,
      logo,
      isPrivate: is_adult_content ? true : isRoomPrivate
    }).then();

    const params: ChangeStreamParams = {
      streamName: name,
      streamUrl: url,
      isAdult: is_adult_content || false,
      epgId: epg_channel?.id
    };

    vertoSession.current?.sendMessage.streamChange(params);
    updateStreamParams(params);
    dispatch(streamLoadingStart());
  };

  const handleCanLeave = () => {
  };

  return (
    <IonPage id={MAIN_CONTENT_ID}>
      <IonContent className={'layout-conten'}>
        {/*<FsRoomResolution*/}
        {/*  show={openSelectFsResolution}*/}
        {/*  onSelect={handleStartNewRoom}*/}
        {/*/>*/}
        {
          imHost !== null &&
          <EstablishVertoSession
            userId={profile.id}
            isRoomPrivate={isRoomPrivate}
            volume={volume}
            micMuted={micMuted}
            imHost={imHost}
            caller={caller.current}
            roomRef={roomRef}
            timeLoading={timeLoading.current}
            streamVlr={streamVlr.current}
            streamName={streamName}
            streamUrl={streamUrl}
            noVideoTrack={noVideoTrackRef.current}
            onUserMedia={handleUserMediaChange}
            onVertoSession={handleVertoSessionChange}
            onDismissLoading={handleDismissLoading}
            onProgress={handleProgressChange}
            onParticipants={handleParticipantsChange}
            onCanLeave={handleCanLeaveChange}
            onStreamCamera={handleStreamCameraChange}
            onUpdateStreamVlr={handleUpdateStreamVlr}
            onImHost={handleImHostChange}
            onStreamIsPlaying={handleStreamIsPlaying}
            onStreamPlayFail={handleStreamPlayFail}
            // fsResolution={fsResolution}
          />
        }
        {/* let input = document.getElementById('changeStreamInput');input.value = "{id:137, name:Abu Dhabi Sports 2, url:https://admdn5.cdn.mangomolo.com/adsports2/smil:adsports2.stream.smil/playlist.m3u8, logo:null, is_adult_content:null}";input.click(); */}
        <input id="changeStreamInput" style={{display: 'none'}} onClick={() => {
          console.log('fddfdsff', butref.current?.value);
          handleStreamChange(butref.current?.value);
        }} ref={butref}/>
        {/* <button id="changeStreamButton" style={{display:"none"}} onClick={()=>{console.log("fddfdsff",inputdata)}}>sadsadad</button> */}
        <main ref={pageRef} className={'shared-stream-page'}>
          <ProgressLoader
            progress={progress}
            show={showProgressbar}
            showLeave={showLoadingCancel}
            onLeave={handleCanLeave}
          />

          {/* <ProgressLoaderInvite
          progress={progress}
          show={showInviteProgressbar}
          showLeave={showLoadingCancel}
          invitationUrl={invitationUrl}
          onLeave={handleCanLeave}
        /> */}

          {/* <section className="shared-stream-chat-section">
          {
            vertoSession.current && (
              <Chat
                vlrId={streamVlr.current.vlrId}
                session={vertoSession.current}
                participants={participants}
                show={showChat}
              />
            )
          }
        </section> */}

          <section className="shared-stream-room-section-tv" style={{width: '100%', height: '100%'}}>
            <div
              className="stream-content-holder"
              style={{
                visibility: !!roomRef.current?.srcObject && !loading ? 'visible' : 'hidden',
                width: '100%',
                height: '100%'
              }}
            >
              {/* <TopBarStream
              streamName={streamName}
              roomId={streamVlr.current?.publicId}
              epgEntries={streamEpg}
              participants={participants}
              onExit={handleRoomExit}
            /> */}
              <div className={`stream-holder ${roomRef.current?.srcObject === null ? 'left' : ''}`}
                   style={{display: 'block', width: '100%', height: '100%'}}>
                <div className="stream-room-container" style={{width: '100%', height: '100%'}}>
                  <video
                    ref={roomRef}
                    muted
                    autoPlay
                    className={isFullscreen?"stream-room-video stream-room-video-fullscreen":"stream-room-video"} 
                    playsInline
                    style={{width: '100%', height: '100%'}}
                  />
                </div>

                <NoVideoCanvas onVideoTrack={handleNoVideoTrack}/>

                {/* <SideBarStream
                streamId={sharedStreamData.current?.id}
                showStreamInfo={showStreamInfo}
                isAdult={streamIsAdult}
                isPrivate={isRoomPrivate}
                publicId={streamVlr.current.publicId}
                imHost={imHost}
                show={!!roomRef.current?.srcObject && !loading}
                micMuted={micMuted}
                camStopped={camStopped}
                fullscreen={true}
                showChat={showChat}
                invitationUrl={invitationUrl}
                onToggleMic={handleToggleMic}
                onToggleCam={handleToggleCam}
                onFullscreen={handleFullscreenChange}
                onShowChat={setShowChat}
                onLayoutChange={handleChangeRoomLayout}
                onChangeStream={handleStreamChange}
                onChangeRoomStatus={setIsRoomPrivate}
                onShowStreamInfo={setShowStreamInfo}
              /> */}

                <PlayerBarStream
                  volume={volume}
                  onVolumeChange={handlePlayerVolumeChange}
                />
              </div>
            </div>

            <FullscreenListeners isInFullscreen={isFullscreen}/>
          </section>

          {/* <section className="shared-stream-side-features">
          {showStreamInfo && <StreamDebugInfo/>}
        </section> */}
        </main>

        {/* <SelectRoomModal
        open={openSelectRoomModal}
        vlrs={vlrs}
        onStartNewRoom={handleOnStartNewRoomModal}
        onJoinRoom={joinRoom}
        onCancel={handleOnCancelModal}
      />

      <RouterLeaveGuard
        canLeave={canLeave}
        defaultDestination={Routes.Home}
        redirectTo={redirectHome ? Routes.Home : null}
        onCanLeave={handleCanLeave}
      /> */}
      </IonContent>
    </IonPage>
  );
};

export default SharedStreamTvPage;
