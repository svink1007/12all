import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import "./styles.scss";
import {RouteComponentProps, useHistory, useLocation, useParams} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {ReduxSelectors} from "../../redux/shared/types";
import {HTMLVideoStreamElement} from "../WatchParty/types";
import VertoSession from "../../verto/VertoSession";
import {Participant} from "../../verto/models";
import Layout from "../../components/Layout";
import {Routes} from "../../shared/routes";
import FullscreenListeners from "../WatchParty/LivingRoom/FullscreenListeners";
import TopBarStream from "./TopBarStream";
import getCamParams from "../../shared/methods/getCamParams";
import NoVideoCanvas from "../../components/NoVideoCanvas";
import Chat from "../../components/Chat";
import {EpgEntry, SharedStream, SharedVodVlrs, Vlr,} from "../../shared/types";
import SelectRoomModal from "./SelectRoomModal";
import {IonAlert, isPlatform, useIonViewWillEnter, useIonViewWillLeave,} from "@ionic/react";
import RouterLeaveGuard from "../../components/RouterLeaveGuard";
import EstablishVertoSession from "./EstablishVertoSession";
import startStreamVlr from "./startStreamVlr";
import exitStreamVlr from "./exitStreamVlr";
import {setErrorToast, setInfoToast} from "../../redux/actions/toastActions";
import {useTranslation} from "react-i18next";
import {UpdateMetadata, VlrService} from "../../services";
import {DOWNLOAD_APP_V_PARAM} from "../../components/DownloadApp";
import {StreamService} from "../../services/StreamService";
import {VertoLayout} from "../../verto/types";
import StreamDebugInfo from "../../components/StreamDebugInfo";
import RoomConnectionStatus from "../../components/RoomConnectionStatus";
import appStorage from "../../shared/appStorage";
import Participants from "../WatchParty/LivingRoom/Participants";
import BetsBar from "../WatchParty/components/bets/BetsBar";
import initVoD from "./initVod";
import {placeholderImage} from "../../components/VodItems";
import {Pause, Play, Repeat, Repeat1, StepBack, StepForward, Volume2, VolumeX} from "lucide-react";
import SideBarStream from "./SideBarStream";
import GiveStarModal from "../WatchParty/components/GiveStarModal";
import { addRecordedVod, addRecordedVodInfo } from "src/redux/actions/vodActions";
import { getRecordingId } from "src/shared/helpers";
import {VodState} from "../../redux/reducers/vodReducers";
import {streamLoadingStart} from "../../redux/actions/streamLoadingActions";
import WatchPartySession from "../WatchParty/LivingRoom/WatchPartySession";
import getMicParams from "../../shared/methods/getMicParams";


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
  hostName?: string;
  isMyRoom?: boolean;
};

export type ChangeStreamParams = {
  streamName: string;
  streamUrl: string;
  isAdult: boolean;
  epgId?: number;
};
export type ChangeStreamParamsWithId  = ChangeStreamParams & {
  streamId: string;
};

export type UpdateStreamVlr = {
  username: string;
  password: string;
  updateMetadata: boolean;
};

const MUTE_STREAM_LOADING_PREVIEW = "muteStreamLoadingPreview";

const VodRoom: FC<RouteComponentProps> = ({
                                            location: { search },
                                          }: RouteComponentProps) => {
  const { t } = useTranslation();

  const { id } = useParams<{
    id: string | "camera";
    roomId?: string;
  }>();

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get('roomId') ?? undefined;

  const dispatch = useDispatch();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const { showDebugInfo } = useSelector(
      ({ profile }: ReduxSelectors) => profile
  );
  const { astraUrl } = useSelector(
      ({ webConfig }: ReduxSelectors) => webConfig
  );
  const { currentStreamRoute } = useSelector(
      ({ stream }: ReduxSelectors) => stream
  );
  const pageRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLVideoStreamElement>(null);
  const vertoSession = useRef<VertoSession | null>(null);
  const timeLoading = useRef<NodeJS.Timeout | null>(null);

  const streamVlr = useRef<StreamVlr>({
    roomId: "",
    publicId: "",
    fsUrl: "",
    updateMetadata: true,
    moderator: { username: "", password: "" },
    vlrId: 0,
    upSpeedUrl: "",
    isMyRoom: false,
  });
  const userMediaAudioRef = useRef<MediaStream>();
  const userMediaVideoRef = useRef<MediaStream | null>(null);
  const noVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const sharedStreamData = useRef<SharedVodVlrs>();

  const caller = useRef<string>();

  useEffect(() => {
    if (!caller.current) {
      caller.current = profile.username || profile.nickname || `User_${new Date().getMilliseconds()}`;
    }
  }, [profile.username]);

  const isStreamingCamera = useRef<boolean>(false);
  const [isRoomPrivate, setIsRoomPrivate] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [showProgressbar, setShowProgressbar] = useState<boolean>(false);
  const [showInviteProgressbar, setShowInviteProgressbar] = useState<boolean>(false);
  const [showLoadingCancel, setShowLoadingCancel] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imHost, setImHost] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [micMuted, setMicMuted] = useState<boolean>(true);
  const [camStopped, setCamStopped] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [canLeave, setCanLeave] = useState<boolean>(false);
  const [openSelectRoomModal, setOpenSelectRoomModal] =
      useState<boolean>(false);
  const [vlrs, setVlrs] = useState<Vlr[]>([]);
  const [volume, setVolume] = useState<number>(1);
  const [redirectHome, setRedirectHome] = useState<boolean>(false);
  const [invitationUrl, setInvitationUrl] = useState<string>(
      window.location.href
  );
  const [streamName, setStreamName] = useState<string>("");
  const [streamId, setstreamId] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamEpg, setStreamEpg] = useState<EpgEntry[]>([]);
  const [streamIsAdult, setStreamIsAdult] = useState<boolean>(false);
  const [showStreamInfo, setShowStreamInfo] = useState<boolean>(showDebugInfo);
  const [isExitAlert, setIsExitAlert] = useState<boolean>(false);
  // eslint-disable-next-line
  const [muteVideo, setMuteVideo] = useState<boolean>(false);

  const [showParticipants, setShowParticipants] = useState<boolean>(false);
  const [roomHost, setRoomHost ]=useState<Participant>();
  const [showBets, setShowBets] = useState<boolean>(false);
  const [showGiveRewards, setShowGiveRewards] = useState<boolean>(false);
  const [currentLayout, setCurrentLayout]=useState<string>(VertoLayout.VideoLeftLarge);
  const [recordedId, setRecordedId]=useState<string|null>(null);
  const chatInputRef=useRef<HTMLIonInputElement>(null);

  const handleNoVideoTrack = useCallback((track: MediaStreamTrack) => {
    noVideoTrackRef.current = track;
  }, []);

  const startNewRoom = useCallback(() => {
    startStreamVlr({
      timeLoading,
      sharedStreamData,
      streamVlr,
      setShowLoadingCancel,
      setShowInviteProgressbar,
      setProgress,
      setImHost,
    });
  }, []);

  const joinRoom = useCallback((vlr: Vlr) => {
    timeLoading.current = setTimeout(() => setShowLoadingCancel(true), 10000);

    setOpenSelectRoomModal(false);
    setShowProgressbar(true);

    streamVlr.current = {
      roomId: vlr.room_id,
      publicId: vlr.public_id,
      fsUrl: vlr.fs_url || "",
      updateMetadata: false,
      moderator: {
        username: "",
        password: "",
      },
      vlrId: vlr.id,
      upSpeedUrl: vlr.up_speed_url,
      hostName: vlr.host_name,
      isMyRoom: vlr.is_my_room || false,
    };

    setProgress(0.2);
    setImHost(false);
  }, []);

  const handleRoomExit = useCallback(() => {

    userMediaVideoRef.current?.getTracks().forEach((track) => track.stop());

    exitStreamVlr({
      imHost,
      isStreamingCamera: isStreamingCamera.current,
      vertoSession,
      streamVlr,
      participants,
      userId: profile.id,
      history: history
    });
  }, [participants, imHost, profile.id]);

  const updateStreamParams = useCallback(({ streamName, streamUrl, isAdult, epgId }: ChangeStreamParams) => {
        if (epgId) {
          StreamService.getEpgEntries(epgId).then(({ data }) =>
              setStreamEpg(data)
          );
        } else {
          setStreamEpg([]);
        }
        setStreamName(streamName);
        setStreamUrl(streamUrl);
        setStreamIsAdult(isAdult);
      }, []);

  // useEffect(() => {
  useIonViewWillEnter(() => {

    if (sharedStreamData.current) {
      vertoSession.current?.sendDebugAction("a_play_stop", getVodName(sharedStreamData.current?.url), "conf-control");
      vertoSession.current?.disconnectWebSocket();
    }

    // Reset states
    setLoading(false);
    setShowProgressbar(false);
    setOpenSelectRoomModal(false);
    setProgress(0);
    setVlrs([]);
    setIsPlaying(true);
    setProgress2(0);
    setCurrentTime(0);
    setDuration(0);

    // Initialize new VOD
    initVoD({
      id,
      roomId,
      jwt: profile.jwt,
      setIsFullscreen,
      setLoading,
      setShowProgressbar,
      setOpenSelectRoomModal,
      setProgress,
      setVlrs,
      sharedStreamData,
      onStartNewRoom: startNewRoom,
      onJoinRoom: joinRoom,
      onExitRoom: (errorMessage?: string) => {
        if (errorMessage) {
          dispatch(setErrorToast(errorMessage));
        } else {
          dispatch(
              setInfoToast(
                  isPlatform("ios")
                      ? "notifications.iosNoStreamSupport"
                      : "notifications.roomNotActiveLogin"
              )
          );
        }
        setCanLeave(true);
      },
    });
  }, []);

  useIonViewWillLeave(() => {
    userMediaAudioRef.current
        ?.getAudioTracks()
        .forEach((track) => track.stop());
    userMediaVideoRef.current
        ?.getVideoTracks()
        .forEach((track) => track.stop());
    timeLoading.current && clearTimeout(timeLoading.current);
    if (sharedStreamData.current){
      vertoSession.current?.sendDebugAction("a_play_stop", getVodName(sharedStreamData.current?.url), "conf-control");
    }
    vertoSession.current?.disconnectWebSocket();
    vertoSession.current?.notification.removeAllSubscribers();
  }, []);

  useEffect(() => {
    const url = roomId
        ? window.location.href
        : `${window.location.href}?roomId=${streamVlr.current.publicId}`;
    setInvitationUrl(url);
  }, [roomId, streamVlr.current.publicId]);

  useEffect(() => {
    const version = new URLSearchParams(search).get("v");
    setRedirectHome(version === DOWNLOAD_APP_V_PARAM);
  }, [search]);

  useEffect(() => {
    const onBeforeUnloadListener = () => {
      handleRoomExit();
    };

    window.addEventListener("beforeunload", onBeforeUnloadListener);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnloadListener);
    };
  }, [handleRoomExit]);

  useEffect(() => {
    if (sharedStreamData.current) {
      setStreamName(sharedStreamData.current.title);
      setStreamUrl(sharedStreamData.current.url);
      setStreamIsAdult(sharedStreamData.current?.is_adult_content || false);
      setIsRoomPrivate(sharedStreamData.current?.is_adult_content || false);
      setStreamEpg([]);
    }

    if (
        imHost &&
        streamVlr.current.updateMetadata &&
        sharedStreamData.current
    ) {
      const updateMetaData: UpdateMetadata = {
        roomId: streamVlr.current.publicId,
        streamCamera: false,
        vodId: sharedStreamData.current.id,
        streamUrl: sharedStreamData.current.url,
        isPrivate: sharedStreamData.current.is_adult_content || false,
        channelLogo: sharedStreamData.current.logo,
        channelName: `${sharedStreamData.current.title} ${t(
            "sharedStream.by"
        )} ${caller.current}`,
        channelGenre: sharedStreamData.current.genre,
        channelDescription: "",
        channelLanguage: sharedStreamData.current.language,
        isHost: true,
        userId: profile.id,
      };

      VlrService.updateMetadata(updateMetaData).then();
    }
  }, [imHost, t, profile.id]);

  const handleToggleMic = () => {
    const shouldMute = !micMuted;
    setMicMuted(shouldMute);
    vertoSession.current?.togglePrimaryMic();
  };

  const handleToggleCam = (cam: string) => {
    if (cam === "none") {
      throw new Error("Camera is not selected");
    }

    const toggleCam = async () => {
      const shouldStopCam = !camStopped;
      setCamStopped(shouldStopCam);

      let mediaStream: MediaStream | null = null;

      if (!shouldStopCam) {
        // Starting camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: getCamParams(cam),
        });
        userMediaVideoRef.current = mediaStream;
      } else {
        // Stopping camera
        if (noVideoTrackRef.current) {
          mediaStream = new MediaStream([noVideoTrackRef.current]);
        }

        // Stop all current video tracks
        userMediaVideoRef.current?.getVideoTracks().forEach((track) => track.stop());
      }

      if (mediaStream && vertoSession.current) {
        vertoSession.current.replacePrimaryTracks(mediaStream);
        vertoSession.current.togglePrimaryCam();
      }
    };

    toggleCam().catch((err) => console.error(err));
  };

  const handleFullscreenChange = () => {
    setIsFullscreen((prevState) => {
      if (prevState) {
        document.exitFullscreen().then();
      } else {
        pageRef.current?.requestFullscreen().then();
      }
      return !prevState;
    });
  };

  const handleTheatreModeChange = () => {
    if (currentLayout === VertoLayout.OnlyVideo) {
      setCurrentLayout(VertoLayout.VideoLeftLarge);
      vertoSession.current?.changeLayout(VertoLayout.VideoLeftLarge);
    } else {
      setCurrentLayout(VertoLayout.OnlyVideo);
      vertoSession.current?.changeLayout(VertoLayout.OnlyVideo);
    }
  };

  const handleOnStartNewRoomModal = () => {
    setOpenSelectRoomModal(false);
    startNewRoom();
  };

  const handleOnCancelModal = () => {
    setOpenSelectRoomModal(false);
    setCanLeave(true);
  };

  const handleDismissLoading = useCallback(() => {
    // setProgress(0.9);

    if (roomRef.current) {
      roomRef.current.muted = false;
      setLoading(false);
      setShowProgressbar(false);
      setShowInviteProgressbar(false);
      // setProgress(1);
    }

    timeLoading.current && clearTimeout(timeLoading.current);
  }, []);

  const handleProgressChange = useCallback((value: number) => {
    setProgress(value);
  }, []);

  const handleParticipantsChange = useCallback((participants: Participant[]) => {
        setParticipants(participants);
        const host =participants.filter(participant=>participant.isHost)[0];
        setRoomHost(host);
        const currentUser= participants.filter(participant=>participant.userId===profile.id)[0];
        if(currentUser){
          setMicMuted(currentUser.audio.muted)
        }
      }, []);

  const handleCanLeaveChange = useCallback((value: boolean) => {
    setCanLeave(value);
  }, []);

  const handleUpdateStreamVlr = useCallback(
      ({ username, password, updateMetadata }: UpdateStreamVlr) => {
        streamVlr.current.moderator.username = username;
        streamVlr.current.moderator.password = password;
        streamVlr.current.updateMetadata = updateMetadata;
      },
      []
  );

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

  const handleVertoSessionChange = useCallback(
      (session: VertoSession) => {
        vertoSession.current = session;

        session.notification.onWebSocketMessage.subscribe((vertoEvent)=>{
          const result=getRecordingId(vertoEvent)
          if(result!==null && recordedId===null){
            setRecordedId(result.recordingId);
            dispatch(addRecordedVodInfo({gender:sharedStreamData.current?.genre as string, language:sharedStreamData.current?.language as string}));

          }
        })
        session.notification.onChatMessageStreamChange.subscribe((params) => {
          if (sharedStreamData.current) {
            sharedStreamData.current.url = params.streamUrl;
            sharedStreamData.current.title = params.streamName;
            sharedStreamData.current.is_adult_content = params.isAdult;
          }
          updateStreamParams(params);
        });

        session.notification.onConnectedToRoom.subscribe(() => {
          setMicMuted(true);
          setCamStopped(true);
        });
      },
      [updateStreamParams]
  );

  const handleStreamIsPlaying = useCallback(() => {
  }, []);

  const handleRemoveStream = useCallback(() => {
    if (sharedStreamData.current) {
      sharedStreamData.current.id = 0;
    }
    setStreamName("");
    setStreamUrl(null);
  }, []);

  const handleStreamPlayFail = () => {
  };

  const history = useHistory();

  const handleStreamChange = ({
                                id,
                                title,
                                url,
                                logo,
                                is_adult_content,
                                genre,
                                language,
                              }: VodState) => {
    setCanLeave(true)

    if (streamName === title && streamUrl === url) {
      return;
    }

    if (sharedStreamData.current) {
      sharedStreamData.current.id = id;
    }

    vertoSession.current?.sendDebugAction("a_play_stop", "", "conf-control");

    if (sharedStreamData.current) {
      const updateMetaData: UpdateMetadata = {
        roomId: streamVlr.current.publicId,
        streamCamera: false,
        vodId: id,
        streamUrl: url,
        isPrivate: is_adult_content || false,
        channelLogo: logo,
        channelName: `${title} ${t("sharedStream.by")} ${caller.current}`,
        channelGenre: genre,
        channelDescription: "",
        channelLanguage: language,
        isHost: true,
        userId: profile.id,
      };

      VlrService.updateMetadata(updateMetaData).then();
    }

    const params: ChangeStreamParams = {
      streamName: title,
      streamUrl: url,
      isAdult: is_adult_content || false,
      epgId: undefined,
    };

    // history.replace(Routes.Vod + "/" + id)

    vertoSession.current?.sendDebugAction("vid-layout", "1up_top_left+9_orig", "conf-control");
    vertoSession.current?.sendDebugAction("vod_play", `${getVodName(url)}`, "conf-control");

    updateStreamParams(params);
  };

  const handleCanLeave = () => {
    if(recordedId){
      dispatch(addRecordedVod(recordedId));
      setRecordedId(null);
    }
    handleRoomExit();
  };

  const handleChangeRoomLayout = (layout: VertoLayout) => {
    vertoSession.current?.changeLayout(layout);
  };

  const handleExitAlert = () => {
    setIsExitAlert(true);
  };

  const hanldeRedirectRoute = () => {
    switch (currentStreamRoute) {
      case "FROM_CHANNEL":
        return Routes.Channels;
      case "FROM_GENRE":
        return Routes.Genre;
      case "FROM_HOME":
        return Routes.Home;
      default:
        return Routes.Home;
    }
  };

  useEffect(() => {
    const value = appStorage.getItem(MUTE_STREAM_LOADING_PREVIEW);
    if (value && value === "true") {
      setMuteVideo(true);
    }
  }, []);







  const getVodName = (vodUrl: string): string => {
    const url = new URL(vodUrl);
    return url.pathname.split('/').pop() || ""
  }

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress2, setProgress2] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume2, setVolume2] = useState(1);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(0.1);
  const [isMuted, setIsMuted] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = (): void => {
    if (roomRef.current && sharedStreamData.current) {
      if (isPlaying) {
        roomRef.current.pause();
        vertoSession.current?.sendDebugAction("a_play_pause", getVodName(sharedStreamData.current.url), "conf-control")
      } else {
        vertoSession.current?.sendDebugAction("a_play_resume", getVodName(sharedStreamData.current.url), "conf-control")
        roomRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (): void => {
    if (roomRef.current && sharedStreamData.current) {
      roomRef.current.muted = !isMuted;
      if(isMuted){
        // in the case where the latest value of the volume before we mute was zero , we have to use 0.1 when unmuting
        if(volumeBeforeMute===0){
          setVolume2(0.1)
          updateVolumeWithCommand(0.1)
        }else{
          setVolume2(volumeBeforeMute)
          updateVolumeWithCommand(volumeBeforeMute)
        }
      }
      else{
        setVolumeBeforeMute(volume2);
        setVolume2(0)
        vertoSession.current?.sendDebugAction("a_play_volume", "-50")
      }
      setIsMuted(!isMuted);
    }
  };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const DEBOUNCE_DELAY = 300; // 300ms delay after user stops sliding

  const handleVolumeChange = (() => {
    return (e: React.ChangeEvent<HTMLInputElement>): void => {
      let  newVolume = parseFloat(e.target.value);

      // Update UI immediately for smooth visual feedback
      setVolume2(newVolume);
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Set new timeout to execute after user stops sliding
      timeoutRef.current = setTimeout(() => {
        if (roomRef.current) {
          setIsMuted(newVolume === 0);
          roomRef.current.volume = newVolume;
          updateVolumeWithCommand(newVolume)
        }
      }, DEBOUNCE_DELAY);
    };
  })();

  const updateVolumeWithCommand=(newVolume: number)=>{
    // we use -50 instead of -100 because the volume gain is to small , so at -50 the volume is already null
    newVolume=(newVolume * 50) - 50;
    vertoSession.current?.sendDebugAction("a_play_volume", `${newVolume}`, "conf-control")
  }



  // Handle progress bar click

  // Handle keyboard shortcuts
  const handleKeyDown = async (e: KeyboardEvent): Promise<void> => {
    if (showChat && chatInputRef.current) {
      const internalInput =  await chatInputRef.current.getInputElement();
      if (document.activeElement === internalInput) {
        return;
      }
    }
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowRight':
        if (roomRef.current) {
          roomRef.current.currentTime += 5;
        }
        break;
      case 'ArrowLeft':
        if (roomRef.current) {
          roomRef.current.currentTime -= 5;
        }
        break;
      case 'ArrowUp':
        setVolume2(prev => Math.min(1, prev + 0.1));
        if (roomRef.current) {
          const vol= Math.min(1, roomRef.current.volume + 0.1);
          roomRef.current.volume = vol;
          updateVolumeWithCommand(vol)
          setIsMuted(false);
        }
        break;
      case 'ArrowDown':
        setVolume2(prev => Math.max(0, prev - 0.1));
        if (roomRef.current) {
          const vol=Math.max(0, roomRef.current.volume - 0.1);
          roomRef.current.volume = vol;
          setIsMuted(roomRef.current.volume === 0);
          updateVolumeWithCommand(vol)
        }
        break;
      case 'KeyM':
        toggleMute();
        break;
      default:
        break;
    }
  };

  // Show controls on mouse move
  const showControls = (): void => {
    setIsControlsVisible(true);

    // Reset any existing timeout
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }

    // Set a timeout to hide controls after 3 seconds of inactivity
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setIsControlsVisible(false);
      }
    }, 3000);
  };

  const isSeekingRef = useRef(false);

  const handleSeek = (seekAmount: number, prefix: string): void => {
    vertoSession.current?.sendDebugAction("a_play_seek", `${prefix}${seekAmount * 1000}`, "conf-control");
  }

  // Handle time update
  useEffect(() => {
    const video = roomRef.current;

    const handleTimeUpdate = (): void => {
      if (isSeekingRef.current) {
        // 🚫 Skip updates during seeking
        return;
      }
      if (video && sharedStreamData.current) {
        video.currentTime = (video.currentTime + 1) % ((sharedStreamData.current?.duration || 1) + 1)
        setCurrentTime(video.currentTime);
        // setProgress2(100);
        setProgress2(((video.currentTime + 1) % ((sharedStreamData.current?.duration || 1) + 1) / (sharedStreamData.current?.duration || 1)) * 100);
      }
    };

    const handleLoadedMetadata = (): void => {
      if (video && sharedStreamData.current) {
        setDuration(sharedStreamData.current?.duration);
      }
    };

    const handleEnded = (): void => {
      setIsPlaying(false);
      setProgress2(100);
    };

    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, duration]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const talking =!micMuted || !!participants.find(p => !p.audio.muted && !p.isHost);
    if(talking){
      if(!isMuted){
        toggleMute()
      }
    }else if(isMuted && volumeBeforeMute > 0){
      toggleMute();
    }
  }, [micMuted, participants]);

  const [loop, setLoop] = useState(true);
  const [seek, setSeek] = useState("0");
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    isSeekingRef.current = true;
    if (roomRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const seekTimeSec = pos * duration;

      const seekTimeMs = Math.floor(seekTimeSec * 1000); // milliseconds for server

      vertoSession.current?.sendDebugAction("a_play_seek", `${seekTimeMs}`, "conf-control");

      roomRef.current.currentTime = seekTimeMs;

      setCurrentTime(seekTimeMs);
    }
    setTimeout(() => {
      isSeekingRef.current = false;
    }, 500);
  };

  const handleLoop = (): void => {
    setLoop(!loop);
    if(loop){
      dispatch(setInfoToast("Loop mode turned off"));
    }
    else{
      dispatch(setInfoToast("Loop mode turned on"));
    }
  }

  useEffect(() => {
    if(streamUrl){
      if(loop){
        vertoSession.current?.sendDebugAction("a_vod_loop", getVodName(streamUrl), "conf-control");
      }
      else{
        vertoSession.current?.sendDebugAction("a_vod_loop", ``, "conf-control");
      }
      vertoSession.current?.sendDebugAction("vid-layout", "1up_top_left+9_orig", "conf-control");
    }
  }, [loop, streamUrl]);

  useEffect(() => {
    if(streamUrl){
      vertoSession.current?.sendDebugAction("a_play_seek", `${seek}`, "conf-control");
    }
  }, [loop, streamUrl]);


  return (
      <Layout>

        <b className={"text-[5rem] text-white"}>
          {imHost !== null ? "True" : "False"} <br/>

          {caller.current} <br/>

          {imHost !== null && caller.current}
        </b>

        {imHost !== null && caller.current && (
            <EstablishVertoSession
                userId={profile.id}
                isRoomPrivate={isRoomPrivate}
                volume={volume}
                loop={loop}
                setIsPlaying={setIsPlaying}
                setDuration={setDuration}
                setProgress={setProgress2}
                setCurrentTime={setCurrentTime}
                micMuted={micMuted}
                imHost={imHost}
                caller={caller.current as string}
                roomRef={roomRef}
                timeLoading={timeLoading.current}
                streamVlr={streamVlr.current}
                streamName={streamName}
                streamUrl={streamUrl}
                noVideoTrack={noVideoTrackRef.current}
                onUserMedia={handleUserMediaChange}
                onVertoSession={handleVertoSessionChange}
                onDismissLoading={handleDismissLoading}
                setShowProgressbar={setShowProgressbar}
                setLoading2={setLoading}
                setShowInviteProgressbar={setShowInviteProgressbar}
                onProgress={handleProgressChange}
                onParticipants={handleParticipantsChange}
                onCanLeave={handleCanLeaveChange}
                onStreamCamera={handleStreamCameraChange}
                onUpdateStreamVlr={handleUpdateStreamVlr}
                onImHost={handleImHostChange}
                onStreamIsPlaying={handleStreamIsPlaying}
                onStreamPlayFail={handleStreamPlayFail}
                onRemoveStream={handleRemoveStream}
            />
        )}

        <main
            ref={pageRef}
            className={`vod-shared-stream-page  ${isFullscreen ? "fullscreen" : ""}`}
        >

          <section className="shared-stream-chat-section">
            {vertoSession.current && (
                <Chat
                    vlrId={streamVlr.current.vlrId}
                    session={vertoSession.current}
                    participants={participants}
                    show={showChat}
                    chatInputRef={chatInputRef}
                />
            )}
          </section>

          <section className="shared-stream-room-section">

            <div
                className="stream-content-holder"
                style={{
                  visibility:
                      !!roomRef.current?.srcObject && !loading ? "visible" : "hidden",
                  position: "relative"
                }}
            >
              {
                  sharedStreamData.current &&(
                      <TopBarStream
                          sharedStreamData={sharedStreamData.current}
                          logo={placeholderImage}
                          streamName={streamName}
                          epgEntries={streamEpg}
                          participants={participants}
                          onExit={handleExitAlert}
                      />
                  )
              }

              <div
                  className={`stream-holder ${
                      roomRef.current?.srcObject === null ? "left" : ""
                  }`}
              >
                <div className="stream-room-container" style={{ display: "contents" }}>

                  <div
                      className="video-player-container"
                      onMouseMove={showControls}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('.video-controls')) return;
                        togglePlay();
                      }}
                  >

                    <video
                        ref={roomRef}
                        muted={false}
                        autoPlay
                        className={isFullscreen?"stream-room-video stream-room-video-fullscreen":"stream-room-video"}
                        playsInline
                    />

                    <div className={`progress-container top-[-150px] ${isControlsVisible ? 'visible' : 'hidden'}`} onClick={handleProgressBarClick} ref={progressBarRef}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress2}%` }}></div>
                      </div>
                      <div className="progress-thumb" style={{ left: `${progress2}%` }}></div>
                    </div>

                    <div className={`video-controls ${isControlsVisible ? 'visible' : 'hidden'}`}>

                      {(roomHost?.userId === profile.id) &&
                          <div  className="controls-row">
                            <div className="left-controls">
                              <button className="control-button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                              </button>


                              <button className="control-button" onClick={handleLoop} aria-label="Restart">
                                {
                                  loop ? <Repeat size={18} /> : <Repeat1 size={18} />
                                }
                              </button>


                              <div className="volume-control">
                                <button className="control-button" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume2}
                                    onChange={handleVolumeChange}
                                    className="volume-slider"
                                    aria-label="Volume"
                                />
                              </div>

                              <div className="time-display">
                                {/*<b>{sharedStreamData.current && formatTime((currentTime + 1) % (sharedStreamData.current?.duration + 1))}</b> - */}
                                <b style={{ color:"#ffab00" }}>{formatTime(duration)}</b>
                              </div>

                              <div className="right-controls">

                                <button className="control-button" onClick={() => {
                                  handleSeek(10, "-")
                                }} aria-label={isPlaying ? 'Pause' : 'Play'}>
                                  <StepBack />
                                </button>

                                <button className="control-button" onClick={() => {
                                  handleSeek(10, "+")
                                }} aria-label={isPlaying ? 'Pause' : 'Play'}>
                                  <StepForward />
                                </button>

                              </div>

                            </div>

                            <div className="center-controls">



                            </div>

                            <div className="right-controls">


                            </div>
                          </div>
                      }

                    </div>

                  </div>


                  {
                      roomRef.current && <></>
                  }

                  {vertoSession.current && (
                      <RoomConnectionStatus vertoSession={vertoSession.current}/>
                  )}

                </div>

                <NoVideoCanvas onVideoTrack={handleNoVideoTrack}/>

                <SideBarStream
                    streamId={sharedStreamData.current?.id}
                    showStreamInfo={showStreamInfo}
                    isAdult={streamIsAdult}
                    isPrivate={isRoomPrivate}
                    publicId={streamVlr.current.publicId}
                    imHost={imHost}
                    show={!!roomRef.current?.srcObject && !loading}
                    micMuted={micMuted}
                    camStopped={camStopped}
                    fullscreen={isFullscreen}
                    showChat={showChat}
                    invitationUrl={invitationUrl}
                    onToggleMic={handleToggleMic}
                    onToggleCam={handleToggleCam}
                    onFullscreen={handleFullscreenChange}
                    onTheatreMode={handleTheatreModeChange}
                    onShowChat={setShowChat}
                    onLayoutChange={handleChangeRoomLayout}
                    onChangeStream={handleStreamChange}
                    onChangeRoomStatus={setIsRoomPrivate}
                    onShowStreamInfo={setShowStreamInfo}
                    showParticipants={showParticipants}
                    onShowParticipants={setShowParticipants}
                    onShowBets={setShowBets}
                    showBets={showBets}
                    showGiveRewards={showGiveRewards}
                    onShowGiveRewards={setShowGiveRewards}
                    currentLayout={currentLayout}
                    participantsCount={participants.length}
                    recordedId={recordedId}
                />

                {/*<PlayerBarStream*/}
                {/*    volume={volume}*/}
                {/*    onVolumeChange={handlePlayerVolumeChange}*/}
                {/*/>*/}
              </div>
              {vertoSession.current && (
                  <>
                    <BetsBar
                        isFullscreen={isFullscreen}
                        session={vertoSession.current}
                        roomId={Number(streamVlr.current?.vlrId)}
                        isRoomOwner={imHost}
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
            </div>

            <FullscreenListeners isInFullscreen={isFullscreen}/>

          </section>

          <section className={showParticipants && isFullscreen?"shared-stream-side-features border-r-4 ":"shared-stream-side-features"}>
            {showStreamInfo && <StreamDebugInfo/>}
            {
                vertoSession.current &&
                <Participants
                    isFullscreen={isFullscreen}
                    session={vertoSession.current}
                    participants={participants}
                    host={roomHost?.userId === profile.id}
                    show={showParticipants}
                    isVodRoom={true}
                />
            }
          </section>

        </main>

        <SelectRoomModal
            open={openSelectRoomModal}
            vlrs={vlrs}
            onStartNewRoom={handleOnStartNewRoomModal}
            onJoinRoom={joinRoom}
            onCancel={handleOnCancelModal}
        />

        <RouterLeaveGuard
            canLeave={canLeave}
            defaultDestination={hanldeRedirectRoute()}
            redirectTo={redirectHome ? hanldeRedirectRoute() : null}
            onCanLeave={handleCanLeave}
        />

        {isExitAlert && (
            <IonAlert
                isOpen={isExitAlert}
                onDidDismiss={() => setIsExitAlert(false)}
                message={t("watchPartyStart.aboutToLeave")}
                buttons={[
                  {
                    text: `${t("common.decline")}`,
                    role: "cancel",
                  },
                  {
                    text: `${t("common.leave")}`,
                    handler: () => {
                      handleCanLeave();
                    },
                  },
                ]}
            />
        )}
      </Layout>
  );
};

export default VodRoom;
