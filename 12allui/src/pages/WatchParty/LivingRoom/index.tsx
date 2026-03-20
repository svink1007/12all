import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import './styles.scss';
import {RouteComponentProps} from 'react-router';
import Layout from '../../../components/Layout';
import {HTMLVideoStreamElement, WebRTCUserMedia} from '../types';
import {ShareStreamOption} from '../enums';
import VertoSession from '../../../verto/VertoSession';
import videojs, {VideoJsPlayer} from 'video.js';
import 'video.js/dist/video-js.css';
import {Routes} from '../../../shared/routes';
import {INIT_GAIN_VOL, INIT_VOL, IS_IN_FULLSCREEN} from '../../../shared/constants';
import Participants from './Participants';
import Chat from '../../../components/Chat';
import SideBar from './SideBar';
import PlayerControlBar from './PlayerControlBar';
import {Participant} from '../../../verto/models';
import {ReduxSelectors, UserMedia} from '../../../redux/shared/types';
import useBeforeUnload from '../useBeforeUnload';
import getCamParams from '../../../shared/methods/getCamParams';
import getMicParams from '../../../shared/methods/getMicParams';
import WatchPartySession, {MEDIA_VIDEO_ID} from './WatchPartySession';
import BetsBar from '../components/bets/BetsBar';
import FullscreenListeners from './FullscreenListeners';
import ChangeStream from './ChangeStream';
import ChangeFile from './ChangeFile';
import ProgressLoader from '../../../components/ProgressLoader';
import {VlrService} from '../../../services';
import AdSenseCard from '../../../components/AdSense/AdSenseCard';
import {AdSenseFormat, AdSenseSlot} from '../../../components/AdSense';
import getDisplayMedia from '../../../shared/methods/getDisplayMedia';
import {setErrorToast} from '../../../redux/actions/toastActions';
import {setInRoom} from '../../../redux/actions/inRoomActions';
import setLivingRoom from '../../../redux/actions/livingRoomActions';
import NoVideoCanvas from '../../../components/NoVideoCanvas';
import useNetworkUpSpeed from '../../../hooks/useNetworkUpSpeed';
import useApplyVideoTrackConstrains from '../../../hooks/useApplyVideoTrackConstrains';
import StreamDebugInfo from '../../../components/StreamDebugInfo';
import giveRewards  from "../../../images/icons/ask-reward.svg";

import {
  resetStreamDebugValues,
  setStreamDebug,
  setStreamDebugReplaceSentStream,
  setStreamDebugSentStream,
  setStreamDebugVideoElement
} from '../../../redux/actions/streamDebugActions';
import { IonAlert, IonButton, IonImg } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { SharedStream } from '../../../shared/types';
import {motion} from "framer-motion";
import TopBarStream from '../../../pages/SharedStream/TopBarStream';
import RoomActions from '../../../components/RoomActions';
import { channelCostDescription } from '../../../components/Billing/Utils/billingDescriptions';
import GiveStarModal from '../components/GiveStarModal';
import { VertoLayout } from 'src/verto/types';
import { getRecordingId } from 'src/shared/helpers';
import { addRecordedVod } from 'src/redux/actions/vodActions';
import {setupVerto} from "../../../redux/actions/vertoActions";

const LivingRoom: FC<RouteComponentProps> = ({history}: RouteComponentProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const livingRoom = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);
  // const userMedia: UserMedia = {
  //   cam: "0",
  //   mic: "1",
  // };
  const userMedia = useSelector(({userMedia}: ReduxSelectors) => userMedia);
  const inRoom = useSelector(({inRoom}: ReduxSelectors) => inRoom);
  const pageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoStreamElement>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const userMediaRef = useRef<MediaStream>();
  const screenShareRef = useRef<MediaStream | null>(null);
  const vertoSessionRef = useRef<VertoSession | null>(null);
  const noVideoTrackRef = useRef<MediaStreamTrack>();
  const participantsRef = useRef<Participant[]>([]);
  const sharedRef = useRef<{ oldValue: ShareStreamOption | null, newValue: ShareStreamOption | null }>({
    oldValue: null,
    newValue: null
  });
  const shareRef = useRef<ShareStreamOption | null>(livingRoom.share);
  const mediaRecorderRef = useRef<MediaRecorder>();
  const micMutedRef = useRef<boolean>(true);

  const [recordedId, setRecordedId] = useState<string | null>(null)
  const [vjsPlayer, setVjsPlayer] = useState<VideoJsPlayer | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomHost,setRoomHost ]=useState<Participant>();
  const [participantTalks, setParticipantTalks] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showProgressLeave, setShowProgressLeave] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [captureStream, setCaptureStream] = useState<MediaStream | null>(null);
  const [micMuted, setMicMuted] = useState<boolean>(true);
  const [camStopped, setCamStopped] = useState<boolean>(true);
  const [gainNode, setGainNode] = useState<GainNode>();
  const [showDebugStream, setShowDebugStream] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showChangeStream, setShowChangeStream] = useState<boolean>(false);
  const [showChangeFile, setShowChangeFile] = useState<boolean>(false);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [isExitAlert, setIsExitAlert] = useState<boolean>(false)
  const [isSecondaryRecalled, setIsSecondaryRecalled] = useState<boolean>(false)
  const [showBets, setShowBets] = useState<boolean>(false);
  const [showGiveRewards, setShowGiveRewards] = useState<boolean>(false);
  const [currentLayout, setCurrentLayout]=useState<string>(VertoLayout.VideoLeftLarge);



  const handleNoVideoTrack = useCallback((track: MediaStreamTrack) => {
    noVideoTrackRef.current = track;
  }, []);

  // @@@
  let emptyAudioMediaStream: any = null;
  const getEmptyAudioStream = () => {
    if (emptyAudioMediaStream) {
      return emptyAudioMediaStream;
    }

    // Create a silent oscillator as the audio source
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 0; // Silence by setting frequency to 0
    oscillator.connect(destination);
    oscillator.start();

    emptyAudioMediaStream = destination.stream;
    emptyAudioMediaStream.getAudioTracks()[0].enabled = true; // Ensure it's silent

    return emptyAudioMediaStream;
  }

  const streamWidth = useNetworkUpSpeed(
      (livingRoom.share === ShareStreamOption.Stream || livingRoom.share === ShareStreamOption.File) &&
      inRoom.sharingInProgress, livingRoom.upSpeedUrl
  );
  useApplyVideoTrackConstrains(streamWidth, videoTrack);

  const captureMediaStream = useCallback(async () => {
    const videoEl = videoRef.current;
    if (!videoEl) {
      throw new Error('Cannot get media ref');
    }

    let capStream: MediaStream;
    if (videoEl.mozCaptureStream) {
      capStream = videoEl.mozCaptureStream();
      if (audioRef.current) {
        audioRef.current.srcObject = capStream;
      }
    } else if (videoEl.captureStream) {
      capStream = videoEl.captureStream();
    } else {
      throw new Error('Capture stream is not supported');
    }

    setVideoTrack(null);
    if (capStream.getVideoTracks().length > 0) {
      setVideoTrack(capStream.getVideoTracks()[0]);
    } else if (noVideoTrackRef.current) {
      capStream = new MediaStream([
        capStream.getAudioTracks()[0],
        noVideoTrackRef.current
      ]);
    }

    setCaptureStream(capStream);

    dispatch(setStreamDebugSentStream(capStream));
    return capStream;
  }, [dispatch]);

  const mergeAudioStreams = useCallback(
      (userStream: MediaStream, sharedStream: any, shareScreen: boolean = false) => {

        const audioContext = new AudioContext();
        // Create with shared stream
        const capturedAudioSource = audioContext.createMediaStreamSource(
            sharedStream
        );
        const audioDestination = audioContext.createMediaStreamDestination();

        // Add user microphone
        const userAudioSource = audioContext.createMediaStreamSource(userStream);
        userAudioSource.connect(audioDestination);

        if (sharedStream) {
          if (shareScreen) {
            capturedAudioSource.connect(audioDestination);
          } else {
            // Increase volume of shared stream
            const gainNode = audioContext.createGain();
            setGainNode(gainNode);
            capturedAudioSource.connect(gainNode);
            gainNode.connect(audioDestination);
            gainNode.gain.value = INIT_VOL;
          }
        }

        return { primaryStream:  getEmptyAudioStream(), secondaryStream: audioDestination.stream};

      }, []);

  const makeSecondaryCall = useCallback((stream: MediaStream, myName: string, sharing: string) => {

    const getOutgoingBW = (sharing: string) => {
      switch (sharing) {
        case "stream_share":
          return 1300;
        case "screen_share":
          return 1200;
        default:
          return 1300;
      }
    }

    vertoSessionRef.current?.initSecondaryCall({
      stream,
      channelName: `${myName} sharing`,
      // @@@ receiveStream: sharing === "screen_share" ? false : true,
      receiveStream: true,
      incomingBandwidth: 1500,
      outgoingBandwidth: getOutgoingBW(sharing),
      destinationNumber: `${livingRoom.roomId}_stream_720`,
      connectionType: `merge_watch_stream_channel`,
    });
    if (userMediaRef.current) {
      // @@@ Is this the expected behaviour ? need to change GUI icon as well
      userMediaRef.current.getAudioTracks()[0].enabled = false;
    }
  }, [livingRoom])

  const handleSwitchChannel = useCallback((stream: SharedStream | null) => {
    const parseRoomMode = (mode: string) => {
      if(mode === "public") {
        return false
      } else if (mode === "private") {
        return true;
      }
      return false;
    }

    if (stream) {
      VlrService.patchMetadata({
        channelName: `${stream.name}`,
        streamId: stream.id,
        publicId: livingRoom.publicRoomId,
        logo: stream.logo,
        isPrivate: stream.is_adult_content ? true : parseRoomMode(livingRoom.mode)
      }).then();
    }
  }, [livingRoom])

  // @@@ Stream share callback
  const handleTrackChange = useCallback(async () => {
    try {

      const capStream = await captureMediaStream();
      let mergedMedia: MediaStream | null = null;

      if (!livingRoom.singleConnection && userMediaRef.current) {
        const audio: any = mergeAudioStreams(userMediaRef.current, capStream);
        mergedMedia = new MediaStream([audio.secondaryStream.getAudioTracks()[0], capStream.getVideoTracks()[0]]);
      }



      const me = participantsRef.current.find(p => p.me);
      const stream = mergedMedia || capStream;

      if(me && livingRoom.share === ShareStreamOption.File && shareRef.current === ShareStreamOption.Stream && vertoSessionRef.current?.hasSecondaryCall())  {
        // vertoSessionRef.current.secondaryVertoCall?.hangup()
        vertoSessionRef.current?.replaceTracks(stream); // @@@ Primary or secondary ?
        // makeSecondaryCall(stream, me.participantName, "stream_share");
        // setIsSecondaryRecalled(true)
      }

      else if (me && (shareRef.current === ShareStreamOption.Camera || shareRef.current === ShareStreamOption.File) && !vertoSessionRef.current?.hasSecondaryCall()) {
        makeSecondaryCall(stream, me.participantName, "stream_share");
      } else {
        // const {secondaryVertoCall} = vertoSessionRef.current


        if(!isSecondaryRecalled && me && livingRoom.share === ShareStreamOption.Stream && vertoSessionRef.current?.hasSecondaryCall()) {
          vertoSessionRef.current.secondaryVertoCall?.hangup()
          makeSecondaryCall(stream, me.participantName, "stream_share");
          setIsSecondaryRecalled(true)
        } else {
          if (vertoSessionRef.current?.secondaryVertoCall) {
            const secondaryVertoCall = vertoSessionRef.current.secondaryVertoCall
            // @@@ This will not work (and parameters are wrong), but the parameter suppose to already be ok
            // secondaryVertoCall.dialogParams.outgoingBandwidth = 1300
            // secondaryVertoCall.rtc.options.receiveStream = false
          }
          vertoSessionRef.current?.replaceTracks(stream);
        }
      }

      dispatch(setInRoom({sharingInProgress: true}));
    } catch (e: any) {
      console.error(e);
      dispatch(setErrorToast('Unexpected error. Could not change the stream.'));
      vertoSessionRef.current?.hangup();
      vertoSessionRef.current?.cleanupWebRTC();
      vertoSessionRef.current = null;
    }
  }, [captureMediaStream, dispatch, livingRoom.singleConnection, mergeAudioStreams, makeSecondaryCall, livingRoom.share, isSecondaryRecalled]);

  const handleVjsPlayer = useCallback((videoEl?: HTMLVideoStreamElement) => {
    setVjsPlayer(videojs.getPlayer(MEDIA_VIDEO_ID) || null);
    videoRef.current = videoEl;
    videoEl && dispatch(setStreamDebugVideoElement(videoEl));
  }, [dispatch]);

  useEffect(() => {
    if (livingRoom.share === ShareStreamOption.Stream || livingRoom.share === ShareStreamOption.File) {
      setParticipantTalks(!micMuted || !!participants.find(p => !p.audio.muted && !p.isHostSharedVideo));
    }
  }, [micMuted, participants, livingRoom.share]);

  useEffect(() => {
    dispatch(resetStreamDebugValues());

    dispatch(setInRoom({
      isCoHost: false,
      loadingStream: false,
      sharingInProgress: shareRef.current !== ShareStreamOption.Camera
    }));

    document.onfullscreenchange = () => {
      setIsFullscreen(IS_IN_FULLSCREEN());
    };

    return () => {
      userMediaRef.current?.getTracks().forEach(t => t.stop());
      screenShareRef.current?.getTracks().forEach(t => t.stop());

      if (videojs.getPlayer(MEDIA_VIDEO_ID)) {
        videojs(MEDIA_VIDEO_ID).dispose();
      }

      if (IS_IN_FULLSCREEN()) {
        document.exitFullscreen().then();
      }

      vertoSessionRef.current?.hangup();
      vertoSessionRef.current?.cleanupWebRTC();
    };
  }, [dispatch, livingRoom.publicRoomId]);

  useEffect(() => {
    micMutedRef.current = micMuted;
  }, [micMuted]);

  useBeforeUnload(useCallback(() => {
    vertoSessionRef.current?.hangup();
    vertoSessionRef.current?.cleanupWebRTC();
  }, []));

  // @@@
  const getStreamLog = (stream: MediaStream) =>{
    if (!stream) {
      return 'NoStream';
    }
    const logLine = `MediaStream ID: ${stream.id}, Active: ${stream.active}, Audio Tracks: [${stream.getAudioTracks().map(t => `ID: ${t.id}, Label: ${t.label}, Enabled: ${t.enabled}, Muted: ${t.muted}, ReadyState: ${t.readyState}`).join(" | ")}], Video Tracks: [${stream.getVideoTracks().map(t => `ID: ${t.id}, Label: ${t.label}, Enabled: ${t.enabled}, Muted: ${t.muted}, ReadyState: ${t.readyState}`).join(" | ")}]`;
    return logLine;
  }

  const handleUserMediaChange = ({cam, mic}: WebRTCUserMedia) => {
    const audio = getMicParams(mic);
    const video = getCamParams(cam);


    navigator.mediaDevices
        .getUserMedia({audio, video})
        .then((userStream: MediaStream) => {
          if (!vertoSessionRef.current) {
            throw new Error('No session');
          }

          const sharedStream = captureStream || screenShareRef.current;


          if (!livingRoom.singleConnection && sharedStream) {
            const mergedAudioStream: any = mergeAudioStreams(userStream, sharedStream, !!screenShareRef.current);

            userStream.getAudioTracks()[0].enabled = userMediaRef.current?.getAudioTracks()[0].enabled || false;

            let video: MediaStreamTrack | null = null;
            if (userStream.getVideoTracks().length) {
              video = userStream.getVideoTracks()[0];
            } else if (noVideoTrackRef.current) {
              video = noVideoTrackRef.current;
            }

            const audio = mergedAudioStream.secondaryStream.getAudioTracks()[0];
            video && vertoSessionRef.current?.replacePrimaryVideoSecondaryAudioTrack(audio, video);
          } else {
            if (userStream.getVideoTracks().length) {
              vertoSessionRef.current.replacePrimaryTracks(userStream);
            } else if (noVideoTrackRef.current) {
              const audio = userStream.getAudioTracks()[0];
              const video = noVideoTrackRef.current;
              vertoSessionRef.current.replacePrimaryTracks(new MediaStream([audio, video]));
            }
          }

          userMediaRef.current?.getTracks().forEach(t => t.stop());
          userMediaRef.current = userStream;
        })
        .catch((err) => console.error(err));
  };

  const handleParticipantsChange = useCallback((participants: Participant[]) => {
    participantsRef.current = participants;
    const host =participantsRef.current.filter(participant=>participant.isHost)[0];
    setRoomHost(host)
    setParticipants([...participants]);
  }, []);

  const stopScreenShareTracks = () => {
    if (screenShareRef.current) {
      screenShareRef.current.getTracks().forEach(track => track.stop());
      screenShareRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const disconnectSecondaryCall = useCallback(() => {
    const changeHost = (me: Participant) => {
      VlrService.changeHost({participantId: me.participantId, roomId: livingRoom.roomId}).then();
      vertoSessionRef.current?.giveParticipantFloor(me.participantId);
    };

    const host = participantsRef.current.find(p => p.isHost);
    if (host) {
      changeHost(host);
    } else {
      const coHost = participantsRef.current.find(p => p.isCoHost);
      coHost && changeHost(coHost);
    }

    if (userMediaRef.current) {
      vertoSessionRef.current?.replaceSecondaryTracks(new MediaStream(userMediaRef.current.getAudioTracks()));
    }

    dispatch(setInRoom({sharingInProgress: false}));
    dispatch(setLivingRoom({share: ShareStreamOption.Camera}));
    dispatch(setStreamDebug({sentStream: userMediaRef.current || null, videoElement: null}));
  }, [livingRoom.roomId, dispatch]);

  const handleStopStream = () => {
    disconnectSecondaryCall();
    resetStream();
  };

  

  const handleStopScreenShare = useCallback(() => {
    if (livingRoom.singleConnection) {
      vertoSessionRef.current?.hangup();
      vertoSessionRef.current?.cleanupWebRTC();
    } else {
      disconnectSecondaryCall();
    }

    stopScreenShareTracks();
  }, [livingRoom.singleConnection, disconnectSecondaryCall]);

  const resetStream = useCallback(() => {
    videojs.getPlayer(MEDIA_VIDEO_ID) && videojs(MEDIA_VIDEO_ID).dispose();
    setVjsPlayer(null);
    setCaptureStream(null);
    dispatch(setLivingRoom({myStream: null, files: null, streamName: null}));
  }, [dispatch]);

  const handleStopSharing = useCallback(() => {
    disconnectSecondaryCall();
    stopScreenShareTracks();
    resetStream();
  }, [disconnectSecondaryCall, resetStream]);

  const handleStreamRefChange = useCallback((stream: MediaStream) => {
    screenShareRef.current?.getTracks().forEach(track => track.stop());
    screenShareRef.current = stream;
    screenShareRef.current.getVideoTracks()[0].onended = () => handleStopScreenShare;
    dispatch(setStreamDebug({sentStream: stream, videoElement: null}));
  }, [handleStopScreenShare, dispatch]);

  const handleOnUserStream = useCallback((userStream: MediaStream) => {
    userMediaRef.current = userStream;
  }, []);

  const handleToggleCam = async () => {
    setCamStopped(prevState => !prevState);
    userMediaRef.current?.getVideoTracks().forEach((track: MediaStreamTrack | CanvasCaptureMediaStreamTrack) => {
      if (!('canvas' in track)) {
        track.stop();
      }
    });
    const changeUserMedia = (videoTrack: MediaStreamTrack) => {
      const mediaStream = new MediaStream([videoTrack]);
      if (userMediaRef.current?.getTracks().length) {
        userMediaRef.current = new MediaStream([userMediaRef.current?.getAudioTracks()[0], videoTrack]);
      } else {
        userMediaRef.current = mediaStream;
      }
      livingRoom.share === ShareStreamOption.Camera && dispatch(setStreamDebugReplaceSentStream(mediaStream));
      vertoSessionRef.current?.replacePrimaryTracks(mediaStream);
    };

    if (camStopped) {
      try {
        const video = getCamParams(userMedia.cam, true);
        const stream = await navigator.mediaDevices.getUserMedia({audio: false, video});
        changeUserMedia(stream.getVideoTracks()[0]);
      } catch (e) {
        dispatch(setErrorToast('livingRoom.camError'));
        console.error(e);
        return;
      }
    } else if (noVideoTrackRef.current) {
      changeUserMedia(noVideoTrackRef.current);
    }

    vertoSessionRef.current?.togglePrimaryCam();
  };

  const handleToggleMic = () => {
    /* if(!micMuted){
      vjsPlayer?.volume?.(0)
    }else{
      vjsPlayer?.volume(100)
    } */
    setMicMuted(prevState => !prevState);
    vertoSessionRef.current?.togglePrimaryMic();
    vertoSessionRef.current?.sendDebugAction("a_play_volume", "-100", "conf-control");
    
  };

  const handleFullscreenChange = (value: boolean) => {
    if (value) {
      pageRef.current?.requestFullscreen().then();
    } else {
      document.exitFullscreen().then();
    }
  };

  const giveSharingFloor = () => {
    const sharing = participantsRef.current.find(p => p.me && p.isHostSharedVideo && !p.video.floor);
    sharing && vertoSessionRef.current?.giveParticipantFloor(sharing.participantId);
    vertoSessionRef.current?.sendMessage.stopAllMediaShare();
  };

  const handleScreenShare = async () => {
    const displayMediaStream = await getDisplayMedia();
    handleStreamRefChange(displayMediaStream);
    let mergedMediaStream: any = null;

    debugger;
    if (livingRoom.joinCamMic && userMediaRef.current) {
      const mergedStreams = mergeAudioStreams(userMediaRef.current, displayMediaStream, true);
      mergedMediaStream = new MediaStream([
        mergedStreams.secondaryStream.getAudioTracks()[0],
        displayMediaStream.getVideoTracks()[0]
      ]);
    }

    const me = participants.find(p => p.me);
    if (me && !vertoSessionRef.current?.hasSecondaryCall() && mergedMediaStream) {
      makeSecondaryCall(mergedMediaStream, me.participantName, "screen_share");
      // @@@ Should replace primary
    } else {
      debugger;
      if(vertoSessionRef.current?.secondaryVertoCall) {
        const secondaryVertoCall = vertoSessionRef.current.secondaryVertoCall
        secondaryVertoCall.dialogParams.outgoingBandwidth = 1200
        // @@@ Does this works ?
        secondaryVertoCall.rtc.options.receiveStream = false
      }

      vertoSessionRef.current?.replaceTracks(mergedMediaStream || displayMediaStream);
      giveSharingFloor();
    }

    me && vertoSessionRef.current?.sendMessage.stopMediaShare(me.callId);
    dispatch(setLivingRoom({share: ShareStreamOption.Screen}));
    dispatch(setInRoom({sharingInProgress: true}));
  };

  const handleShareMyCamera = () => {
    handleUserMediaChange(userMedia);
  };

  const handleVertoSessionChange = useCallback((vertoSession: VertoSession) => {
    vertoSession.notification.onSecondaryCallRemoteStream.subscribe(() => {
      if (userMediaRef.current) {
        userMediaRef.current.getAudioTracks()[0].enabled = !micMutedRef.current;
      }
    });

    vertoSession.notification.onReplaceTracksDone.subscribe(() => {
      if (sharedRef.current.oldValue === sharedRef.current.newValue) {
        return;
      }

      sharedRef.current.oldValue = sharedRef.current.newValue;

      const stopUserTracks = () => {
        livingRoom.singleConnection && userMediaRef.current?.getTracks().forEach(t => t.stop());
      };

      switch (sharedRef.current.newValue) {
        case ShareStreamOption.Camera:
          stopScreenShareTracks();
          resetStream();
          dispatch(setLivingRoom({share: sharedRef.current.newValue}));
          break;
        case ShareStreamOption.Stream:
        case ShareStreamOption.File:
          stopUserTracks();
          stopScreenShareTracks();
          break;
        case ShareStreamOption.Screen:
          stopUserTracks();
          resetStream();
          dispatch(setLivingRoom({share: sharedRef.current.newValue}));
          break;
      }
    });
    vertoSession.notification.onWebSocketMessage.subscribe((vertoEvent)=>{
      const result=getRecordingId(vertoEvent)
      if(result!==null && recordedId===null){
        setRecordedId(result.recordingId);
      }
    })
    vertoSession.notification.onStopAllMediaShare.subscribe(() => {
      disconnectSecondaryCall();
      stopScreenShareTracks();
      resetStream();
    });
    vertoSessionRef.current = vertoSession;

    if(vertoSessionRef.current){
      dispatch(setupVerto({session: vertoSessionRef.current}));
    }

  }, [dispatch, disconnectSecondaryCall, livingRoom.singleConnection, resetStream]);

  const handleOnLeave = () => {
    if(recordedId){
      dispatch(addRecordedVod(recordedId));
      setRecordedId(null);
    }
    vertoSessionRef.current?.hangup();
    vertoSessionRef.current?.cleanupWebRTC();
    vertoSessionRef.current = null;
  };

  const handleMicMuted = useCallback((muted: boolean) => {
    setMicMuted(muted);
    if (userMediaRef.current) {
      const audioTrack = userMediaRef.current.getAudioTracks()[0];
      userMediaRef.current.getAudioTracks()[0].enabled = !muted;
    }
  }, []);

  const handleOnWatchPartySessionLeave = useCallback(() => {
    history.replace(livingRoom.joinedFromJoinScreen ? Routes.Home : Routes.WatchPartyStart2);
  }, [history, livingRoom.joinedFromJoinScreen]);

  const handleExitAlert = () => {
      setIsExitAlert(true);
  }

  const [theatreMode, setTheatreMode] =
      useState<boolean>(false);

  const handleLayoutChange=(layout: VertoLayout)=>{
    vertoSessionRef.current?.changeLayout(layout);
    setCurrentLayout(layout);
  }
  const handleTheatreModeChange = () => {
    if(currentLayout===VertoLayout.OnlyVideo){
      setCurrentLayout(VertoLayout.VideoLeftLarge);
      vertoSessionRef.current?.changeLayout(VertoLayout.VideoLeftLarge);
    }else{
      setCurrentLayout(VertoLayout.OnlyVideo);
      vertoSessionRef.current?.changeLayout(VertoLayout.OnlyVideo);

    }
    
   /*  setTheatreMode(prevState => {
      return !prevState;
    }); */ 
  };


const syncAudioControls = useCallback((
  muted: boolean, 
  volume: number,
  targetPlayer?: VideoJsPlayer
) => {
  if (targetPlayer) {
    targetPlayer.muted(muted);
    if (!muted) {
      targetPlayer.volume(volume);
    }
  }
  
  // GainNode (stream sent to user)
  if (gainNode) {
    if (muted) {
      gainNode.gain.value = 0;
    } else {
      // calcul the gain base on volume
      let gainValue;
      if (volume < 0.2) {
        gainValue = 0.2;
      } else if (volume >= 0.2 && volume < 0.4) {
        gainValue = 0.4;
      } else if (volume >= 0.4 && volume < 0.6) {
        gainValue = 0.6;
      } else if (volume >= 0.6 && volume < 0.8) {
        gainValue = 0.8;
      } else {
        gainValue = INIT_GAIN_VOL; 
      }
      gainNode.gain.value = gainValue;
    }
  }
}, [gainNode]);




  return (
      <Layout>
        {/*<ProgressLoader*/}
        {/*    progress={progress}*/}
        {/*    show={loading}*/}
        {/*    showLeave={showProgressLeave}*/}
        {/*    onLeave={() => history.replace(Routes.WatchPartyStart2)}*/}
        {/*/>*/}

        <main
            ref={pageRef}
            hidden={loading}
            className={
              `living-room-main${isFullscreen ?
                  (livingRoom.share === ShareStreamOption.Stream || livingRoom.share === ShareStreamOption.File ? '-fullscreen player-controller' : '-fullscreen')
                  : '' + !theatreMode ? "" : "theatre-mode"}`
            }
        >
          {
            !theatreMode ? (
                <section className={`living-room-chat-container ${showChat ? 'side-content-open' : ''}`}>
                  <AdSenseCard
                      slot={AdSenseSlot.Left}
                      format={AdSenseFormat.Rectangle}
                      className="ad"
                  />

                  {!loading && vertoSessionRef.current && (
                      <Chat
                          vlrId={livingRoom.vlrId}
                          session={vertoSessionRef.current}
                          participants={participants}
                          show={showChat}
                      />
                  )}
                </section>
            ) : <></>
          }

          <motion.div
              initial={{x: "-100%"}}
              animate={{x: theatreMode && showChat ? "0%" : "-100%"}}
              transition={{type: "spring", stiffness: 300, damping: 30}}
              className="fixed left-0 bottom-0 z-50 flex chat-container-size"
          >
            {!loading && vertoSessionRef.current && (
                <Chat
                    vlrId={livingRoom.vlrId}
                    session={vertoSessionRef.current}
                    participants={participants}
                    show={showChat}
                />
            )}
          </motion.div>

          <section className="video-room-container">
            <TopBarStream
                logo={livingRoom.channel.logo}
                streamName={livingRoom.channel.name}
                roomId={livingRoom.publicRoomId}
                participants={participants}
                onExit={handleExitAlert}
            />
            <main className={!theatreMode ? "video-room-main" : "video-room-main theatre-mode"}>
              <div className="video-room-inner">
                <NoVideoCanvas onVideoTrack={handleNoVideoTrack}/>
                <WatchPartySession
                    noVideoTrack={noVideoTrackRef}
                    captureMediaStream={captureMediaStream}
                    onMicMuted={handleMicMuted}
                    onCamStopped={setCamStopped}
                    onShowProgressLeave={setShowProgressLeave}
                    onVertoSession={handleVertoSessionChange}
                    onProgress={setProgress}
                    onShowLoading={setLoading}
                    onParticipants={handleParticipantsChange}
                    onLeave={handleOnWatchPartySessionLeave}
                    onGainNode={setGainNode}
                    onUserStream={handleOnUserStream}
                    onStopSharing={handleStopSharing}
                    onMergeStreams={mergeAudioStreams}
                    onScreenShareStream={handleStreamRefChange}
                    onVjsPlayer={handleVjsPlayer}
                />
                {
                    vjsPlayer &&
                    (livingRoom.share === ShareStreamOption.Stream || livingRoom.share === ShareStreamOption.File) &&
                    !loading &&
                    <PlayerControlBar
                        vjs={vjsPlayer}
                        talking={participantTalks}
                        files={livingRoom.files}
                        myStream={livingRoom.myStream}
                        onTrackChange={handleTrackChange}
                        gainNode={gainNode}
                        onSyncAudio={syncAudioControls}
                    />
                }
              </div>

              {!loading && (
                  <SideBar
                      showParticipants={showParticipants}
                      showChat={showChat}
                      showDebugStream={showDebugStream}
                      micMuted={micMuted}
                      camStopped={camStopped}
                      isFullscreen={isFullscreen}
                      onShowParticipants={setShowParticipants}
                      onShowChat={setShowChat}
                      onShowDebugStream={setShowDebugStream}
                      onUserMediaChange={handleUserMediaChange}
                      onToggleCam={handleToggleCam}
                      onToggleMic={handleToggleMic}
                      onFullscreen={handleFullscreenChange}
                      onChangeStream={() => setShowChangeStream(true)}
                      onChangeFile={() => setShowChangeFile(true)}
                      onStopStream={handleStopStream}
                      onLayoutChange={layout=>handleLayoutChange(layout)}
                      onScreenShare={handleScreenShare}
                      onStopScreenShare={handleStopScreenShare}
                      onShareMyCamera={handleShareMyCamera}
                      onSharedOptionChanged={option => sharedRef.current.newValue = option}
                      setIsSecondaryRecalled={setIsSecondaryRecalled}
                      onTheatreMode={handleTheatreModeChange}
                      theatreMode={theatreMode}
                      onShowBets={setShowBets}
                      showBets={showBets}
                      showGiveRewards={showGiveRewards}
                      onShowGiveRewards={setShowGiveRewards}
                      currentLayout={currentLayout}
                      participantsCount={participantsRef.current.length}
                      recordedId={recordedId}
                  />
              )}
            </main>
            {vertoSessionRef.current && (
              <>
                <BetsBar
                  isFullscreen={false}
                  session={vertoSessionRef.current}
                  roomId={Number(livingRoom.vlrId)}
                  isRoomOwner={livingRoom.isHost}
                  show={showBets}
                />
                {roomHost &&
                  <GiveStarModal 
                    hostId={roomHost.userId as number}          
                    show={showGiveRewards}
                    setShow={setShowGiveRewards}
                  />
                }
              </>
                
            )}



          </section>

          <audio ref={audioRef} autoPlay hidden/>

          {
            !theatreMode ?
                (
                    <section
                        className={`living-room-side-features ${showDebugStream || showParticipants ? 'side-content-open' : ''}`}>
                      <AdSenseCard
                          slot={AdSenseSlot.Right}
                          format={AdSenseFormat.Rectangle}
                          className="ad"
                      />

                      {showDebugStream && <StreamDebugInfo/>}

                      {
                          vertoSessionRef.current &&
                          <Participants
                              isFullscreen={isFullscreen}
                              session={vertoSessionRef.current}
                              participants={participants}
                              host
                              show={showParticipants}
                          />
                      }
                    </section>
                ) :
                <></>
          }

          <motion.div
              initial={{x: "-100%"}}
              animate={{x: (theatreMode && showParticipants) ? "0%" : "-100%"}}
              transition={{type: "spring", stiffness: 300, damping: 30}}
              className="fixed bottom-0 left-0 shadow-lg z-50"
          >
            <section className="participant-theatre">
              {
                  vertoSessionRef.current &&
                  <Participants
                      isFullscreen={isFullscreen}
                      session={vertoSessionRef.current}
                      participants={participants}
                      host
                      show={showParticipants}
                  />
              }
            </section>
          </motion.div>

          <FullscreenListeners isInFullscreen={isFullscreen}/>
        </main>

        <ChangeStream
            show={showChangeStream}
            onOk={giveSharingFloor}
            onClose={() => setShowChangeStream(false)}
            handleSwitchChannel={handleSwitchChannel}
            onStopStream={handleStopStream}
        />

        <ChangeFile
            show={showChangeFile}
            onOk={giveSharingFloor}
            onClose={() => setShowChangeFile(false)}
        />

        {isExitAlert && <IonAlert
            isOpen={isExitAlert}
            onDidDismiss={() => setIsExitAlert(false)}
            message={t("watchPartyStart.aboutToLeave")}
            buttons={[
              {
                text: `${t("common.decline")}`,
                role: 'cancel'
              },
              {
                text: `${t("common.leave")}`,
                handler: () => {
                  handleOnLeave();
                }
              }
            ]}
        />}
      </Layout>
  );
};

export default LivingRoom;
