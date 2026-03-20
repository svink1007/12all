import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";
import { RouteComponentProps, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/shared/types";
import { HTMLVideoStreamElement } from "../WatchParty/types";
import VertoSession from "../../verto/VertoSession";
import { Participant } from "../../verto/models";
import Layout from "../../components/Layout";
import { Routes } from "../../shared/routes";
import FullscreenListeners from "../WatchParty/LivingRoom/FullscreenListeners";
import TopBarStream from "./TopBarStream";
import SideBarStream from "./SideBarStream";
import getCamParams from "../../shared/methods/getCamParams";
import NoVideoCanvas from "../../components/NoVideoCanvas";
import Chat from "../../components/Chat";
import {
  EpgEntry,
  SharedStream,
  SharedStreamVlrs,
  Vlr,
} from "../../shared/types";
import SelectRoomModal from "./SelectRoomModal";
import {
  IonAlert, IonIcon,
  isPlatform,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
// import ProgressLoaderInvite from '../../components/ProgressLoaderInvite';
import RouterLeaveGuard from "../../components/RouterLeaveGuard";
import EstablishVertoSession from "./EstablishVertoSession";
import PlayerBarStream from "./PlayerBarStream";
import initStream from "./initStream";
import startStreamVlr from "./startStreamVlr";
import exitStreamVlr from "./exitStreamVlr";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import { useTranslation } from "react-i18next";
import { UpdateMetadata, VlrService } from "../../services";
import { DOWNLOAD_APP_V_PARAM } from "../../components/DownloadApp";
import { StreamService } from "../../services/StreamService";
import { streamLoadingStart } from "../../redux/actions/streamLoadingActions";
import {API_URL, BILLING_SOCKET} from "../../shared/constants";
import { VertoLayout } from "../../verto/types";
import StreamDebugInfo from "../../components/StreamDebugInfo";
import RoomConnectionStatus from "../../components/RoomConnectionStatus";
import appStorage from "../../shared/appStorage";
import GoogleAdStream, { GoogleAdStream2 } from "../../components/GoogleAdStream";
import Participants from "../WatchParty/LivingRoom/Participants";
import BetsBar from "../WatchParty/components/bets/BetsBar";
import Hls, {Fragment} from "hls.js";

import GiveStarModal from "../WatchParty/components/GiveStarModal";
import {setupVerto} from "../../redux/actions/vertoActions";
import { addRecordedVod,addRecordedVodInfo } from "src/redux/actions/vodActions";
import { getRecordingId } from "src/shared/helpers";

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

const SharedStreamPage: FC<RouteComponentProps> = ({
  location: { search },
}: RouteComponentProps) => {
  const { t } = useTranslation();
  // const history = useHistory();
  const { id, roomId } = useParams<{
    id: string | "camera";
    roomId?: string;
  }>();
  const dispatch = useDispatch();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const { showDebugInfo } = useSelector(
      ({ profile }: ReduxSelectors) => profile
  );
  // eslint-disable-next-line
  const { astraUrl, previewClip } = useSelector(
    ({ webConfig }: ReduxSelectors) => webConfig
  );
  const { currentStreamRoute } = useSelector(
    ({ stream }: ReduxSelectors) => stream
  );
  const pageRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLVideoStreamElement>(null);
  const vertoSession = useRef<VertoSession | null>(null);
  const timeLoading = useRef<NodeJS.Timeout | null>(null);
  // const streamVideoRef = useRef<HTMLVideoElement>(null);
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
  const sharedStreamData = useRef<SharedStreamVlrs>();

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
  // eslint-disable-next-line
  const [showInviteProgressbar, setShowInviteProgressbar] =
    useState<boolean>(false);
  const [showLoadingCancel, setShowLoadingCancel] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imHost, setImHost] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [micMuted, setMicMuted] = useState<boolean>(true);
  const [camStopped, setCamStopped] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
   const [roomHost,setRoomHost ]=useState<Participant>();
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
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamEpg, setStreamEpg] = useState<EpgEntry[]>([]);
  const [streamIsAdult, setStreamIsAdult] = useState<boolean>(false);
  const [showStreamInfo, setShowStreamInfo] = useState<boolean>(showDebugInfo);
  const [isExitAlert, setIsExitAlert] = useState<boolean>(false);
  const [recordedId, setRecordedId]=useState<string|null>(null);
  // eslint-disable-next-line
  const [muteVideo, setMuteVideo] = useState<boolean>(false);
  // const [showAds, setShowAds] = useState<boolean>(false);
  // const [openSelectFsResolution, setOpenSelectFsResolution] = useState<boolean>(false);
  // const [fsResolution, setFsResolution] = useState<number>();

  const [showParticipants, setShowParticipants] = useState<boolean>(false);
  const [showBets, setShowBets] = useState<boolean>(false);
  const [showGiveRewards, setShowGiveRewards] = useState<boolean>(false);
  const [currentLayout, setCurrentLayout]=useState<string>(VertoLayout.VideoLeftLarge);

  const handleNoVideoTrack = useCallback((track: MediaStreamTrack) => {
    noVideoTrackRef.current = track;
  }, []);

  const startNewRoom = useCallback(() => {
    // setOpenSelectFsResolution(true);
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
    setProgress(1)
    setAdID(null)
    exitStreamVlr({
      imHost,
      isStreamingCamera: isStreamingCamera.current,
      vertoSession,
      streamVlr,
      participants,
      userId: profile.id,
    });
    
  },[participants, imHost, profile.id]);

  const updateStreamParams = useCallback(
    ({ streamName, streamUrl, isAdult, epgId }: ChangeStreamParams) => {
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
    },
    []
  );

  useIonViewWillEnter(() => {
    if (id === "camera" && !roomId) {
      dispatch(setErrorToast("sharedStream.noStreamRoomId"));
      setCanLeave(true);
      return;
    }

    initStream({
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
    vertoSession.current?.notification.removeAllSubscribers();
  }, []);

  useEffect(() => {
    const url = roomId
      ? window.location.href
      : `${window.location.href}/${streamVlr.current.publicId}`;
    setInvitationUrl(url);
  }, [roomId, streamVlr.current.publicId]);

  useEffect(() => {
    const version = new URLSearchParams(search).get("v");
    setRedirectHome(version === DOWNLOAD_APP_V_PARAM);
  }, [search]);

  useEffect(() => {
    const onBeforeUnloadListener = (e: any) => {
      handleRoomExit();
    };

    window.addEventListener("beforeunload", onBeforeUnloadListener);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnloadListener);
    };
  }, [handleRoomExit]);

  useEffect(() => {
    if (sharedStreamData.current) {
      setStreamName(sharedStreamData.current.name);
      setStreamUrl(sharedStreamData.current.url);
      setStreamIsAdult(sharedStreamData.current?.is_adult_content || false);
      setIsRoomPrivate(sharedStreamData.current?.is_adult_content || false);
      setStreamEpg(sharedStreamData.current?.epg_channel?.entries || []);
    }

    if (
      imHost &&
      streamVlr.current.updateMetadata &&
      sharedStreamData.current
    ) {
      const updateMetaData: UpdateMetadata = {
        roomId: streamVlr.current.publicId,
        streamCamera: false,
        streamId: sharedStreamData.current.id,
        streamUrl: sharedStreamData.current.url,
        isPrivate: sharedStreamData.current.is_adult_content || false,
        channelLogo: sharedStreamData.current.logo_image?.url
          ? `${API_URL}${sharedStreamData.current.logo_image.url}`
          : sharedStreamData.current.logo,
        channelName: `${sharedStreamData.current.name} ${t(
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
    setMicMuted((prevState) => !prevState);
    vertoSession.current?.togglePrimaryMic();
  };

  const handleToggleCam = (cam: string) => {
    if (cam === "none") {
      throw new Error("Camera is not selected");
    }

    const toggleCam = async () => {
      let mediaStream: MediaStream | null = null;

      setCamStopped((prevState) => !prevState);

      if (camStopped) {
        mediaStream = userMediaVideoRef.current =
          await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: getCamParams(cam),
          });
      } else {
        if (noVideoTrackRef.current) {
          mediaStream = new MediaStream([noVideoTrackRef.current]);
        }
      }

      if (mediaStream && vertoSession.current) {
        vertoSession.current.replacePrimaryTracks(mediaStream);
        vertoSession.current.togglePrimaryCam();

        if (!camStopped) {
          userMediaVideoRef.current
            ?.getVideoTracks()
            .forEach((track) => track.stop());
        }
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

  const handlePlayerVolumeChange = (value: number) => {
    setVolume(value);
   // if (!imHost && roomRef.curent , the first condition is not more required
    if (  roomRef.current) {
      roomRef.current.volume = value;
      //vertoSession.current?.sendDebugAction("a_play_volume", value.toString(), "conf-control")
    }
  };

  const handleDismissLoading = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.muted = false;
      setLoading(false);
      setShowProgressbar(false);
      setShowInviteProgressbar(false);
    }

    timeLoading.current && clearTimeout(timeLoading.current);
  }, []);

  const handleProgressChange = useCallback((value: number) => {
    setProgress(value);
  }, []);

  const handleParticipantsChange = useCallback(
      (participants: Participant[]) => {
        setParticipants(participants);
        const host =participants.filter(participant=>participant.isHost)[0];
        setRoomHost(host);
        const currentUser= participants.filter(participant=>participant.userId===profile.id)[0];
        if(currentUser){
          setMicMuted(currentUser.audio.muted)
        }
      },
    []
  );

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
          sharedStreamData.current.name = params.streamName;
          sharedStreamData.current.is_adult_content = params.isAdult;
        }
        updateStreamParams(params);
      });

      session.notification.onConnectedToRoom.subscribe(() => {
        setMicMuted(true);
        setCamStopped(true);
      });

      if(streamVlr.current){
        dispatch(setupVerto({session: session}));
      }
    },
    [updateStreamParams]
  );




  const handleStreamIsPlaying = useCallback(() => {
    if (sharedStreamData.current) {
      StreamService.updatePlayedSuccessfully(
        sharedStreamData.current.id,
        true
      ).then();
    }
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

  const handleStreamChange = ({
    id,
    name,
    url,
    logo,
    is_adult_content,
    epg_channel,
    genre,
    language,
  }: SharedStream) => {
    if (streamName === name && streamUrl === url) {
      return;
    }

    if (sharedStreamData.current) {
      sharedStreamData.current.id = id;
    }

    const regex = new RegExp(astraUrl);

    if (!astraUrl || regex.test(url)) {
      StreamService.requestAstraStreamOpening(url).then();
    }

    if (sharedStreamData.current) {
      const updateMetaData: UpdateMetadata = {
        roomId: streamVlr.current.publicId,
        streamCamera: false,
        streamId: id,
        streamUrl: url,
        isPrivate: is_adult_content || false,
        channelLogo: logo,
        channelName: `${name} ${t("sharedStream.by")} ${caller.current}`,
        channelGenre: genre,
        channelDescription: "",
        channelLanguage: language,
        isHost: true,
        userId: profile.id,
      };

      VlrService.updateMetadata(updateMetaData).then();
    }

    const params: ChangeStreamParams = {
      streamName: name,
      streamUrl: url,
      isAdult: is_adult_content || false,
      epgId: epg_channel?.id,
    };

    console.log(params)

    vertoSession.current?.sendMessage.streamChange(params);
    updateStreamParams(params);
    dispatch(streamLoadingStart());
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

  useEffect(() => {
    dispatch(setupVerto({participants: participants}));
  }, [participants]);

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

  const [adPlaying, setAdPlaying] = useState(false);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const hlsDestroyedRef = useRef(false);

  function secureUrl(url: string) {
    if (url.startsWith('http://')) {
      const secure = url.replace('http://', 'https://');
      return secure;
    }
    return url;
  }

  const adDelaySetRef = useRef(false);

  useEffect(() => {
    const url = sharedStreamData.current?.source;

    if (!url || !roomRef.current || !Hls.isSupported()) return;

    let isHlsDestroyed = false;
    let retryCount = 0;
    const maxRetries = 10;
    const retryDelayMs = 3000;

    const hls = new Hls({
      debug: false,
      enableCEA708Captions: true,
      fragLoadingMaxRetry: 5,
      manifestLoadingMaxRetry: 5,
      levelLoadingMaxRetry: 5,
      xhrSetup: function(xhr) {
        xhr.withCredentials = false;
      }
    });

    setHlsInstance(hls);
    hlsDestroyedRef.current = false;
    let adTimeoutRef: NodeJS.Timeout | null = null;

    hls.loadSource(secureUrl(url));
    hls.attachMedia(roomRef.current);

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      hls.loadLevel = 0;
      roomRef.current?.play().catch(err => {
        if (err.name === 'NotAllowedError') {
          if (roomRef.current) {
            roomRef.current.muted = true;
            roomRef.current.play().catch(e => {});
          }
        }
      });
    });

    hls.on(Hls.Events.FRAG_LOADED, () => {
      retryCount = 0;
    });

    const checkFragmentTags = (fragment: Fragment) => {
      if (fragment.tagList) {
        fragment.tagList.forEach(tag => {
          if (tag[0] === 'EXT-X-CUE-OUT') {
            let durationSeconds;
            if (tag[1]) {
              const match = tag[1].match(/DURATION=(\d+(\.\d+)?)/);
              if (match) {
                durationSeconds = parseFloat(match[1]);
              }
            }
            if(durationSeconds){
              handleAdStart(durationSeconds);
            }
          }

          if (tag[0] === 'EXT-X-CUE-IN') {
            handleAdEnd();
          }

          if (tag[0] === 'EXT-X-DATERANGE' && tag[1] && (tag[1].includes('SCTE35') || tag[1].includes('AD'))) {
            handleAdStart(null);
          }
        });
      }
    };

    const handleAdStart = (durationSeconds?: number | null) => {
      if (adPlaying) {
        return;
      }

      setAdPlaying(true);

      if (!adDelaySetRef.current) {
        if (durationSeconds !== undefined) {
          setAdDelay(durationSeconds);
        } else {
          setAdDelay(0);
        }

        adDelaySetRef.current = true;
      }
    };

    const handleAdEnd = () => {
      if (!adPlaying) {
        return;
      }

      setAdPlaying(false);
      setAdDelay(0);

      adDelaySetRef.current = false;
    };

    hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
      if (data.details.fragments) {
        data.details.fragments.forEach((fragment, index) => {
          checkFragmentTags(fragment);
        });
      }
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch(data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            break;
        }
      } else {
        if (data.details === 'bufferAppendError') {
          hls.recoverMediaError();
        }
      }
    });

    const cleanup = () => {
      setAdDelay(null);
      setAdID(null);
      adDelaySetRef.current = false;

      if (adTimerRef.current) {
        clearInterval(adTimerRef.current);
        adTimerRef.current = null;
      }

      if (adTimeoutRef) {
        clearTimeout(adTimeoutRef);
        adTimeoutRef = null;
      }

      if (hls && !isHlsDestroyed) {
        try {
          hls.detachMedia();
          hls.destroy();
        } catch (e) {}
        hlsDestroyedRef.current = true;
        setHlsInstance(null);
        isHlsDestroyed = true;
      }
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [sharedStreamData.current?.source]);

  const [adDelay, setAdDelay] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(adDelay || null);
  const [adID, setAdID] = useState<number | null>(null);

  useEffect(() => {
   if(adDelay) {
     setTimeLeft(adDelay);
   }
  }, [adDelay]);

  useEffect(() => {
    if (timeLeft === 0) {
      setAdID(Math.random());
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(prev => {
        if(prev !== null) return prev - 1;
        return null
      });
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft]);


  const now = new Date();
  const isoString = now.toISOString();

  const [adData, setAdData] = useState({
    ad_break_time: isoString,
    ad_run_time: null,
    ad_source: null,
    host_id: profile.id,
    stream_id: Number.parseInt(id)
  })

  return (
    <Layout>

     {/*  this was just for debug
     <section style={{ display: 'hidden' }}> 
        <div className="ad-notification" style={{top:"140px"}}>Google Ad ID <b style={{color:"#ffab00"}}>{adID}</b></div>
        <div className="ad-notification" style={{top:"150px"}}>Progress <b style={{color:"#ffab00"}}>{progress}</b></div>
        <div className="ad-notification" style={{top:"260px"}}>Timeleft <b style={{color:"#ffab00"}}>{timeLeft}</b></div>
      </section> */}


      {imHost !== null && caller.current && (
        <EstablishVertoSession
          userId={profile.id}
          isRoomPrivate={isRoomPrivate}
          volume={volume}
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
          className={`shared-stream-page  ${isFullscreen ? "fullscreen" : ""}`}
      >

        <section className="shared-stream-chat-section">
          {vertoSession.current && (
              <Chat
                  vlrId={streamVlr.current.vlrId}
                  session={vertoSession.current}
                  participants={participants}
                  show={showChat}
              />
          )}
        </section>

        <section className="shared-stream-room-section">

          {progress < 0.9 && <GoogleAdStream2 className="ads-image" adData={adData} setAdData={setAdData} />}
          
          {adID !== null && <GoogleAdStream id={adID} key={adID} className="ads-image" setAdData={setAdData} onDelay={setAdID} afterFunc={handlePlayerVolumeChange} adData={adData} />}

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
                logo={sharedStreamData.current.logo}
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
              <div className="stream-room-container">
                {
                    !vertoSession?.current?.hasSecondaryCall() &&
                    imHost &&
                    progress === 1 && (
                        <></>
                    )
                }

                <video
                    ref={roomRef}
                    muted
                    autoPlay
                    className={isFullscreen?"stream-room-video stream-room-video-fullscreen":"stream-room-video"} 
                    playsInline
                />

                {timeLeft && timeLeft > 0 && timeLeft < 16 && <div className="ad-notification">Ad Break in <b style={{color:"#ffab00"}}>{formatTime(timeLeft)}</b></div>}

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

              <PlayerBarStream
                  volume={volume}
                  onVolumeChange={handlePlayerVolumeChange}
              />
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
                  host={roomHost?.userId===profile.id}
                  isStreamRoom={true}
                  show={showParticipants}
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

export default SharedStreamPage;
