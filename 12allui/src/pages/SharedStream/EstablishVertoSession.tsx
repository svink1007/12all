import React, {
  FC,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import VertoSession from "../../verto/VertoSession";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import { StreamVlr, UpdateStreamVlr } from "./index";
import { HTMLVideoStreamElement } from "../WatchParty/types";
import { Participant, SwitchHost } from "../../verto/models";
import { VlrService } from "../../services";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/shared/types";
import { streamLoadingDone } from "../../redux/actions/streamLoadingActions";
import { setRoomLayout } from "../../redux/actions/roomLayoutActions";
import useNetworkUpSpeed from "../../hooks/useNetworkUpSpeed";
import useApplyVideoTrackConstrains from "../../hooks/useApplyVideoTrackConstrains";
import { Socket } from "socket.io-client";
import Hls from "hls.js";
import {
  resetStreamDebugValues,
  setStreamDebugHlsError,
  setStreamDebugReceivedStream,
  setStreamDebugReplaceSentStream,
  setStreamDebugSentStream,
  setStreamDebugVertoSession,
  setStreamDebugVideoElement,
} from "../../redux/actions/streamDebugActions";
import { useTranslation } from "react-i18next";
import { ToastTextFormat } from "../../redux/shared/enums";

import { getFakeAudioMediaStreamTrack } from "../StreamTest";
import { FakeAudioTrack } from "../../models/FakeAudioTrack";
import { initRoomSocket } from "../../shared/methods/initRoomSocket";
import {
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
} from "../../hooks/useRoomsSocket";

type Props = {
  isRoomPrivate: boolean;
  volume: number;
  micMuted: boolean;
  imHost: boolean;
  caller: string;
  userId: number | null
  streamName: string;
  streamUrl: string | null;
  streamVlr: StreamVlr;
  roomRef: MutableRefObject<HTMLVideoStreamElement | null>;
  timeLoading: NodeJS.Timeout | null;
  noVideoTrack: MediaStreamTrack | null;
  // fsResolution?: number;
  onUserMedia: (stream: MediaStream) => void;
  onVertoSession: (session: VertoSession) => void;
  onImHost: (value: boolean) => void;
  onParticipants: (participants: Participant[]) => void;
  onProgress: (value: number) => void;
  onCanLeave: (value: boolean) => void;
  onDismissLoading: () => void;
  onStreamCamera: () => void;
  onUpdateStreamVlr: (data: UpdateStreamVlr) => void;
  onStreamIsPlaying: () => void;
  onStreamPlayFail: () => void;
  onRemoveStream?: () => void;
  setShowProgressbar?: (value: boolean) => void;
  setLoading2?: (value: boolean) => void;
  setShowInviteProgressbar?: (value: boolean) => void;
};

const EstablishVertoSession: FC<Props> = ({
  isRoomPrivate,
  volume,
  micMuted,
  imHost,
  caller,
  streamName,
  streamUrl,
  streamVlr,
  roomRef,
  timeLoading,
  noVideoTrack,
  userId,
  // fsResolution,
  onUserMedia,
  onVertoSession,
  onImHost,
  onParticipants,
  onProgress,
  onCanLeave,
  onDismissLoading,
  onStreamCamera,
  onUpdateStreamVlr,
  onStreamIsPlaying,
  onStreamPlayFail,
  onRemoveStream,
  setShowProgressbar,
  setLoading2,
  setShowInviteProgressbar,
}: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    streamMaxReconnectAttempts,
    streamReconnectInterval,
    streamPlayTimeout,
  } = useSelector(({ webConfig }: ReduxSelectors) => webConfig);
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const reactPlayerVideoElement = useRef<HTMLVideoStreamElement | null>(null);
  const vertoSession = useRef<VertoSession | null>(null);
  const establishFirstSession = useRef<boolean>(false);
  const streamConnectionAttemptsTimeout = useRef<NodeJS.Timeout>();
  const streamConnectionAttempts = useRef<number>(1);
  const streamConnectionAttemptsProgress = useRef<number>(0.0);
  const firstStreamPlay = useRef<boolean>(true);
  const streamReadyConnectingTimeout = useRef<NodeJS.Timeout>();
  const streamNameRef = useRef<string>("");
  const socket = useRef<Socket>();
  const streamAudioTrack = useRef<MediaStreamTrack>();
  const fakeAudioTrack = useRef<FakeAudioTrack>(new FakeAudioTrack());
  const broadcast = useRef<MediaStream>();

  const [muteReactPlayer, setMuteReactPlayer] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  // const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [streamReady, setStreamReady] = useState<boolean>(false);
  const [primaryCallEstablished, setPrimaryCallEstablished] =
    useState<boolean>(false);
  const [playerKey, setPlayerKey] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const streamWidth = useNetworkUpSpeed(imHost, streamVlr.upSpeedUrl);
  useApplyVideoTrackConstrains(streamWidth, videoTrack);

  // @@@ make this file constants for all and use it
  const kMcuIncomingBandwidth = 1500
  const kPrimaryOutgoingBandwidth = 500
  // @@@ const 	kPrimaryFsDestinationNumberPrefix = ‘_720’
  // kScreenShareFsDestinationNumberPrefix = ‘_stream_720’
  //	kStreamFsDestinationNumberPrefix = ‘_stream_720’
  const kScreenShareOutgoingBandwidth = 1200;
  const kStreamOutgoingBandwidth = 1300;
  const kWebcamWidth = 640
  const kWebcamHeight = 360
  const kWebcamFps = 15
  
const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
 const [isFallbackActive, setIsFallbackActive] = useState<boolean>(false);
const STREAM_PLAYBACK_FALLBACK_TIMEOUT = 35000;

const handleStreamPlaybackTimeout = () => {
  if(streamReady){// the stream is already play by the reactPlayer
    return;
  }
  setIsFallbackActive(true);
  if (streamConnectionAttemptsTimeout.current) {
    clearTimeout(streamConnectionAttemptsTimeout.current);
  }
  if (streamReadyConnectingTimeout.current) {
    clearTimeout(streamReadyConnectingTimeout.current);
  }
  reactPlayerVideoElement.current = null;
  setPlayerKey((prevState) => prevState + 1);
  if (vertoSession.current && streamUrl) {
    console.log('viucu')
    vertoSession.current.sendDebugAction("vid-layout", "1up_top_left+9_orig", "conf-control");
    vertoSession.current.sendDebugAction("a_play", streamUrl, "conf-control");
    if(roomRef.current){
       roomRef.current.muted = false;
    }
  }
};

const handlePlayerStreamReady = useCallback(
  (player: ReactPlayer) => {
    if (isFallbackActive) {
      return;
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current); 
    }
    onProgress(0.5);
    setStreamReady(false);

    const execute = async () => {
      reactPlayerVideoElement.current =
        player.getInternalPlayer() as HTMLVideoStreamElement;
      dispatch(setStreamDebugVideoElement(reactPlayerVideoElement.current));
      streamReadyConnectingTimeout.current = setTimeout(() => {
        dispatch(setErrorToast("sharedStream.temporaryUnavailable"));
        const participantsLeft = participants.filter(
          (p) => p.isActive && !p.me && !p.isHostSharedVideo
        );
        if (participantsLeft.length === 0) {
          vertoSession.current?.cleanupWebRTC();
        }
        vertoSession.current?.hangup();
      }, streamPlayTimeout * 1000);

      // Handle HLS errors
      let mediaError = 0;
      let mediaErrorTimeout: NodeJS.Timeout;
      const hls = player.getInternalPlayer("hls") as Hls | undefined;
      if (hls) {
        hls.on(Hls.Events.ERROR, (event, data) => {
          const errorMessage = `HLS ERROR ${data.type} ${data.details}${
            data.fatal ? " (fatal)" : ""
          }`;
          console.error(errorMessage);
          dispatch(setStreamDebugHlsError(errorMessage));

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("NETWORK ERROR, TRY TO RECOVER");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("FATAL MEDIA ERROR, TRY TO RECOVER");
                mediaErrorTimeout && clearTimeout(mediaErrorTimeout);
                mediaError > 0 && hls.swapAudioCodec();
                hls.recoverMediaError();
                mediaError++;
                mediaErrorTimeout = setTimeout(() => (mediaError = 0), 250);
                break;
              default:
                console.error("HLS FATAL DESTROY");
                setPlayerKey((prevState) => prevState + 1);
                break;
            }
          }
        });
      }

      // Play the video
      await reactPlayerVideoElement.current.play();
      onStreamIsPlaying();
      clearTimeout(streamReadyConnectingTimeout.current);
      setStreamReady(true);
      onProgress(0.9);
    };

    execute().catch((err) => {
      console.error(err);
      if (!timeLoading) {
        dispatch(
          setErrorToast("sharedStream.unexpectedErrorWhileConnectingToStream")
        );
        vertoSession.current?.hangup();
      }
    });
  },
  [dispatch,isFallbackActive, onProgress, timeLoading, onStreamIsPlaying, streamPlayTimeout]
);

const handlePlayerStreamError = (err: any) => {
  if (isFallbackActive) {
    return;
  }
  if (!reactPlayerVideoElement.current) {
    if (streamConnectionAttempts.current === streamMaxReconnectAttempts) {
      dispatch(setErrorToast("sharedStream.temporaryUnavailable"));
      dispatch(streamLoadingDone());
      if (firstStreamPlay.current) {
        const participantsLeft = participants.filter(
          (p) => p.isActive && !p.me && !p.isHostSharedVideo
        );
        
        if (participantsLeft.length === 0) {
          vertoSession.current?.cleanupWebRTC();
        }

        vertoSession.current?.hangup();
        onStreamPlayFail();
      }
     //instead of living the room we will try to play it on the server side
      //console.log('we play on the server')
      //handleStreamPlaybackTimeout(); 
    } else {
      streamConnectionAttempts.current++;

      if (streamConnectionAttemptsProgress.current <= 0.2) {
        streamConnectionAttemptsProgress.current += 0.02;
      }

      onProgress(0.3 + streamConnectionAttemptsProgress.current);

      streamConnectionAttemptsTimeout.current = setTimeout(() => {
        setPlayerKey((prevState) => prevState + 1);
      }, streamReconnectInterval * 1000);
    }
  } else {
    console.error(err?.message || err);
  }
};

  useEffect(() => {
    return () => {
      streamConnectionAttemptsTimeout.current &&
        clearTimeout(streamConnectionAttemptsTimeout.current);
      streamReadyConnectingTimeout.current &&
        clearTimeout(streamReadyConnectingTimeout.current);
      socket.current?.disconnect();
    };
  }, []);

  useEffect(()=>{
    if (imHost && primaryCallEstablished  && streamUrl && !fallbackTimerRef.current) {
      fallbackTimerRef.current = setTimeout(() => {
        handleStreamPlaybackTimeout();
      }, STREAM_PLAYBACK_FALLBACK_TIMEOUT);
      
    }
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  },[streamUrl, imHost, primaryCallEstablished ])
  
  useEffect(() => {
    streamNameRef.current = streamName;
  }, [streamName]);

  useEffect(() => {
    socket.current?.emit("change-room-privacy", { isPrivate: isRoomPrivate });
  }, [isRoomPrivate]);

  // const hangupAndInitiateNewCall = useCallback(async (stream: MediaStream) => {
  //     if (vertoSession.current?.hasSecondaryCall()) {
  //       // Hang up the current secondary call
  //       vertoSession.current.secondaryVertoCall?.hangup();

  //     // Wait for the hangup to complete
  //     await new Promise(resolve => setTimeout(resolve, 1000));


  //     broadcast.current = videoTrack !== null ?
  //     new MediaStream([audioTrack!, videoTrack]) :
  //     new MediaStream([audioTrack!]);

  //     // Initiating a new secondary call
  //     // const userStream = await getUserMedia(); // Replace with your logic to get the new stream
  //     // const broadcast = createBroadcastStream(userStream);

  //     vertoSession.current?.initSecondaryCall({
  //       stream,
  //       channelName: streamNameRef.current,
  //       receiveStream: false,
  //       incomingBandwidth: 0,
  //       outgoingBandwidth: 1300,
  //       destinationNumber: `${streamVlr.roomId}_stream_720`,
  //       connectionType: "shared_stream_channel",
  //     });

  //     dispatch(setStreamDebugReplaceSentStream(stream));
  //     dispatch(streamLoadingDone());

  //   }

  // }, [dispatch, streamVlr, audioTrack, videoTrack, reactPlayerVideoElement])

  // useEffect(() => {
  //   // ... (existing useEffect dependencies)

  //   // Update the useEffect for changing the streamUrl
  //   useEffect(() => {
  //     streamConnectionAttempts.current = 1;
  //     reactPlayerVideoElement.current = null;

  //     // Hang up the current secondary call and initiate a new one
  //     hangupAndInitiateNewCall();
  //   }, [streamUrl]);

  useEffect(() => {
    if (streamReady && primaryCallEstablished) {
      const connectToSecondaryCall = async () => {
        if (!reactPlayerVideoElement.current) {
          throw new Error("No react player video stream ref");
        }

        let capturedStream: MediaStream;
        if (reactPlayerVideoElement.current.captureStream) {
          capturedStream = reactPlayerVideoElement.current.captureStream();
        } else if (reactPlayerVideoElement.current.mozCaptureStream) {
          capturedStream = reactPlayerVideoElement.current.mozCaptureStream();
        } else {
          throw new Error("Capture stream is not supported");
        }


        let audioTrack: MediaStreamTrack | null = null;
        if (capturedStream.getAudioTracks().length) {
          audioTrack = capturedStream.getAudioTracks()[0];

          // setAudioTrack(audioTrack)
        }

        let videoTrack: MediaStreamTrack | null = null;
        if (capturedStream.getVideoTracks().length) {
          videoTrack = capturedStream.getVideoTracks()[0];
          // update stream video settings here
          setVideoTrack(videoTrack);
        } else if (noVideoTrack) {
          videoTrack = noVideoTrack;
        }

        const replaceSecondaryStream = async (stream: MediaStream) => {
          if (vertoSession.current?.hasSecondaryCall()) {
            // update stream video settings here on existing secondary call

            // vertoSession.current?.hangup()
            // await hangupAndInitiateNewCall(stream)

            vertoSession.current.secondaryVertoCall?.hangup();
            // broadcast.current = undefined

            // if (vertoSession.current?.hasSecondaryCall()) {
            // Hang up the current secondary call
            // Wait for the hangup to complete
            // await new Promise(resolve => setTimeout(resolve, 3000));


            // broadcast.current = videoTrack !== null ?
            // new MediaStream([audioTrack!, videoTrack]) :
            // new MediaStream([audioTrack!]);

            // Initiating a new secondary call
            // const userStream = await getUserMedia(); // Replace with your logic to get the new stream
            // const broadcast = createBroadcastStream(userStream);

            vertoSession.current?.initSecondaryCall({
              stream,
              channelName: streamNameRef.current,
              receiveStream: false,
              incomingBandwidth: 0,
              outgoingBandwidth: 1300,
              destinationNumber: `${streamVlr.roomId}_stream_720`,
              connectionType: "shared_stream_channel",
            });

            dispatch(setStreamDebugReplaceSentStream(stream));
            dispatch(streamLoadingDone());

            // }

            // vertoSession.current?.replaceSecondaryTracks(stream);
          } else {
            // update stream video settings here for first secondary call

            vertoSession.current?.initSecondaryCall({
              stream,
              channelName: streamNameRef.current,
              receiveStream: false,
              incomingBandwidth: 0,
              outgoingBandwidth: 1300,
              destinationNumber: `${streamVlr.roomId}_stream_720`,
              connectionType: "shared_stream_channel",
            });
          }
          dispatch(setStreamDebugReplaceSentStream(stream));
          dispatch(streamLoadingDone());
        };

        if (firstStreamPlay.current) {
          const audioContext = new AudioContext();
          const audioDestination = audioContext.createMediaStreamDestination();
          const audioSource = audioContext.createMediaElementSource(
            reactPlayerVideoElement.current
          );
          audioSource.connect(audioDestination);
          streamAudioTrack.current = audioDestination.stream.getAudioTracks()
            .length
            ? audioDestination.stream.getAudioTracks()[0]
            : fakeAudioTrack.current.getTrack();
        }

        if (firstStreamPlay.current) {
          broadcast.current =
            videoTrack !== null
              ? new MediaStream([streamAudioTrack.current!, videoTrack])
              : new MediaStream([streamAudioTrack.current!]);
          dispatch(setStreamDebugSentStream(broadcast.current));
          vertoSession.current?.initSecondaryCall({
            stream: broadcast.current,
            channelName: streamNameRef.current,
            receiveStream: false,
            incomingBandwidth: 0,
            outgoingBandwidth: 1300,
            destinationNumber: `${streamVlr.roomId}_stream_720`,
            connectionType: `shared_stream_channel`,
          });
          firstStreamPlay.current = false;
        } else {
          broadcast.current =
            videoTrack !== null
              ? new MediaStream([audioTrack!, videoTrack])
              : new MediaStream([audioTrack!]);
          replaceSecondaryStream(broadcast.current);
        }
      };

      connectToSecondaryCall().catch((err) => {
        console.error(err);
        dispatch(
          setErrorToast("sharedStream.unexpectedErrorWhileConnectingToStream")
        );
        vertoSession.current?.hangup();
      });
    }
  }, [
    streamReady,
    primaryCallEstablished,
    dispatch,
    noVideoTrack,
    streamVlr.roomId,
  ]);

  useEffect(() => {
    streamConnectionAttempts.current = 1;
    reactPlayerVideoElement.current = null;
  }, [streamUrl]);

  useEffect(() => {
    onParticipants(participants);
  }, [participants, onParticipants]);

  useEffect(() => {
    imHost &&
      setMuteReactPlayer(
        loading || !micMuted || !!participants.find((p) => !p.audio.muted)
      );
  }, [imHost, loading, micMuted, participants]);

  useEffect(() => {
    !loading && onDismissLoading();
  }, [loading, onDismissLoading]);

  useEffect(() => { 
    if (vertoSession.current) {
      return;
    }

    dispatch(resetStreamDebugValues());

    let canLeave = true;

    const redirect = () => {
      onCanLeave(true);
    };

    const connect = async () => {
      const roomId = streamVlr.roomId;
      const moderatorUsername = streamVlr.moderator.username;
      const moderatorPassword = streamVlr.moderator.password;
      const fsUrl = streamVlr.fsUrl;

      onProgress(0.3);
      let userStream;
      try {
        userStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        if (noVideoTrack) {
          userStream = new MediaStream([
            userStream.getAudioTracks()[0],
            noVideoTrack,
          ]);
        }
      } catch (error) {
        const tracks = [getFakeAudioMediaStreamTrack()];
        noVideoTrack && tracks.push(noVideoTrack);
        userStream = new MediaStream(tracks);
      }
      onUserMedia(userStream);

      let realNumber = roomId;
      let streamNumber = `${roomId}_stream`;

      const isHostSharedVideo = true;
      const vs = new VertoSession({
        realNumber,
        userId: userId ?? undefined,
        streamNumber,
        callerName: caller,
        localStream: userStream,
        moderatorUsername:
          imHost && streamVlr.isMyRoom ? moderatorUsername : undefined,
        moderatorPassword:
          imHost && streamVlr.isMyRoom ? moderatorPassword : undefined,
        fsUrl,
        isHost: imHost,
        notifyOnStateChange: imHost,
        connectionType: "shared_stream_camera",
        incomingBandwidth: kMcuIncomingBandwidth,
        outgoingBandwidth: 500,
        destinationNumber: imHost
          ? `${streamVlr.roomId}_720_with_stream`
          : `${streamVlr.roomId}_720`,
      });

      vertoSession.current = vs;
      onVertoSession(vs);
      dispatch(setStreamDebugVertoSession(vs));

      const initSocket = () => {
        if (!socket.current) {
          socket.current = initRoomSocket({
            userId: profile.id,
            callId: vs.primaryCallId as string,
            vlrId: streamVlr.vlrId,
            nickname: profile.nickname || "User",
            isSharedStream: true,
            isHost: imHost,
          });
        }
      };

      vs.notification.onPrimaryCallRTCStateChange.subscribe(() => {
        if (imHost) {
          setPrimaryCallEstablished(true);
          // if(vertoSession.current?.primaryVertoCall) {
          //   vs.notification.
          // }
          initSocket();
        }
        // else {
        // }
        broadcast.current &&
          vs.initSecondaryCall({
            stream: broadcast.current,
            channelName: streamNameRef.current,
            receiveStream: false,
            incomingBandwidth: 0,
            outgoingBandwidth: 1300,
            destinationNumber: `${streamVlr.roomId}_stream_720`,
            connectionType: `shared_stream_channel`,
          });
      });

      vs.notification.onSecondaryCallRTCStateChange.subscribe(() => {
        // onProgress(0.9);
        initSocket();
      });

      vs.notification.onPrimaryCallRemoteStream.subscribe(
        (remoteVideoStream: MediaStream) => {
          if (!roomRef?.current) {
            return;
          }

          // onProgress(0.9)
          if (!roomRef.current.srcObject && !imHost) {
            setLoading(false);
          }

          if (setLoading2 && setShowProgressbar && setShowInviteProgressbar) {
            setLoading2(false);
            setShowProgressbar(false);
            setShowInviteProgressbar(false);
            // onProgress(1);
          }

          dispatch(setStreamDebugReceivedStream(remoteVideoStream));
          roomRef.current.srcObject = remoteVideoStream;
        }
      );

      vs.notification.onBootstrappedParticipants.subscribe(
        (bootParticipants: Participant[]) => {
          setParticipants(bootParticipants);

          const me = bootParticipants.find((p) => p.me);
          if (me) {
            !me.audio.muted && vs.togglePrimaryMic();
            !me.video.muted && vs.togglePrimaryCam();
          }

          if (imHost) {
            if (!establishFirstSession.current && !vs.previousPrimaryId) {
              bootParticipants
                .filter((p) => !p.me)
                .forEach((p) => {
                  vs.removeParticipant(p.participantId);
                  vs.sendMessage.youHaveBeenRemoved(p.callId);
                });
            }
          } else if (vs.previousPrimaryId) {
            vs.notification.onConnectedToRoom.notify(null);
          }

          establishFirstSession.current = true;
        }
      );

      vs.notification.onModifiedParticipant.subscribe(
        (participant: Participant) => {
          if (!participant.isHostSharedVideo) {
            setParticipants((prevState) =>
              prevState.map((p) =>
                p.callId === participant.callId ? participant : p
              )
            );
          }
        }
      );

      vs.notification.onAddedParticipant.subscribe(
        (participant: Participant) => {
          if (participant.isHostSharedVideo) {
            vs.giveParticipantFloor(participant.participantId);
            vs.changeLayout();
            participant.audio.muted && vs.toggleSecondaryMic();
            participant.video.muted && vs.toggleSecondaryCam();
            setLoading(false);
            vs.notification.onConnectedToRoom.notify(null);
          } else {
            setParticipants((prevState) => [...prevState, participant]);
          }

          if (!participant.hasSocket && !participant.me) {
            socket.current?.emit(ADD_PARTICIPANT, {
              callId: participant.callId,
              nickname: participant.participantName,
            });
          }
        }
      );

      vs.notification.onRemovedParticipant.subscribe(
        (participant: Participant) => {
          setParticipants((prevState) =>
            prevState.filter((p) => p.callId !== participant.callId)
          );
          if (!participant.hasSocket && !participant.me) {
            socket.current?.emit(REMOVE_PARTICIPANT, {
              callId: participant.callId,
            });
          }
        }
      );

      vs.notification.onChatMessageSwitchHostStream.subscribe(
        ({ username, password, callId }: SwitchHost) => {
          canLeave = false;
          vs.hangup();
          vs.notification.removeAllSubscribers();
          vertoSession.current = null;
          if (roomRef.current) {
            roomRef.current.srcObject = null;
          }
          onUpdateStreamVlr({
            username: moderatorUsername || username,
            password: moderatorPassword || password,
            updateMetadata: false,
          });
          onImHost(true);
          dispatch(setInfoToast("sharedStream.youAreHost"));
          let channelName = `${streamNameRef.current} ${t(
            "sharedStream.by"
          )} ${caller}`;
          if (!streamVlr.isMyRoom) {
            channelName = `${streamNameRef.current} ${t("sharedStream.by")} ${
              streamVlr.hostName
                ? `${streamVlr.hostName} ${t("sharedStream.nowMediatedBy")} `
                : ""
            }${caller}`;
          }
          VlrService.patchMetadata({
            channelName,
            publicId: streamVlr.publicId,
            newHostCallId: callId,
          }).then();
        }
      );

      vs.notification.onChatMessageSwitchHostCamera.subscribe(() => {
        onStreamCamera();
      });

      vs.notification.onChatMessageChangeParticipantState.subscribe(
        ({ participantId, isActive }) => {
          setParticipants((prevState) => {
            const participant = prevState.find(
              (p) => p.participantId === participantId
            );
            if (participant) {
              participant.isActive = isActive;
              return prevState.map((p) => Object.assign({}, p));
            }

            return prevState;
          });
        }
      );

      vs.notification.onLayoutChange.subscribe((layout) =>
        dispatch(setRoomLayout(layout))
      );

      const manageFail = (message: string) => {
        dispatch(setErrorToast(message));
        redirect();
      };

      vs.notification.onFSLoggedError.subscribe(() => {
        manageFail("fs.cannotAuthenticate");
      });

      vs.notification.onEarlyCallError.subscribe(() => {
        manageFail("notifications.earlyCallError");
      });

      vs.notification.onPrimaryCallDestroy.subscribe(() => {
        canLeave && redirect();
      });

      vs.notification.onRoomClosed.subscribe(() => {
        socket.current?.emit("close-room");
        dispatch(setInfoToast("sharedStream.roomClosed"));
        redirect();
      });

      vs.notification.onHostChangeStream.subscribe((hostName) => {
        dispatch(
          setInfoToast(
            `${t("sharedStream.roomHostChange")} ${hostName}`,
            ToastTextFormat.Text
          )
        );
      });

      vs.notification.onYouHaveBeenRemoved.subscribe(() => {
        dispatch(setInfoToast("sharedStream.youHaveBeenRemoved"));
        vs.hangup();
      });

      vs.notification.onYoursSharingHaveBeenRemoved.subscribe(() => {
        dispatch(setInfoToast("sharedStream.yoursSharingHaveBeenRemoved"));
        onRemoveStream && onRemoveStream();
        vs.removeSecondaryCall();
      });
    };

    connect().catch((err) => {
      console.error(err);
      dispatch(setErrorToast("sharedStream.givePermission"));
      redirect();
    });
  }, [
    dispatch,
    onVertoSession,
    onProgress,
    onCanLeave,
    imHost,
    streamVlr.moderator.username,
    streamVlr.moderator.password,
    streamVlr.roomId,
    streamVlr.publicId,
    streamVlr.fsUrl,
    streamVlr.vlrId,
    streamVlr.hostName,
    streamVlr.isMyRoom,
    onUserMedia,
    caller,
    noVideoTrack,
    roomRef,
    timeLoading,
    onUpdateStreamVlr,
    onImHost,
    onStreamCamera,
    onRemoveStream,
    profile.id,
    profile.nickname,
    t,
    setLoading2,
    setShowInviteProgressbar,
    setShowProgressbar,
    // fsResolution
  ]);

  return (
    <>
      {imHost && streamUrl && (
        <ReactPlayer
          key={playerKey}
          url={streamUrl}
          config={{
            file: {
              attributes: {
                crossOrigin: "true",
              },
            },
          }}
          onReady={handlePlayerStreamReady}
          onError={handlePlayerStreamError}
          onPause={() => reactPlayerVideoElement.current?.play()}
          muted={muteReactPlayer}
          style={{ display: "none" }}
          volume={volume}
        />
      )}
    </>
  );
};

export default EstablishVertoSession;
