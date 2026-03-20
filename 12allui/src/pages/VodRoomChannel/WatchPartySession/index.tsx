import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import VertoSession from '../../../verto/VertoSession';
import ReactPlayer from 'react-player';
import {LivingRoomMode, ShareStreamOption} from '../../VodRoomX/enums';
import {INIT_GAIN_VOL, INIT_VOL} from '../../../shared/constants';
import getMicParams from '../../../shared/methods/getMicParams';
import {setErrorToast, setInfoToast} from '../../../redux/actions/toastActions';
import {Participant} from '../../../verto/models';
import {IonAlert, IonImg} from '@ionic/react';
import defaultLogo from '../../../../images/12all-logo-128.png';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../redux/shared/types';
import {ToastTextFormat} from '../../../redux/shared/enums';
import {HTMLVideoStreamElement} from '../../VodRoomX/types';
import {useTranslation} from 'react-i18next';
import {ToastBuffer} from '../../../models/ToastBuffer';
import getDisplayMedia from '../../../shared/methods/getDisplayMedia';
import {setInRoom} from '../../../redux/actions/inRoomActions';
import {VlrService} from '../../../services';
import {setRoomLayout} from '../../../redux/actions/roomLayoutActions';
import {Socket} from 'socket.io-client';
import {
  setStreamDebugReceivedStream,
  setStreamDebugVertoSession
} from '../../../redux/actions/streamDebugActions';
import RoomConnectionStatus from '../../../components/RoomConnectionStatus';
import {initRoomSocket} from '../../../shared/methods/initRoomSocket';
import {ADD_PARTICIPANT, REMOVE_PARTICIPANT} from '../../../hooks/useRoomsSocket';
import {SharedVodVlrs, vod} from "../../../shared/types";
import sharedStream from "../../SharedStream";

export const MEDIA_VIDEO_ID = 'vod-media-share-video';

const addParticipantBuffer = new ToastBuffer();
const removeParticipantBuffer = new ToastBuffer();

type Props = {
  id: string,
  noVideoTrack: React.MutableRefObject<MediaStreamTrack | undefined>;
  vod: React.MutableRefObject<SharedVodVlrs | undefined>;
  volume: number;
  vodChannel: vod[];
  setCurrentVod?: (currentVod: number ) => void;
  onMicMuted: (muted: boolean) => void;
  onCamStopped: (stopped: boolean) => void;
  onProgress: (value: number) => void;
  onShowProgressLeave: (value: boolean) => void;
  onPlayerReady: (player: HTMLVideoElement) => void;
  onShowLoading: (value: boolean) => void;
  onVertoSession: (vertoSession: VertoSession) => void;
  onParticipants: (participants: Participant[]) => void;
  onLeave: () => void;
  loop: boolean;
  streamIsReady: boolean;
  isPlaying: boolean;
  onUserStream: (userStream: MediaStream) => void;
  onGainNode: (gainNode: GainNode) => void;
  onScreenShareStream: (stream: MediaStream) => void;
  captureMediaStream: () => Promise<MediaStream>;
  onStopSharing: () => void;
  setLoop: (loop: boolean) => void;
  setVodStatus: (status: "Playing" | "Paused" | "Idle") => void;
  onMergeStreams: (
    userStream: MediaStream,
    capturedStream: any,
    shareScreen: boolean) => { primaryStream: MediaStream, secondaryStream: any};
};

const WatchPartySession: FC<Props> = ({
                                        onProgress,
                                        vod, id,
                                        loop, setVodStatus,
                                        onShowProgressLeave,
                                        onShowLoading,
                                        onVertoSession,
                                        onParticipants,
                                        onMicMuted,
                                        onCamStopped,
                                        vodChannel,
                                        setCurrentVod,
                                        onLeave,
                                        volume,
                                        onUserStream,
                                        onGainNode,
                                        isPlaying,
                                        noVideoTrack,
                                        onScreenShareStream,
                                        captureMediaStream,
                                        onMergeStreams,
                                        onPlayerReady,
                                        onStopSharing,
                                        streamIsReady,
                                      }: Props) => {
  const {t} = useTranslation();

  const dispatch = useDispatch();
  const {
    myStream,
    files,
    share,
    joinCamMic,
    mic,
    channel,
    nickname,
    moderatorUsername,
    moderatorPassword,
    fsUrl,
    isHost,
    roomId,
    joinRoomWithCoHost,
    roomResolution,
    vlrId,
    publicRoomId,
    mode
  } = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);

  const {
    streamMaxReconnectAttempts,
    streamReconnectInterval
  } = useSelector(({webConfig}: ReduxSelectors) => webConfig);
  const profile = useSelector(({profile}: ReduxSelectors) => profile);

  const videoRoomRef = useRef<HTMLVideoStreamElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const progressLeaveTimeoutRef = useRef<NodeJS.Timeout>();
  const joinCamMicRef = useRef<boolean>(joinCamMic);
  const shareRef = useRef<ShareStreamOption | null>(share);
  const vertoSessionRef = useRef<VertoSession>();
  const socket = useRef<Socket>();
  const enteredIntoView = useRef<boolean>(false);
  const currentVodIndex = useRef<number>(vodChannel.findIndex(vod=>vod.id===parseInt(id)));

  const [muteVideo, setMuteVideo] = useState<boolean>(true);
  const [alertState, setAlertState] = useState<{ show: boolean; mic: boolean }>({show: false, mic: false});



  useEffect(() => {
    joinCamMicRef.current = joinCamMic;
  }, [joinCamMic]);

  useEffect(() => {
    shareRef.current = share;
  }, [share]);

  useEffect(() => {
    socket.current?.emit('change-room-privacy', {isPrivate: mode === LivingRoomMode.Private});
  }, [mode]);

  useEffect(() => {
    return () => {
      progressLeaveTimeoutRef.current && clearTimeout(progressLeaveTimeoutRef.current);
      socket.current?.disconnect();
    };
  }, []);

  useEffect(() => {

    if (enteredIntoView.current) {
      return;
    }
    enteredIntoView.current = true;

    let left = false;
    let progress = 0;
    const setProgress = (value: number) => {
      progress = value;
      onProgress(value);
    };

    const handleLeave = () => {
      addParticipantBuffer.clearBuffer();
      removeParticipantBuffer.clearBuffer();
      left = true;
      onLeave();
    };

   

    progressLeaveTimeoutRef.current = setTimeout(() => onShowProgressLeave(true), 10000);

    let vs: VertoSession;

    // @@@
    const getStreamLog = (stream: MediaStream) =>{
          if (!stream) {
            return 'NoStream';
          }
          const logLine = `MediaStream ID: ${stream.id}, Active: ${stream.active}, Audio Tracks: [${stream.getAudioTracks().map(t => `ID: ${t.id}, Label: ${t.label}, Enabled: ${t.enabled}, Muted: ${t.muted}, ReadyState: ${t.readyState}`).join(" | ")}], Video Tracks: [${stream.getVideoTracks().map(t => `ID: ${t.id}, Label: ${t.label}, Enabled: ${t.enabled}, Muted: ${t.muted}, ReadyState: ${t.readyState}`).join(" | ")}]`;
          return logLine;
    }

    const getLocalStream = async () => {
      let realNumber = roomId, streamNumber = `${roomId}_stream`;

      if (roomResolution && shareRef.current === ShareStreamOption.Screen) {
        realNumber += `_${roomResolution}`;
        streamNumber += `_${roomResolution}`;
      }

      const establishSession = (
        localStream: MediaStream,
        isHostSharedVideo: boolean = false
      ) => {

        const vsParams = {
          realNumber,
          streamNumber,
          callerName: nickname,
          localStream,
          giveFloor: isHost,
          isHost,
          channelName: channel.name,
          moderatorUsername,
          moderatorPassword,
          fsUrl,
          isHostSharedVideo ,
          receivePrimaryCallStream: !isHostSharedVideo,
          userId: profile.id,
          connectionType:"watch_party_camera",
          incomingBandwidth:  isHostSharedVideo? 0: 1500,
          outgoingBandwidth: 500,
          // destinationNumber: shareRef.current === ShareStreamOption.Stream ? `${roomId}_720_with_stream` : `${roomId}_720`
          destinationNumber: `${roomId}_720`
          //destinationNumber: shareRef.current === ShareStreamOption.Stream ? `${roomId}_720` : `${roomId}_720`
        };

        vs = new VertoSession(vsParams);

        vertoSessionRef.current = vs;
        onVertoSession(vs);
        dispatch(setStreamDebugVertoSession(vs));

        const proceedRemoteStream = (stream: MediaStream) => {
          if (!videoRoomRef.current) {
            throw new Error('No video room ref');
          }

          if (!videoRoomRef.current.srcObject) {
            setMuteVideo(false);
            onShowLoading(false);
            setProgress(1);
            progressLeaveTimeoutRef.current && clearTimeout(progressLeaveTimeoutRef.current);

            if (!socket.current) {
              socket.current = initRoomSocket({
                userId: profile.id,
                callId: vs.primaryCallId as string,
                vlrId,
                nickname: nickname || "User",
                isHost,
                isVlr: true
              });
            }
          }

          dispatch(setStreamDebugReceivedStream(stream));

          const strLog = getStreamLog(stream);
          videoRoomRef.current.srcObject = stream;
        };

        vs.notification.onPrimaryCallRemoteStream.subscribe((stream: MediaStream) => {
          if (shareRef.current === ShareStreamOption.VoD || !joinCamMicRef.current) {
            proceedRemoteStream(stream);
          } 
        });

        vs.notification.onSecondaryCallRemoteStream.subscribe((stream: MediaStream) => {
          proceedRemoteStream(stream);
        });

        let participants: Participant[] = [];

        vs.notification.onBootstrappedParticipants.subscribe((bootParticipants: Participant[]) => {
          if (joinCamMic && progress < 0.7) {
            setProgress(0.7);
          }

          participants = bootParticipants.sort((a, b) => (b.me === a.me ? 0 : b.me ? 1 : -1));
          onParticipants(participants);

          const bootMe = participants.find(p => p.me);
          if (bootMe) {
            if (shareRef.current === ShareStreamOption.Camera) {
              !bootMe.audio.muted && vs.togglePrimaryMic();
              !bootMe.video.muted && vs.togglePrimaryCam();

              if (isHost) {
                if (joinRoomWithCoHost) {
                  const sharing = participants.find(p => p.isHostSharedVideo);
                  if (sharing) {
                    setTimeout(() => {
                      vs.giveParticipantFloor(sharing.participantId);
                    });
                  }
                  VlrService.getAllCoHosts(roomId).then(({data: {coHosts}}) => {
                    if (coHosts) {
                      const coHostsArray = coHosts.split(',');
                      participants.forEach(p => p.isCoHost = coHostsArray.indexOf(p.participantId) !== -1);
                    }
                  });
                } else {
                  vs.changeLayout();
                  // This one does not work. Probably some fs issue
                  // vs.giveParticipantFloor(me.participantId);
                }
              }
            } else if (!joinCamMic) {
              bootMe.audio.muted && vs.togglePrimaryMic();
              bootMe.video.muted && vs.togglePrimaryCam();
            } else if (isHost) {
              !bootMe.audio.muted && vs.toggleParticipantMic(bootMe.participantId);
              !bootMe.video.muted && vs.stopParticipantCam(bootMe.participantId);
            }
          }

          if (isHost && !joinRoomWithCoHost && !vs.previousPrimaryId) {
            participants
              .filter(p => !p.me && !p.isHostSharedVideo)
              .forEach(p => {
                vs.removeParticipant(p.participantId);
                vs.sendMessage.youHaveBeenRemoved(p.callId);
              });
          }

          if (vs.previousPrimaryId && (!isHost || shareRef.current === ShareStreamOption.Camera || !joinCamMicRef.current)) {
            vs.notification.onConnectedToRoom.notify(null);
          }
        });

        const audioContext = new AudioContext(), audioDestination = audioContext.createMediaStreamDestination();

        const handleStopMediaShare = () => {
          const mySharing = participants.find(p => p.me && p.isHostSharedVideo);
          if (mySharing) {
            onStopSharing();
          }
        };

        vs.notification.onAddedParticipant.subscribe((participant) => {
          if (participant.me && participant.isHostSharedVideo) {
            vs.changeLayout();
	          // @@@ if muted disable mic
            vs.replacePrimaryTracks(audioDestination.stream);
            vs.giveParticipantFloor(participant.participantId);
            participant.audio.muted && vs.toggleSecondaryMic();
            participant.video.muted && vs.toggleSecondaryCam();
            vs.notification.onConnectedToRoom.notify(null);
          } else if (!participant.me && participant.isHostSharedVideo) {
            handleStopMediaShare();
          } else {
            addParticipantBuffer.addMessage(participant.participantName);
            addParticipantBuffer.beginBuffer(message => {
              dispatch(setInfoToast(`${message} ${t('livingRoom.joined')}`, ToastTextFormat.Text));
            });
          }

          if (!participant.hasSocket && !participant.me) {
            socket.current?.emit(ADD_PARTICIPANT, {
              callId: participant.callId,
              nickname: participant.participantName
            });
          }

          participants.push(participant);
          onParticipants(participants);
        });

        const modifyParticipantId = vs.notification.onModifiedParticipant.subscribe((participant: Participant) => {
          const sameParticipant = participants.find((p: Participant) =>
            p.callId === participant.callId &&
            p.audio.muted === participant.audio.muted &&
            p.video.muted === participant.video.muted &&
            p.video.floor === participant.video.floor
          );

          if (!sameParticipant) {
            const participantInParticipants = participants.find(p => p.callId === participant.callId);
            if (participantInParticipants) {
              participantInParticipants.audio = participant.audio;
              participantInParticipants.video = participant.video;
            }

            onParticipants(participants);
          }

          if (participant.me && participant.isPrimaryCall) {
            onMicMuted(participant.audio.muted);
            onCamStopped(participant.video.muted);
          }

          // if (shareRef.current === ShareStreamOption.Camera && !participant.me && participant.video.floor && me && me.isHost) {
          //   vs.giveParticipantFloor(me.participantId);
          // }
        });

        const removeParticipationSubscriber = vs.notification.onRemovedParticipant.subscribe((participant: Participant) => {
          participants = participants.filter((p) => p.callId !== participant.callId);
          onParticipants(participants);

          if (!participant.me) {
            removeParticipantBuffer.addMessage(participant.participantName);
            removeParticipantBuffer.beginBuffer(message => {
              dispatch(setInfoToast(`${message} ${t('livingRoom.left')}`, ToastTextFormat.Text));
            });

            if (isHost) {
              const floorIsLooked = participants.find(p => p.video.floorLocked);

              if (!floorIsLooked) {
                const hostSharedVideo = participants.find(p => p.me && p.isHostSharedVideo);
                if (hostSharedVideo) {
                  vs.giveParticipantFloor(hostSharedVideo.participantId);
                } else {
                  const me = participants.find(p => p.me);
                  me && vs.giveParticipantFloor(me.participantId);
                }
              }
            }

            if (!participant.hasSocket) {
              socket.current?.emit(REMOVE_PARTICIPANT, {
                callId: participant.callId
              });
            }
          }
        });

        vs.notification.onMakeCoHost.subscribe(({token, callIds}) => {
          socket.current?.emit('add-co-host', {callId: vs.primaryCallId});
          vs.setModeratorChannel(token);
          dispatch(setInfoToast('livingRoom.youAreCoHost'));
          dispatch(setInRoom({isCoHost: true}));
          participants.forEach(p => p.isCoHost = callIds.indexOf(p.callId) !== -1);
          onParticipants(participants);
        });

        vs.notification.onRemoveCoHost.subscribe(({me, coHostCallIds}) => {
          if (me) {
            socket.current?.emit('remove-co-host', {callId: vs.primaryCallId});
            vs.removeModeratorChannel();
            dispatch(setInfoToast('livingRoom.youAreNotCoHost'));
            dispatch(setInRoom({isCoHost: false}));
          }

          participants.forEach(p => p.isCoHost = coHostCallIds.indexOf(p.callId) !== -1);
          onParticipants(participants);
        });

        vs.notification.onYouHaveBeenRemoved.subscribe(() => {
          dispatch(setInfoToast('livingRoom.youHaveBeenRemoved'));
          vs.hangup();
        });

        vs.notification.onYoursSharingHaveBeenRemoved.subscribe(() => {
          dispatch(setInfoToast('livingRoom.youHaveBeenRemoved'));
          vs.hangup();
        });

        vs.notification.onYouHaveBeenBlocked.subscribe(() => {
          dispatch(setInfoToast('livingRoom.youHaveBeenBlocked'));
          vs.hangup();
        });

        vs.notification.onAskToUnmuteMic.subscribe(() => {
          setAlertState({show: true, mic: true});
        });

        vs.notification.onAskToStartCam.subscribe(() => {
          setAlertState({show: true, mic: false});
        });

        vs.notification.onLayoutChange.subscribe((layout) => dispatch(setRoomLayout(layout)));

        vs.notification.onFSLoggedError.subscribe(() => {
          dispatch(setErrorToast('fs.cannotAuthenticate'));
          handleLeave();
        });

        vs.notification.onStopMediaShare.subscribe(() => {
          handleStopMediaShare();
        });

        const hostLeftSubscriber = vs.notification.onRoomClosed.subscribe(() => {
          vs.notification.onModifiedParticipant.unsubscribe(modifyParticipantId);
          vs.notification.onRemovedParticipant.unsubscribe(removeParticipationSubscriber);
          dispatch(setInfoToast('livingRoom.roomClosed'));
          vs.hangup();
        });

        vs.notification.onStartingHangup.subscribe(() => {
          vs.notification.onModifiedParticipant.unsubscribe(modifyParticipantId);
          vs.notification.onRemovedParticipant.unsubscribe(removeParticipationSubscriber);
          vs.notification.onRoomClosed.unsubscribe(hostLeftSubscriber);
          const me = participants.find(p => p.me && p.isHost);
          if (me) {
            const host = participants.find(p => !p.me && (p.isHost || p.isCoHost || p.isHostSharedVideo));
            if (host) {
              VlrService.changeHost({participantId: host.participantId, roomId});
              socket.current?.emit('change-host', {callId: host.callId});
              vs.sendMessage.youAreHost(host.callId, host.participantName);
            } else {
              VlrService.removeAllHosts(roomId, profile.id, publicRoomId);
              socket.current?.emit('close-room');
              vs.sendMessage.hostLeft();
            }
          }
        });

        vs.notification.onPrimaryCallDestroy.subscribe(() => {
          handleLeave();
        });

        vs.notification.onYouAreHost.subscribe(() => {
          const hostSharedVideo = participants.find(p => p.me && p.isHostSharedVideo);
          if (hostSharedVideo) {
            vs.giveParticipantFloor(hostSharedVideo.participantId);
          } else {
            const me = participants.find(p => p.me);
            me && vs.giveParticipantFloor(me.participantId);
          }
          dispatch(setInfoToast(t('livingRoom.youAreHost')));
        });

        vs.notification.onHostChange.subscribe((hostName) => {
          dispatch(setInfoToast(`${t('livingRoom.roomHostChange')} ${hostName}`, ToastTextFormat.Text));
        });
      };

      

      let userStream: MediaStream, broadcastMediaStream: MediaStream;

      setProgress(0.1);

      if (joinCamMic) {

        const audio = getMicParams(mic);

        try {
          userStream = await navigator.mediaDevices.getUserMedia({audio: !!audio, video: false});

          if (noVideoTrack.current) {
            userStream = new MediaStream([
              userStream.getAudioTracks()[0],
              noVideoTrack.current
            ]);
          }

          onUserStream(userStream);
        }
        catch (e) {
          dispatch(setErrorToast('livingRoom.camError'));
          handleLeave();
          return null;
        }

        setProgress(0.3);

        const sharedOption = (shareRef.current !== ShareStreamOption.VoD);
        establishSession(userStream, sharedOption)

        
      }
    };

    getLocalStream().catch((err) => {
      console.error(err);
      dispatch(setErrorToast('common.unexpectedError'));
      handleLeave();
    });
  }, [
    id,
    t,
    dispatch,
    captureMediaStream,
    channel.name,
    files,
    fsUrl,
    isHost,
    joinCamMic,
    joinRoomWithCoHost,
    mic,
    moderatorPassword,
    moderatorUsername,
    myStream,
    nickname,
    noVideoTrack,
    onCamStopped,
    onGainNode,
    onLeave,
    onMergeStreams,
    onMicMuted,
    onParticipants,
    onProgress,
    onScreenShareStream,
    onShowLoading,
    onShowProgressLeave,
    onStopSharing,
    onUserStream,
    onVertoSession,
    profile.id,
    roomId,
    roomResolution,
    share,
    streamMaxReconnectAttempts,
    streamReconnectInterval,
    vlrId,
    publicRoomId
  ]);

  const getVodName = (vodUrl: string): string => {
    if(vodUrl.trim().length<3){
        dispatch(setErrorToast('The VoD url is not correct'));
        return '';
    }
    const url = new URL(vodUrl);
    if(vodUrl.includes('records/')){
      return 'records/'+url.pathname.split('/').pop() || ""
    }else{
      return url.pathname.split('/').pop() || ""
    }
  }
  
  useEffect(() => {
    if(vertoSessionRef.current){
      vertoSessionRef.current.notification.onWebSocketMessage.subscribe((message: any) => {
        if(message.method == "verto.event"){
          let data = message.params?.eventData?.message;
          if(data){
            let fixed = data.replace(/"([^"]+)"="?([^"]+)"?/g, '"$1":"$2"');
            

            let json;
            try {
              json = JSON.parse(fixed);
              //console.log("vod json: ",currentVodIndex.current, json.playing)

              // console.log("[LOOP]", json['playing']['Loop'])
              // if(json['playing']['Loop'] !== "NO"){
              //   setLoop(false)
              // }
              // if(json['playing']['Loop'] !== "YES"){
              //   setLoop(true)
              // }
              if(json['playing']['Status'] === "Idle" && vod.current?.url != null ){
                //console.log("vod is idle, playing next vod: ", currentVodIndex.current + 1);       
                if (vodChannel && vodChannel.length > 1) {// we check if vodChannel has more than one vod because the first vod is always playing
                  let nextVodIndex = currentVodIndex.current + 1;
                  if(vodChannel[nextVodIndex].id===1){//it's the add and it's no yet supported so we have to skip
                    nextVodIndex= currentVodIndex.current + 2;
                  }
                  if(nextVodIndex < vodChannel.length ){
                    vod.current={...vod.current, url: vodChannel[nextVodIndex]?.url};
                    playVodChannel(vodChannel[nextVodIndex].url);
                    setCurrentVod && setCurrentVod(vodChannel[nextVodIndex].id);
                    currentVodIndex.current = nextVodIndex;
                  }else if(loop){
                    playVodChannel(vodChannel[0].url);
                    setCurrentVod && setCurrentVod(vodChannel[0].id);
                    currentVodIndex.current = 0;
                  }/* else{
                    console.log("No more vods to play, stopping the vod player");
                    vertoSessionRef.current?.sendDebugAction("a_play_stop",``,"conf-control");
                  } */
                  return;
                }
              }


              if(json['playing']['Duration'] !== null){
                const [numerator, denominator] = json['playing']['Duration'].split("/").map(Number);
                // const duration = numerator / denominator;
                // setCurrentTime(numerator/100000)
                // setDuration(denominator/100000)
              }
              setVodStatus(json['playing']['Status'])
              // if(json['playing']['Status'] === 'Playing') {
              //   setIsPlaying(true)
              // }
              // else{
              //   setIsPlaying(false)
              // }
              if(json['playing']['Status'] !== 'Playing' && loop && vod.current?.url != null){
                const noLoop= vodChannel && vodChannel.length > 1 || !loop ? ' no_loop' : '';
                vertoSessionRef.current?.sendDebugAction("vod_play", `${getVodName(vod.current.url)}${noLoop}`, "conf-control");
              }
            } catch (err: any) {
              console.error("Still broken:", err.message);
            }
          }
        }
      });
    }
  }, [streamIsReady, loop, vod.current,vertoSessionRef.current]);

  useEffect(() => {
    if(vertoSessionRef.current && vod && vertoSessionRef.current.getModeratorChannel() !== null){
      vertoSessionRef.current?.sendDebugAction("vid-layout", "1up_top_left+9_orig", "conf-control");
      let vodName = getVodName(vod.current?.url!);
      if(vodChannel.length>1){
        vodName=vodName+' no_loop'
      }
      vertoSessionRef.current?.sendDebugAction("vod_play", `${vodName}`, "conf-control");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vod, vertoSessionRef.current?.getModeratorChannel()]);


  const playVodChannel=(vodurl: string)=>{
    let vodName = getVodName(vodurl)+' no_loop';
    vertoSessionRef.current?.sendDebugAction("vod_play", `${vodName}`, "conf-control");
  }

  return (
    <>
      {vertoSessionRef.current && <RoomConnectionStatus vertoSession={vertoSessionRef.current}/>}
      <video ref={videoRoomRef} autoPlay playsInline/>
       <div className="player-wrapper" style={{ display: 'none' }}>
        {vod.current && 
          <ReactPlayer
            ref={playerRef}
            url={vod.current?.url}
            playing={isPlaying}
            loop={loop}
            muted={true}
            width="100%"
            height="100%"
            onReady={(player) => {
              const internalPlayer = player.getInternalPlayer();
              if (internalPlayer) {
                onPlayerReady(internalPlayer as HTMLVideoElement);
              }
            }}
            onPause={() => {
              const internalPlayer = playerRef.current?.getInternalPlayer()
              console.log(internalPlayer?.muted,'Le lecteur est en pause.')}}
            onError={(error)=>{console.log('the error', error)}}
            config={{
              file: {
                attributes: {
                crossOrigin: "true",
                }
              },
            }}
        />
        }
        
      </div>

      <IonAlert
        isOpen={alertState.show}
        onDidDismiss={() => setAlertState({show: false, mic: false})}
        message={t(
          `livingRoom.${alertState.mic ? 'unmuteMic' : 'startCam'}`
        )}
        buttons={[
          {
            text: `${t('common.decline')}`,
            role: 'cancel'
          },
          {
            text: `${t('common.ok')}`,
            handler: () => {
              if (vertoSessionRef.current) {
                alertState.mic
                  ? vertoSessionRef.current.togglePrimaryMic()
                  : vertoSessionRef.current.togglePrimaryCam();
              }
            }
          }
        ]}
      />
    </>
  );
};

export default WatchPartySession;
