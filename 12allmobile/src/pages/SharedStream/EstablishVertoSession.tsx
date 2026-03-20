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
import { Participant, SwitchHost } from "../../verto/models";
import {
  DEFAULT_CANVAS_FPS,
  StreamVlr,
  UpdateStreamVlr,
  VlrModerator,
} from "./index";
import { StreamService, VlrService } from "../../services";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import { isPlatform } from "@ionic/react";
import { ReduxSelectors } from "../../redux/types";
import {
  streamLoadingDone,
  streamReconnecting,
} from "../../redux/actions/streamActions";
import useApplyVideoTrackConstrains from "../../hooks/useApplyVideoTrackConstrains";
import useNetworkUpSpeed from "../../hooks/useNetworkUpSpeed";
import { setRoomLayout } from "../../redux/actions/roomLayoutActions";
import appStorage from "../../shared/appStorage";
import { VertoLayout } from "../../verto/types";
import { ROOM_LAYOUT } from "../../components/RoomChangeLayout";
import Hls from "hls.js";
import { FakeAudioTrack } from "../../models/FakeAudioTrack";
import getMediaStreamPermission from "../../shared/methods/getMediaStreamPermission";
import { HtmlCanvasStreamEl, HTMLVideoStreamElement } from "../../shared/types";
import setUserMedia from "../../redux/actions/userMediaActions";
import { useTranslation } from "react-i18next";
import {
  resetStreamDebugValues,
  setStreamDebugHlsError,
  setStreamDebugReceivedStream,
  setStreamDebugReplaceSentStream,
  setStreamDebugSentStream,
  setStreamDebugVertoSession,
  setStreamDebugVideoElement,
} from "../../redux/actions/streamDebugActions";
import { Socket } from "socket.io-client";
import { initRoomSocket } from "../../shared/methods/initRoomSocket";
import {
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
} from "../../hooks/useRoomsSocket";

const PLAYER_PROGRESS_INTERVAL = 2500;
const STREAM_NO_PROGRESS_TIMEOUT = PLAYER_PROGRESS_INTERVAL + 500;

type Props = {
  isRoomPrivate: boolean;
  imHost: boolean;
  hostShareCamera: boolean;
  caller: string;
  streamName: string;
  streamUrl: string | null;
  streamVlr: StreamVlr;
  roomRef: MutableRefObject<HTMLVideoStreamElement | null>;
  noVideoTrack: MediaStreamTrack;
  onVertoSession: (session: VertoSession) => void;
  onImHost: (value: boolean) => void;
  onParticipants: (participants: Participant[]) => void;
  onRoomExit: () => void;
  onDismissLoading: (reconnecting: boolean) => void;
  onUpdateStreamVlr: (data: UpdateStreamVlr) => void;
  onRedirect: () => void;
  onSwitchHost: (moderator: VlrModerator) => void;
  onRemoveStream: () => void;
};

const EstablishVertoSession: FC<Props> = ({
  isRoomPrivate,
  imHost,
  hostShareCamera,
  caller,
  streamName,
  streamUrl,
  streamVlr,
  roomRef,
  noVideoTrack,
  onVertoSession,
  onImHost,
  onParticipants,
  onRoomExit,
  onDismissLoading,
  onUpdateStreamVlr,
  onRedirect,
  onSwitchHost,
  onRemoveStream,
}: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    androidWebViewToUseCaptureStream,
    streamMaxReconnectAttempts,
    streamReconnectInterval,
    streamPlayTimeout,
    userCameraMaxWidth,
  } = useSelector(({ appConfig }: ReduxSelectors) => appConfig);
  const { webViewVersion } = useSelector(
    ({ deviceInfo }: ReduxSelectors) => deviceInfo
  );
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const streamCanvasRef = useRef<HtmlCanvasStreamEl>(null);
  const reactPlayerVideoElement = useRef<HTMLVideoStreamElement | null>(null);
  const vertoSession = useRef<VertoSession | null>(null);
  const establishFirstSession = useRef<boolean>(false);
  const firstStreamPlay = useRef<boolean>(true);
  const streamConnectionAttemptsTimeout = useRef<NodeJS.Timeout>();
  const playerPlayTimeout = useRef<NodeJS.Timeout>();
  const streamConnectionAttempts = useRef<number>(1);
  const connectingTimeout = useRef<NodeJS.Timeout>();
  const playerStreamWidthConstrain = useRef<number>(0);
  const drawCanvasFrames = useRef<boolean>(false);
  const mediaStream = useRef<MediaStream>();
  const fakeAudioTrack = useRef<FakeAudioTrack>(new FakeAudioTrack());
  const meRef = useRef<Participant>();
  const streamNameRef = useRef<string>("");
  const streamAudioTrack = useRef<MediaStreamTrack>();
  const noStreamProgressTimeout = useRef<NodeJS.Timeout>();
  const socket = useRef<Socket>();

  const [exitingRoom, setExitingRoom] = useState<boolean>(false);
  const [playerKey, setPlayerKey] = useState<number>(1);
  const [muteReactPlayer, setMuteReactPlayer] = useState<boolean>(true);
  const [playerVolume, setPlayerVolume] = useState<number>(0.1);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [streamReady, setStreamReady] = useState<boolean>(false);
  const [primaryCallEstablished, setPrimaryCallEstablished] =
    useState<boolean>(false);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);

  const streamWidth = useNetworkUpSpeed(
    imHost && !hostShareCamera,
    streamVlr.upSpeedUrl
  );
  useApplyVideoTrackConstrains(streamWidth, videoTrack);

  const handlePlayerStreamReady = useCallback(
    (player: ReactPlayer) => {
      dispatch(streamReconnecting(false));
      setStreamReady(false);

      playerPlayTimeout.current && clearTimeout(playerPlayTimeout.current);
      playerPlayTimeout.current = setTimeout(() => {
        dispatch(setErrorToast("sharedStream.temporaryUnavailable"));
        const participantsLeft = participants.filter(
          (p) => p.isActive && !p.me && !p.isHostSharedVideo
        );
        console.log("participantsLeft.length:", participantsLeft.length);
        if (participantsLeft.length === 0) {
          vertoSession.current?.cleanupWebRTC();
        }
        vertoSession.current?.hangup();
      }, streamPlayTimeout * 1000);

      let mediaError = 0;
      let mediaErrorTimeout: NodeJS.Timeout;
      const hls = player.getInternalPlayer("hls") as Hls | undefined;
      if (hls) {
        hls.on(Hls.Events.ERROR, (event, data) => {
          const errorMessage = `HLS ERROR ${data.type} ${data.details}${data.fatal ? " (fatal)" : ""}`;
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

      reactPlayerVideoElement.current =
        player.getInternalPlayer() as HTMLVideoElement;
      dispatch(setStreamDebugVideoElement(reactPlayerVideoElement.current));
      reactPlayerVideoElement.current
        .play()
        .then(() => {
          playerPlayTimeout.current && clearTimeout(playerPlayTimeout.current);
          streamConnectionAttempts.current = 1;
          mediaStream.current =
            reactPlayerVideoElement.current?.captureStream &&
            reactPlayerVideoElement.current?.captureStream();
          if (mediaStream.current?.getTracks().length) {
            setStreamReady(true);
          } else {
            console.log("STREAM PLAY - NO TRACKS");
            reactPlayerVideoElement.current = null;
            setPlayerKey((prevState) => prevState + 1);
          }
        })
        .catch((err) => {
          console.error("STREAM PLAY ERROR", err);
        });
    },
    [dispatch, streamPlayTimeout]
  );

  const handlePlayerStreamError = (err: any) => {
    if (exitingRoom || err.isTrusted || reactPlayerVideoElement.current) {
      err !== "hlsError" &&
        console.error(
          "12ALL_LOG handlePlayerStreamError",
          err?.message || JSON.stringify(err)
        );
      return;
    }

    if (streamConnectionAttempts.current === streamMaxReconnectAttempts) {
      dispatch(setErrorToast("sharedStream.temporaryUnavailable"));
      dispatch(streamLoadingDone());
      dispatch(streamReconnecting(false));

      if (firstStreamPlay.current) {
        const participantsLeft = participants.filter(
          (p) => p.isActive && !p.me && !p.isHostSharedVideo
        );
        console.log(
          "participantsLeft.length Player Stream Error:",
          participantsLeft.length
        );
        if (participantsLeft.length === 0) {
          vertoSession.current?.cleanupWebRTC();
        }

        vertoSession.current?.hangup();
      }
    } else {
      dispatch(streamReconnecting(true));
      streamConnectionAttempts.current++;
      console.log("12ALL_LOG - RECONNECT");
      streamConnectionAttemptsTimeout.current = setTimeout(() => {
        setPlayerKey((prevState) => prevState + 1);
      }, streamReconnectInterval * 1000);
    }
  };

  const handlePlayerPause = () => {
    // We need the stream to keep play. When interstitial is a video, the stream pauses automatically
    reactPlayerVideoElement.current?.play();
  };

  useEffect(() => {
    const connectingTimeoutRef = connectingTimeout.current;
    const fakeAudioTrackRef = fakeAudioTrack.current;

    return () => {
      streamConnectionAttemptsTimeout.current &&
        clearTimeout(streamConnectionAttemptsTimeout.current);
      noStreamProgressTimeout.current &&
        clearTimeout(noStreamProgressTimeout.current);
      connectingTimeoutRef && clearTimeout(connectingTimeoutRef);
      playerPlayTimeout.current && clearTimeout(playerPlayTimeout.current);
      fakeAudioTrackRef.stopTrack();
      socket.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.current?.emit("change-room-privacy", { isPrivate: isRoomPrivate });
  }, [isRoomPrivate]);

  useEffect(() => {
    streamNameRef.current = streamName;
  }, [streamName]);

  useEffect(() => {
    if (streamReady && primaryCallEstablished) {
      const connectToSecondaryCall = async () => {
        if (!streamCanvasRef.current) {
          throw new Error("No canvas ref");
        }

        if (!reactPlayerVideoElement.current) {
          throw new Error("No react player ref");
        }

        streamCanvasRef.current.width =
          reactPlayerVideoElement.current.videoWidth;
        streamCanvasRef.current.height =
          reactPlayerVideoElement.current.videoHeight;

        const {
          data: { width },
        } = await StreamService.getStreamConstrains();
        playerStreamWidthConstrain.current = width;
        setPlayerVolume(1);

        let capturedStream: MediaStream;
        if (streamCanvasRef.current.captureStream) {
          capturedStream = streamCanvasRef.current.captureStream();
        } else if (streamCanvasRef.current.mozCaptureStream) {
          capturedStream = streamCanvasRef.current.mozCaptureStream();
        } else {
          throw new Error("Capture stream is not supported");
        }

        let audioTrack: MediaStreamTrack | null = null;
        if (capturedStream.getAudioTracks().length) {
          audioTrack = capturedStream.getAudioTracks()[0];

          console.log("audioTrack", capturedStream.getAudioTracks());
          // setAudioTrack(audioTrack)
        }

        const getCanvasVideoTrack = (canvas: HTMLCanvasElement) => {
          drawCanvasFrames.current = true;
          const canvasStream = canvas.captureStream(DEFAULT_CANVAS_FPS);
          return canvasStream.getVideoTracks()[0];
        };

        let videoStreamTrack: MediaStreamTrack;
        if (
          mediaStream.current &&
          webViewVersion >= androidWebViewToUseCaptureStream
        ) {
          if (mediaStream.current.getVideoTracks().length) {
            videoStreamTrack = mediaStream.current.getVideoTracks()[0];
            setVideoTrack(videoStreamTrack);
          } else {
            videoStreamTrack = getCanvasVideoTrack(streamCanvasRef.current);
          }
        } else {
          videoStreamTrack = getCanvasVideoTrack(streamCanvasRef.current);
        }

        setVideoTrack(videoStreamTrack);

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

            console.log("streamAudioTrack.current", streamAudioTrack.current);
            console.log("videoTrack", videoTrack);

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
          const playerStream = new MediaStream([
            streamAudioTrack.current,
            videoStreamTrack,
          ]);
          dispatch(setStreamDebugSentStream(playerStream));
          vertoSession.current?.initSecondaryCall({
            stream: playerStream,
            channelName: streamNameRef.current,
            receiveStream: false,
            incomingBandwidth: 0,
            outgoingBandwidth: 1300,
            destinationNumber: `${streamVlr.roomId}_stream_720`,
            connectionType: "shared_stream_channel",
          });
          firstStreamPlay.current = false;
        } else {
          // mediaStream.current = videoTrack !== null ?
          //   new MediaStream([audioTrack!, videoTrack]) :
          //   new MediaStream([audioTrack!]);
          // replaceSecondaryStream(mediaStream.current);

          let stream: MediaStream;
          if (vertoSession.current?.hasSecondaryCall()) {
            stream = new MediaStream([videoStreamTrack]);
            vertoSession.current?.replaceSecondaryTracks(stream);
          } else {
            stream = new MediaStream([
              streamAudioTrack.current!,
              videoStreamTrack,
            ]);
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
        }

        // try {
        //
        // } catch (e: any) {
        //   console.error('12ALL_LOG - SECONDARY CALL ERROR', e);
        //
        //   const getCanvasVideoTrack = (canvas: HTMLCanvasElement) => {
        //     drawCanvasFrames.current = true;
        //     const canvasStream = canvas.captureStream(DEFAULT_CANVAS_FPS);
        //     setVideoTrack(canvasStream.getVideoTracks()[0]);
        //     return canvasStream;
        //   };
        //
        //   let mediaStreamVideo: MediaStream;
        //   if (mediaStream.current && webViewVersion >= androidWebViewToUseCaptureStream) {
        //     if (mediaStream.current?.getVideoTracks().length) {
        //       mediaStreamVideo = new MediaStream(mediaStream.current?.getVideoTracks());
        //     } else {
        //       mediaStreamVideo = getCanvasVideoTrack(streamCanvasRef.current);
        //     }
        //   } else {
        //     mediaStreamVideo = getCanvasVideoTrack(streamCanvasRef.current);
        //   }
        //
        //   vertoSession.current?.replaceSecondaryTracks(mediaStreamVideo);
        //   dispatch(streamLoadingDone());
        // }
      };

      connectToSecondaryCall().catch((err) => {
        console.error("12ALL_LOG connectToSecondaryCall", err);
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
    webViewVersion,
    androidWebViewToUseCaptureStream,
    streamVlr.roomId,
    videoTrack,
  ]);

  useEffect(() => {
    streamConnectionAttempts.current = 1;
    reactPlayerVideoElement.current = null;
    setPlayerVolume(0.1);
  }, [streamUrl]);

  useEffect(() => {
    onParticipants(participants);
  }, [participants, onParticipants]);

  useEffect(() => {
    dispatch(resetStreamDebugValues());

    let canLeave = true;
    let reconnecting = false;
    let drawVideoOnCanvasInterval: NodeJS.Timeout | null = null;

    const redirect = () => {
      drawVideoOnCanvasInterval && clearInterval(drawVideoOnCanvasInterval);
      onRedirect();
    };

    const manageConnectCatch = (err: any) => {
      console.error("12ALL_LOG manageConnectCatch", err);
      redirect();
    };

    let userMedia: MediaStream;

    const connect = async () => {
      const roomId = streamVlr.roomId;
      const moderatorUsername = streamVlr.moderator.username;
      const moderatorPassword = streamVlr.moderator.password;
      const fsUrl = streamVlr.fsUrl;
      let reconnect = false;
      const storedLayout = (await appStorage.getItem(
        ROOM_LAYOUT
      )) as VertoLayout | null;

      if (!userMedia) {
        let audioTrack: MediaStreamTrack;
        if (hostShareCamera) {
          try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: false,
            });
            if (!mediaStream.getAudioTracks().length) {
              dispatch(setErrorToast("sharedStream.micProblem"));
              redirect();
              return;
            }

            audioTrack = mediaStream.getAudioTracks()[0];
            dispatch(setUserMedia({ audioTrack }));
          } catch (e) {
            dispatch(setErrorToast("sharedStream.givePermission"));
            redirect();
            return;
          }
        } else {
          audioTrack = fakeAudioTrack.current.getTrack();
        }

        const mediaStream = await getMediaStreamPermission(
          audioTrack,
          noVideoTrack
        );
        if (!mediaStream) {
          dispatch(setErrorToast("sharedStream.givePermission"));
          redirect();
          return;
        }
        userMedia = mediaStream;
      }

      let streamNumber = `${roomId}_stream`;

      const vs = new VertoSession({
        realNumber: roomId,
        streamNumber,
        callerName: caller,
        localStream: userMedia,
        moderatorUsername:
          imHost && streamVlr.isMyRoom ? moderatorUsername : undefined,
        moderatorPassword:
          imHost && streamVlr.isMyRoom ? moderatorPassword : undefined,
        fsUrl,
        isHost: imHost,
        notifyOnStateChange: imHost,
        connectionType: "shared_stream_camera",
        incomingBandwidth: 1500,
        outgoingBandwidth: 500,
        destinationNumber: `${streamVlr.roomId}_720`,
      });

      vertoSession.current = vs;
      onVertoSession(vs);
      dispatch(setStreamDebugVertoSession(vs));

      const initSocket = () => {
        if (!socket.current || !socket.current.connected) {
          socket.current = initRoomSocket({
            userId: profile.id,
            callId: vs.primaryCallId as string,
            vlrId: streamVlr.vlrId,
            nickname: profile.nickname,
            isSharedStream: true,
            isHost: imHost,
          });
        }
      };

      vs.notification.onPrimaryCallRTCStateChange.subscribe(() => {
        if (imHost) {
          initSocket();
        }

        if (imHost && !hostShareCamera) {
          setPrimaryCallEstablished(true);
          return;
        }

        if (hostShareCamera) {
          vs.togglePrimaryCam();
        }

        onDismissLoading(reconnecting);
        reconnecting = false;
      });

      vs.notification.onSecondaryCallRTCStateChange.subscribe(() => {
        initSocket();

        if (!drawCanvasFrames.current) {
          return;
        }

        const drawFrameOnStreamCanvas = () => {
          let canvasContext: CanvasRenderingContext2D | null;

          const draw = () => {
            if (
              !canvasContext ||
              !streamCanvasRef.current ||
              !reactPlayerVideoElement.current
            ) {
              return;
            }

            const videoWidth = (streamCanvasRef.current.width =
              reactPlayerVideoElement.current.videoWidth);
            const videoHeight = (streamCanvasRef.current.height =
              reactPlayerVideoElement.current.videoHeight);

            canvasContext.drawImage(
              reactPlayerVideoElement.current,
              0,
              0,
              videoWidth,
              videoHeight
            );
          };

          if (!streamCanvasRef.current) {
            throw new Error("No canvas ref");
          }

          canvasContext = streamCanvasRef.current.getContext("2d");
          drawVideoOnCanvasInterval = setInterval(
            () => requestAnimationFrame(draw),
            1000 / DEFAULT_CANVAS_FPS
          );
        };

        drawFrameOnStreamCanvas();
      });

      vs.notification.onPrimaryCallRemoteStream.subscribe(
        (remoteMediaStream: MediaStream) => {
          if (!roomRef?.current) {
            return;
          }

          console.log("roomRef.current.srcObject", roomRef.current.srcObject);
          console.log("remotestream", remoteMediaStream);

          dispatch(setStreamDebugReceivedStream(remoteMediaStream));
          roomRef.current.srcObject = remoteMediaStream;
          onDismissLoading(true);
        }
      );

      vs.notification.onBootstrappedParticipants.subscribe(
        (bootParticipants: Participant[]) => {
          setParticipants(bootParticipants);

          const me = bootParticipants.find((p) => p.me);
          if (me) {
            meRef.current = me;
            !me.audio.muted && vs.togglePrimaryMic();

            if (hostShareCamera && imHost) {
              vs.giveParticipantFloor(me.participantId);
              vs.changeLayout(storedLayout);
              me.video.muted && vs.togglePrimaryCam();
            } else {
              !me.video.muted && vs.togglePrimaryCam();
            }
          }

          if (imHost && !establishFirstSession.current) {
            bootParticipants
              .filter((p) => !p.me)
              .forEach((p) => {
                vs.removeParticipant(p.participantId);
                vs.sendMessage.youHaveBeenRemoved(p.callId);
              });
          }

          establishFirstSession.current = true;
        }
      );

      vs.notification.onModifiedParticipant.subscribe(
        (participant: Participant) => {
          if (!participant.isHostSharedVideo) {
            let newParticipantsState: Participant[] = [];
            setParticipants((prevState) => {
              newParticipantsState = prevState.map((p) =>
                p.callId === participant.callId ? participant : p
              );
              return newParticipantsState;
            });

            imHost &&
              reactPlayerVideoElement.current &&
              setMuteReactPlayer(
                !!newParticipantsState.find((p) => !p.audio.muted)
              );
          }
        }
      );

      vs.notification.onAddedParticipant.subscribe(
        (participant: Participant) => {
          if (participant.isHostSharedVideo) {
            if (vs.imSharingVideo) {
              vs.giveParticipantFloor(participant.participantId);
              vs.changeLayout(storedLayout);
              participant.audio.muted && vs.toggleSecondaryMic();
              participant.video.muted && vs.toggleSecondaryCam();
              onDismissLoading(reconnecting);
              setMuteReactPlayer(false);
              reconnecting = false;
            }
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
          let newParticipantsState: Participant[] = [];

          setParticipants((prevState) => {
            newParticipantsState = prevState.filter(
              (p) => p.callId !== participant.callId
            );
            return newParticipantsState;
          });

          imHost &&
            setMuteReactPlayer(
              !!newParticipantsState.find((p) => !p.audio.muted)
            );

          if (!participant.hasSocket && !participant.me) {
            socket.current?.emit(REMOVE_PARTICIPANT, {
              callId: participant.callId,
            });
          }
        }
      );

      vs.notification.onLayoutChange.subscribe((layout) => {
        dispatch(setRoomLayout(layout));
      });

      vs.notification.onChatMessageSwitchHostStream.subscribe(
        ({ username, password, callId }: SwitchHost) => {
          if (isPlatform("ios") && !hostShareCamera) {
            // Wait until host leave
            setTimeout(() => onSwitchHost({ username, password }), 1000);
            return;
          }

          canLeave = false;
          vs.hangup();
          vs.notification.removeAllSubscribers();
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

          let host = caller;
          let channelName = `${streamNameRef.current} ${t("sharedStream.by")} ${caller}`;

          if (!streamVlr.isMyRoom) {
            host = `${streamVlr.hostName ? `${streamVlr.hostName} ` : ""}${t("sharedStream.nowMediatedBy")} ${caller}`;
            channelName = `${streamNameRef.current} ${streamVlr.hostName ? `${t("sharedStream.by")} ` : ""}${host}`;
          }

          if (hostShareCamera) {
            channelName = `${t("sharedStream.myCameraBy")} ${host}`;
          }

          VlrService.patchMetadata({
            channelName,
            publicId: streamVlr.publicId,
            newHostCallId: callId,
          }).then();
        }
      );

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

      const manageFail = (message: string) => {
        dispatch(setErrorToast(message));
        redirect();
      };

      vs.notification.onFreeswitchReconnectLogin.subscribe(() => {
        reconnect = true;
        reconnecting = true;
        firstStreamPlay.current = true;
        setStreamReady(false);
        setMuteReactPlayer(true);
        setPlayerKey((prevState) => prevState + 1);
        setPrimaryCallEstablished(false);
        vs.hangup();
      });

      vs.notification.onFSLoggedError.subscribe(() => {
        manageFail("fs.cannotAuthenticate");
      });

      vs.notification.onEarlyCallError.subscribe(() => {
        manageFail("notifications.earlyCallError");
      });

      vs.notification.onStartingHangup.subscribe(() => {
        canLeave && !reconnecting && setExitingRoom(true);
      });

      vs.notification.onPrimaryCallDestroy.subscribe(() => {
        if (reconnect) {
          connect().catch(manageConnectCatch);
        } else if (canLeave) {
          redirect();
        }
      });

      vs.notification.onRoomClosed.subscribe(() => {
        socket.current?.emit("close-room");
        dispatch(setInfoToast("notifications.roomClosed"));
        vs.hangup();
        socket.current?.disconnect();
      });

      vs.notification.onHostChangeStream.subscribe((hostName) => {
        dispatch(
          setInfoToast(`${t("notifications.roomHostChange")} ${hostName}`)
        );
      });

      vs.notification.onYouHaveBeenRemoved.subscribe(() => {
        dispatch(setInfoToast("notifications.youHaveBeenRemoved"));
        vs.hangup();
        socket.current?.disconnect();
      });

      vs.notification.onYoursSharingHaveBeenRemoved.subscribe(() => {
        dispatch(setInfoToast("sharedStream.yoursSharingHaveBeenRemoved"));
        onRemoveStream();
        vs.removeSecondaryCall();
      });
    };

    connect().catch(manageConnectCatch);
  }, [
    t,
    dispatch,
    hostShareCamera,
    imHost,
    streamVlr.moderator.username,
    streamVlr.moderator.password,
    streamVlr.roomId,
    streamVlr.fsUrl,
    streamVlr.hostName,
    streamVlr.publicId,
    streamVlr.isMyRoom,
    streamVlr.vlrId,
    caller,
    noVideoTrack,
    roomRef,
    userCameraMaxWidth,
    onVertoSession,
    onRoomExit,
    onDismissLoading,
    onUpdateStreamVlr,
    onImHost,
    onRedirect,
    onSwitchHost,
    webViewVersion,
    androidWebViewToUseCaptureStream,
    profile.nickname,
    profile.id,
    onRemoveStream,
  ]);

  const handleOnProgress = () => {
    noStreamProgressTimeout.current &&
      clearTimeout(noStreamProgressTimeout.current);
    noStreamProgressTimeout.current = setTimeout(() => {
      console.log("STREAM PLAY");
      setPlayerKey((prevState) => prevState + 1);
    }, STREAM_NO_PROGRESS_TIMEOUT);
  };

  return (
    <>
      {imHost && !hostShareCamera && streamUrl && !exitingRoom && (
        <ReactPlayer
          key={playerKey}
          playsinline
          width="100%"
          height="100%"
          url={streamUrl}
          config={{
            file: {
              forceHLS: isPlatform("mobileweb") && isPlatform("ios"),
              attributes: {
                crossOrigin: "true",
              },
            },
          }}
          muted={muteReactPlayer}
          volume={playerVolume}
          style={{ display: "none" }}
          progressInterval={PLAYER_PROGRESS_INTERVAL}
          onReady={handlePlayerStreamReady}
          onPause={handlePlayerPause}
          onError={handlePlayerStreamError}
          onProgress={handleOnProgress}
          playing
        />
      )}

      <canvas ref={streamCanvasRef} className="stream-canvas" hidden />
    </>
  );
};

export default EstablishVertoSession;
