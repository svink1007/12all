import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {RouteComponentProps} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../redux/shared/types';
import {HTMLVideoStreamElement} from '../../WatchParty/types';
import VertoSession from '../../../verto/VertoSession';
import {Participant} from '../../../verto/models';
import ReactPlayer from 'react-player';
import Layout from '../../../components/Layout';
import {Routes} from '../../../shared/routes';
import TopBarRoomTest from './TopBarRoomTest';
import ProgressLoader from '../../../components/ProgressLoader';
import {useIonViewWillEnter, useIonViewWillLeave} from '@ionic/react';
import RouterLeaveGuard from '../../../components/RouterLeaveGuard';
import establishVertoSession from './establishVertoSession';
import {setErrorToast} from '../../../redux/actions/toastActions';
import FullscreenListeners from '../../WatchParty/LivingRoom/FullscreenListeners';

const RoomTestPage: FC<RouteComponentProps> = ({history}) => {
  const dispatch = useDispatch();
  const {cam} = useSelector(({userMedia}: ReduxSelectors) => userMedia);
  const roomTest = useSelector(({roomTest}: ReduxSelectors) => roomTest);

  const pageRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLVideoStreamElement>(null);
  const vertoSession = useRef<VertoSession | null>(null);
  const videoPlayer = useRef<any>();
  const videoStreamRef = useRef<MediaStream>();
  const userStreamRef = useRef<MediaStream | null>(null);
  const numberOfAdditionalParticipantsRef = useRef<number>(roomTest.numberOfParticipants);

  const [loading, setLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showProgressbar, setShowProgressbar] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [canLeave, setCanLeave] = useState<boolean>(false);
  const [numberOfAdditionalParticipants, setNumberOfAdditionalParticipants] = useState<number>(0);

  const establishSession = useCallback((stream?: MediaStream) => {
    establishVertoSession({
      stream,
      roomTest,
      dispatch,
      vertoSession,
      roomRef,
      setCanLeave,
      setLoading,
      setShowProgressbar,
      setProgress,
      setParticipants,
      cam,
      userStreamRef,
      numberOfAdditionalParticipantsRef
    });
  }, [dispatch, roomTest, cam]);

  const handlePlayerStreamReady = useCallback((player: ReactPlayer) => {
    setProgress(0.3);

    videoPlayer.current = player.getInternalPlayer();

    const tracksInterval = setInterval(() => {
      if (videoPlayer.current.captureStream) {
        videoStreamRef.current = videoPlayer.current.captureStream();
      } else if (videoPlayer.current.mozCaptureStream) {
        videoStreamRef.current = videoPlayer.current.mozCaptureStream();
      } else {
        throw new Error('Capture stream is not supported');
      }

      if (videoStreamRef.current?.getTracks().length) {
        clearInterval(tracksInterval);

        const audioContext = new AudioContext();
        const videoAudioSource = audioContext.createMediaElementSource(videoPlayer.current);
        const videoAudioDestination = audioContext.createMediaStreamDestination();
        videoAudioSource.connect(videoAudioDestination);

        const audioTrack = videoAudioDestination.stream.getAudioTracks()[0];
        const videoTrack = videoStreamRef.current.getVideoTracks()[0];
        const sessionStream = new MediaStream([audioTrack, videoTrack]);

        establishSession(sessionStream);
      }
    }, 100);
  }, [establishSession]);

  const handlePlayerStreamError = (err: any) => {
    if (!videoPlayer.current) {
      dispatch(setErrorToast('sharedStream.temporaryUnavailable'));
      setCanLeave(true);
    } else if (err.message) {
      console.error(err.message);
    } else {
      console.error(err);
    }
  };

  const handleRoomExit = useCallback(() => {
    vertoSession.current?.hangup();
  }, []);

  useIonViewWillEnter(() => {
    if (!roomTest.roomId) {
      setCanLeave(true);
    } else {
      setLoading(true);
      setShowProgressbar(true);
      setProgress(0.1);
    }
  }, []);

  useIonViewWillLeave(() => {
    if (vertoSession.current) {
      vertoSession.current.disconnectWebSocket();
      vertoSession.current.notification.removeAllSubscribers();
    }
  }, []);

  useEffect(() => {
    if (!roomTest.streamUrl) {
      establishSession();
    }
  }, [roomTest.streamUrl, establishSession])

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
    if (numberOfAdditionalParticipants > 0 && vertoSession.current && userStreamRef.current) {
      const currentNumber = numberOfAdditionalParticipantsRef.current;
      numberOfAdditionalParticipantsRef.current = numberOfAdditionalParticipantsRef.current + numberOfAdditionalParticipants - 1;
      vertoSession.current.addConnection(userStreamRef.current, `User_${currentNumber + 1}`);
      setNumberOfAdditionalParticipants(0);
    }
  }, [numberOfAdditionalParticipants]);

  const handleFullscreenChange = () => {
    setIsFullscreen(prevState => {
      if (prevState) {
        document.exitFullscreen().then();
      } else {
        pageRef.current?.requestFullscreen();
      }
      return !prevState;
    });
  };

  return (
    <Layout>
      <main ref={pageRef} className={`room-test-page ${isFullscreen ? 'fullscreen' : ''}`}>
        <ProgressLoader
          progress={progress}
          show={showProgressbar}
          showLeave
          onLeave={() => history.replace(Routes.RoomHome)}
        />

        <div
          className="content-holder"
          style={{visibility: !!roomRef.current?.srcObject && !loading ? 'visible' : 'hidden'}}
        >
          {
            vertoSession.current &&
            <TopBarRoomTest
              vertoSession={vertoSession.current}
              streamName={roomTest.streamName}
              roomId={roomTest.publicId}
              fullscreen={isFullscreen}
              participants={participants}
              onAddAdditionalParticipants={setNumberOfAdditionalParticipants}
              onExit={handleRoomExit}
              onFullscreen={handleFullscreenChange}
            />
          }
          <div className="stream-holder">
            <div className="stream-room-container">
              <video
                ref={roomRef}
                className="stream-room-video"
              />
            </div>

            {
              roomTest.streamUrl &&
              <div hidden>
                <ReactPlayer
                  url={roomTest.streamUrl}
                  config={{
                    file: {
                      attributes: {
                        crossOrigin: 'true'
                      }
                    }
                  }}
                  onReady={handlePlayerStreamReady}
                  onError={handlePlayerStreamError}
                  playing
                  muted={loading}
                />
              </div>
            }
          </div>
        </div>
        <FullscreenListeners isInFullscreen={isFullscreen}/>
      </main>

      <RouterLeaveGuard
        canLeave={canLeave}
        defaultDestination={Routes.RoomHome}
        onCanLeave={() => setCanLeave(true)}
      />
    </Layout>
  );
}

export default RoomTestPage;
