import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";
import VertoSession from "../../verto/VertoSession";
import {
  IonContent,
  IonHeader,
  IonPage,
  useIonViewWillEnter,
} from "@ionic/react";
import {Pause, Play, Repeat, Repeat1, StepBack, StepForward, Volume2, VolumeX, SquareIcon} from "lucide-react";
import { RouteComponentProps, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/types";
import { KeepAwake } from "@capacitor-community/keep-awake";
import useShowAdmobInterstitial from "../../admob/useShowAdmobInterstitial";
import { Participant } from "../../verto/models";
import {
  API_URL,
  LAYOUT_ID,
  MOBILE_VIEW,
  STREAM_URL,
} from "../../shared/constants";
import { App, AppState } from "@capacitor/app";
import RoomSidebar from "../../components/RoomSidebar";
import NoVideoCanvas from "../../components/NoVideoCanvas";
import Chat from "../../components/Chat";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import SelectRoomModal from "./SelectRoomModal";
import {
  EpgEntry,
  HTMLVideoStreamElement,
  SharedStream,
  UpdateMetadata,
  Vlr,
} from "../../shared/types";
import startStreamVlr from "./startStreamVlr";
import initStream from "./initStream";
import initVod from "../SharedStream/initVod";
import useBackButtonStream from "./useBackButtonStream";
import { StreamService, VlrService } from "../../services";
import StreamLoading from "./StreamLoading";
import RoomTopbar from "../../components/RoomTopbar";
import RoomMetadata from "../../components/RoomMetadata";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import { useTranslation } from "react-i18next";
import EstablishVertoSession from "./EstablishVertoSession";
import RoomVideoActions from "../../components/RoomVideoActions";
// import {NavigationBar} from '@hugotomazi/capacitor-navigation-bar';
import { streamLoadingStart } from "../../redux/actions/streamActions";
import { handleRoomExpand } from "../../shared/methods/handleRoomExpand";
import { Pip } from "capacitor-pip-plugin";
import { PluginListenerHandle } from "@capacitor/core";
import { Clear } from "capacitor-clear-plugin";
import setPrevRoute from "../../redux/actions/routeActions";
import { Routes } from "../../shared/routes";
import BaseService from "../../services/BaseService";
import { SharedVodService } from "../../services";

export const DEFAULT_CANVAS_FPS = 30;
const INITIAL_EMOJI = { show: false, selected: "" };

export type ChangeStreamParams = {
  streamName: string;
  streamUrl: string;
  isAdult: boolean;
  epgId?: number;
};

export type VlrModerator = {
  username: string;
  password: string;
};

export class JoinStreamVlr {
  vlrId: number;
  publicId: string;
  roomId: string;
  fsUrl: string;
  moderator: VlrModerator;
  upSpeedUrl: string;
  hostName: string;
  isMyRoom: boolean;

  constructor(vlr: Vlr) {
    this.vlrId = vlr.id;
    this.publicId = vlr.public_id;
    this.roomId = vlr.room_id;
    this.fsUrl = vlr.fs_url || "";
    this.moderator = {
      username: "",
      password: "",
    };
    this.upSpeedUrl = vlr.up_speed_url || "";
    this.hostName = vlr.host_name || "";
    this.isMyRoom = vlr.is_my_room || false;
  }
}

export interface StreamVlrBase {
  moderator: VlrModerator;
  roomId: string;
  publicId: string;
  fsUrl: string;
  vlrId: number;
  upSpeedUrl: string;
}

export interface StreamVlr extends StreamVlrBase {
  updateMetadata: boolean;
  hostName: string;
  isMyRoom: boolean;
}

export type UpdateStreamVlr = {
  username: string;
  password: string;
  updateMetadata: boolean;
};

type SwitchHost = {
  participants: Participant[];
  moderator: VlrModerator;
  vertoSession: VertoSession;
};

export const switchHost = ({
  participants,
  moderator,
  vertoSession,
}: SwitchHost) => {
  const participantsLeft = participants.filter(
    (p) => p.isActive && !p.me && !p.isHostSharedVideo && !p.isIos
  );

  if (participantsLeft.length) {
    const onPc = participantsLeft.find((p) => !p.isMobileApp);
    const nextHost = onPc || participantsLeft[0];
    const { username, password } = moderator;
    vertoSession.sendMessage.switchHostStream(
      nextHost.callId,
      username,
      password,
      nextHost.participantName
    );
  }
};

const VodRoomPage: FC<RouteComponentProps> = ({
  history,
}: RouteComponentProps) => {
  const { id, roomId } = useParams<{
    id: string | "camera";
    roomId?: string;
  }>();
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { nickname } = useSelector(({ profile }: ReduxSelectors) => profile);
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const { prevUrl } = useSelector(({ route }: ReduxSelectors) => route);

  const roomRef = useRef<HTMLVideoStreamElement>(null);
  const vertoSession = useRef<VertoSession | null>(null);
  const streamVlr = useRef<StreamVlr>({
    vlrId: 0,
    roomId: "",
    fsUrl: "",
    publicId: "",
    updateMetadata: true,
    moderator: { username: "", password: "" },
    upSpeedUrl: "",
    hostName: "",
    isMyRoom: false,
  });

  const noVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const sharedStreamData = useRef<SharedStream | null>(null);
  const doRedirect = useRef<boolean>(true);
  const caller = useRef<string>(
    nickname || `User_${new Date().getMilliseconds()}`
  );
  const participantsRef = useRef<Participant[]>([]);

  const [isRoomPrivate, setIsPrivateRoom] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showLoadingLeaveButton, setShowLoadingLeaveButton] =
    useState<boolean>(false);
  const [imHost, setImHost] = useState<boolean | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [emoji, setEmoji] = useState<{ show: boolean; selected: string }>(
    INITIAL_EMOJI
  );
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [openSelectRoomModal, setOpenSelectRoomModal] =
    useState<boolean>(false);
  const [vlrs, setVlrs] = useState<Vlr[]>([]);
  const [meMuted, setMeMuted] = useState<boolean>(true);
  const [camStopped, setCamStopped] = useState<boolean>(true);
  const [muteRoom, setMuteRoom] = useState<boolean>(true);
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const [screenIsExpanded, setScreenIsExpanded] = useState<boolean>(false);
  const [chatInputIsFocused, setChatInputIsFocused] = useState<boolean>(false);
  const [streamName, setStreamName] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamEpg, setStreamEpg] = useState<EpgEntry[]>([]);
  const [streamIsAdult, setStreamIsAdult] = useState<boolean>(false);
  const [adIsShowing, setAdIsShowing] = useState<boolean>(false);
  const [me, setMe] = useState<Participant>();
  const [isInPipMode, setIsInPipMode] = useState<boolean>(false);
  const [isAppActive, setIsAppActive] = useState<boolean>(true);
  const [vodData, setVodData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [loop, setLoop] = useState<boolean>(true);
  const [sessionReady, setSessionReady] = useState<boolean>(false);
  const [vodHasStarted, setVodHasStarted] = useState<boolean>(false);
  const [roomStarted, setRoomStarted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume2, setVolume2] = useState(1);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(0.1);
  const [vodStatus, setVodStatus] = useState<"Playing" | "Paused" | "Idle">("Playing");

  const handleRoomExit = useCallback(() => {
    console.log("Exiting VOD room...");
    setRoomStarted(false);

    if (imHost) {
      if (id === "camera") {
        vertoSession.current?.sendMessage.hostLeft();
      } else {
        let participantsLeft = participantsRef.current.filter(
          (p) => p.isActive && !p.me && !p.isHostSharedVideo
        );
        if (participantsLeft.length && vertoSession.current) {
          switchHost({
            participants: participantsLeft,
            moderator: streamVlr.current.moderator,
            vertoSession: vertoSession.current,
          });
        } else {
          vertoSession.current?.cleanupWebRTC();
          VlrService.sendFinalPing(
            streamVlr.current.publicId,
            profile.id
          ).then();
        }
      }
    }

    vertoSession.current?.cleanupWebRTC();
    vertoSession.current?.hangup();
  }, [imHost, id]);

  const handleRedirect = useCallback(() => {
    if (doRedirect.current) {
      setLoading(false);
      history.push(Routes.Broadcasts);
    }
  }, [history]);

  const handleSwitchHost = useCallback(
    (moderator: VlrModerator) => {
      if (vertoSession.current) {
        if (participantsRef.current.length > 1) {
          switchHost({
            participants: participantsRef.current,
            vertoSession: vertoSession.current,
            moderator,
          });
        } else {
          dispatch(setInfoToast("notifications.hostLeftRoom"));
          vertoSession.current?.hangup();
        }
      }
    },
    [dispatch]
  );

  const handleNoVideoTrack = useCallback((track: MediaStreamTrack) => {
    noVideoTrackRef.current = track;
  }, []);

  const handleEmojisClose = useCallback(() => {
    setEmoji((prevState) =>
      prevState.show ? { show: false, selected: "" } : prevState
    );
  }, []);

  const handleOnError = useCallback(
    (message: string) => {
      dispatch(setErrorToast(message));
      history.push(Routes.Broadcasts);
    },
    [dispatch, history]
  );

  const startNewRoom = useCallback(() => {
    if (roomStarted) {
      console.log("Room already started, skipping...");
      return;
    }
    console.log("Starting new VOD room...");
    setRoomStarted(true);
    startStreamVlr({
      onStart: (data: StreamVlrBase) => {
        console.log("VOD room started with data:", data);
        streamVlr.current = { ...streamVlr.current, ...data, isMyRoom: true };
        setImHost(true);
      },
      onError: handleOnError,
    });
  }, [handleOnError, roomStarted]);

  const joinRoom = useCallback((vlrParams: JoinStreamVlr) => {
    setOpenSelectRoomModal(false);
    streamVlr.current = { ...vlrParams, updateMetadata: false };
    setImHost(false);
  }, []);

  const backButtonListener = useCallback(() => {
    doRedirect.current = false;
    handleRoomExit();
  }, [handleRoomExit]);

  const handleCancelRoomEnter = useCallback(() => {
    setLoading(false);

    if (vertoSession.current?.hasPrimaryCall()) {
      vertoSession.current.hangup();
    } else {
      history.push(Routes.Broadcasts);
    }
  }, [history]);

  const handleDismissLoading = useCallback((reconnecting: boolean) => {
    if (roomRef.current?.paused) {
      roomRef.current.play().then();
    }
    if (!reconnecting) {
      setMuteRoom(false);
    }
    setReconnecting(false);
    setLoading(false);
  }, []);

  const handleParticipantsChange = useCallback(
    (participants: Participant[]) => {
      setParticipants(participants);

      setMe((prev) => {
        if (prev) {
          return prev;
        }
        return participants.find((p) => p.me);
      });
    },
    []
  );

  const handleUpdateStreamVlr = useCallback(
    ({ username, password, updateMetadata }: UpdateStreamVlr) => {
      streamVlr.current.moderator.username = username;
      streamVlr.current.moderator.password = password;
      streamVlr.current.updateMetadata = updateMetadata;
    },
    []
  );

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

  const handleImHostChange = useCallback((value: boolean) => {
    setImHost(value);
  }, []);

  // VOD command functions
  const getVodName = (vodUrl: string): string => {
    const url = new URL(vodUrl);
    if (vodUrl.includes("records/")) {
      return "records/" + url.pathname.split("/").pop() || "";
    } else {
      return url.pathname.split("/").pop() || "";
    }
  };

  const sendVodPlayCommand = useCallback(() => {
    if (vodData?.url && vertoSession.current) {
      const vodName = getVodName(vodData.url);
      console.log("Sending VOD play command:", vodName);
      vertoSession.current.sendDebugAction("vod_play", `${vodName}`);
      vertoSession.current.sendDebugAction("vid-layout", "1up_top_left+9_orig");
    }
  }, [vodData]);

  const sendVodStopCommand = useCallback(() => {
    if (vodData?.url && vertoSession.current) {
      const vodName = getVodName(vodData.url);
      vertoSession.current.sendDebugAction("a_play_stop", `${vodName}`);
    }
  }, [vodData]);

  const sendVodPauseCommand = useCallback(() => {
    if (vodData?.url && vertoSession.current) {
      const vodName = getVodName(vodData.url);
      vertoSession.current.sendDebugAction("a_play_pause", `${vodName}`);
    }
  }, [vodData]);

  const sendVodResumeCommand = useCallback(() => {
    if (vodData?.url && vertoSession.current) {
      const vodName = getVodName(vodData.url);
      vertoSession.current.sendDebugAction("a_play_resume", `${vodName}`);
    }
  }, [vodData]);

  const sendVodSeekCommand = useCallback((seekTimeMs: number) => {
    if (vertoSession.current) {
      vertoSession.current.sendDebugAction("a_play_seek", `${seekTimeMs}`);
    }
  }, []);

  const sendVodVolumeCommand = useCallback((volume: number) => {
    if (vertoSession.current) {
      // Convert volume (0-1) to dB (-50 to 0)
      const volumeDb = volume * 50 - 50;
      vertoSession.current.sendDebugAction("a_play_volume", `${volumeDb}`);
    }
  }, []);

  const sendVodLoopCommand = useCallback(
    (enableLoop: boolean) => {
      if (vodData?.url && vertoSession.current) {
        if (enableLoop) {
          const vodName = getVodName(vodData.url);
          vertoSession.current.sendDebugAction("a_vod_loop", `${vodName}`);
        } else {
          vertoSession.current.sendDebugAction("a_vod_loop", "");
        }
      }
    },
    [vodData]
  );

  const togglePlay = async () => {
    if (roomRef.current && vodData?.url) {
        const vodName = getVodName(vodData.url);
        if(vodStatus === "Idle"){
            console.log('idle called and play')
            vertoSession.current?.sendDebugAction("vod_play", `${vodName}`);
        }
        else{
            if (roomRef.current.paused) {
                console.log('roomRef.current.play')
                vertoSession.current?.sendDebugAction("a_play_resume", `${vodName}`)
            } else {
                console.log('roomRef.current.pause')
                vertoSession.current?.sendDebugAction("a_play_pause", `${vodName}`)
            }
        }
    }
};

  const toggleStatus = async () => {
    if (roomRef.current && vodData?.url) {
       const vodName = getVodName(vodData.url);
      if (vodStatus === "Idle") {
        vertoSession.current?.sendDebugAction("vod_play", `${vodName}`);
      } else {
        console.log('a_play_stop')
        vertoSession.current?.sendDebugAction("a_play_stop", "");
      }
    }
  };
  
  const handleLoop = (): void => {
    setLoop(!loop);
    sendVodLoopCommand(!loop);
    if(loop){
      dispatch(setInfoToast("Loop mode turned off"));
    }
    else{
      dispatch(setInfoToast("Loop mode turned on"));
    }
  }

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) {
      return "00:00";
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (seekAmount: number, prefix: string): void => {
    vertoSession.current?.sendDebugAction("a_play_seek", `${prefix}${seekAmount * 1000}`);
  }

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
  
  const updateVolumeWithCommand=(newVolume: number)=>{
    // we use -50 instead of -100 because the volume gain is to small , so at -50 the volume is already null
    newVolume=(newVolume * 50) - 50;
    vertoSession.current?.sendDebugAction("a_play_volume", `${newVolume}`)
  }

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

  const handleVertoSessionChange = useCallback(
    (session: VertoSession) => {
      console.log("handleVertoSessionChange called");
      vertoSession.current = session;
      setSessionReady(true);
      console.log("VertoSession established for VOD room");

      vertoSession.current?.notification.onWebSocketReconnecting.subscribe(
        () => {
          setLoading(true);
          setReconnecting(true);
        }
      );

      vertoSession.current?.notification.onChatMessageStreamChange.subscribe(
        (params) => {
          if (sharedStreamData.current) {
            sharedStreamData.current.url = params.streamUrl;
            sharedStreamData.current.name = params.streamName;
            sharedStreamData.current.is_adult_content = params.isAdult;
          }
          updateStreamParams(params);
        }
      );

      // Handle VOD WebSocket messages from FreeSWITCH
      vertoSession.current?.notification.onWebSocketMessage.subscribe(
        (message: any) => {
          if (message.method == "verto.event") {
            let data = message.params?.eventData?.message;
            console.log("VOD WebSocket message from FreeSWITCH:", data);
            if (data) {
              let fixed = data.replace(/"([^"]+)"="?([^"]+)"?/g, '"$1":"$2"');
              let json;
              try {
                json = JSON.parse(fixed);

                if (json["playing"] && json["playing"]["Duration"] !== null) {
                  const [numerator, denominator] = json["playing"]["Duration"]
                    .split("/")
                    .map(Number);
                  const preDuration = numerator / denominator;
                  setProgress(preDuration * 100);
                  setCurrentTime(numerator / 100000);
                  setDuration(denominator / 100000);
                }

                if (
                  json["playing"] &&
                  json["playing"]["Status"] === "Playing"
                ) {
                  setIsPlaying(true);
                  setVodHasStarted(true);
                  setVodStatus('Playing') // Mark that VOD has started playing at least once
                } else if (
                  json["playing"] &&
                  json["playing"]["Status"] !== "Playing"
                ) {
                  setIsPlaying(false);
                }

                // Auto-restart if loop is enabled and VOD is not playing
                // Only auto-restart after initial setup is complete to avoid duplicate commands
                // Only auto-restart if VOD has actually started playing at least once
                if (
                  json["playing"] &&
                  json["playing"]["Status"] !== "Playing" &&
                  loop &&
                  vodData?.url &&
                  vodHasStarted
                ) {
                  console.log("Auto-restart conditions check:", {
                    hasPlayingData: !!json["playing"],
                    status: json["playing"]?.Status,
                    loop,
                    hasVodData: !!vodData?.url,
                    vodHasStarted,
                    currentTime,
                    duration,
                  });

                  // Only auto-restart if VOD has actually finished (current time is close to duration)
                  if (
                    duration > 0 &&
                    currentTime > 0 &&
                    duration - currentTime < 1
                  ) {
                    console.log(
                      "Auto-restarting VOD due to loop mode - VOD has finished"
                    );
                    const vodName = getVodName(vodData.url);
                    vertoSession.current?.sendDebugAction(
                      "vod_play",
                      `${vodName}`
                    );
                    vertoSession.current?.sendDebugAction(
                      "vid-layout",
                      "1up_top_left+9_orig"
                    );
                  } else {
                    console.log("VOD not finished yet, skipping auto-restart");
                  }
                }
              } catch (err: any) {
                console.error("Error parsing VOD message:", err.message);
              }
            }
          }
        }
      );
    },
    [
      updateStreamParams,
      loop,
      vodData,
      vodHasStarted,
      dispatch,
    ]
  );

  const handleRemoveStream = useCallback(() => {
    if (sharedStreamData.current) {
      sharedStreamData.current.id = 0;
    }
    setStreamName("");
    setStreamUrl(null);
  }, []);

  // Send VOD commands when session is ready and VOD data is available
  useEffect(() => {
    console.log("VOD Commands useEffect triggered:", {
      sessionReady,
      vodDataUrl: vodData?.url,
    });

    if (sessionReady && vodData?.url) {
      console.log("Sending initial VOD commands to FreeSWITCH:", vodData.url);
      
      // Send VOD play command directly here instead of using the callback
      const vodName = getVodName(vodData.url);
      // vertoSession.current?.sendDebugAction("vod_play", `${vodName}`);
      setVodStatus('Playing')
      vertoSession.current?.sendDebugAction(
        "vid-layout",
        "1up_top_left+9_orig"
      );

      // Send loop command (always send loop command initially)
      // vertoSession.current?.sendDebugAction("a_vod_loop", `${vodName}`);

      // Mark initial setup as complete after a short delay to allow for WebSocket messages
      setTimeout(() => {
        console.log("Initial VOD setup complete - auto-restart now enabled");
      }, 2000);
    }
  }, [sessionReady, vodData?.url]);

  // Reset session ready when VOD data changes (for different VODs)

  useEffect(() => {
    setSessionReady(false);
    setVodHasStarted(false);
    setRoomStarted(false);
  }, [vodData?.id]);

  // Handle loop changes after initial commands are sent
  // useEffect(() => {
  //   if (sessionReady && vodData?.url) {
  //     const vodName = getVodName(vodData.url);
  //     if (loop) {
  //       vertoSession.current?.sendDebugAction("a_vod_loop", `${vodName}`);
  //     } else {
  //       vertoSession.current?.sendDebugAction("a_vod_loop", ``);
  //     }
  //   }
  // }, [loop, sessionReady, vodData?.url]);

  useBackButtonStream(backButtonListener);

  useIonViewWillEnter(() => {
    // Use initVod for VOD content and initStream for camera/streams
    if (id && id !== "camera") {
      // This is a VOD ID - use initVod
      console.log("[DEBUG] initVod");
      initVod({
        id,
        roomId,
        onVodData: (vodData) => {
          // Set VOD data for the room
          setVodData(vodData);
          setStreamName(vodData.name);
          setStreamUrl(vodData.url);
          setStreamIsAdult(vodData.is_adult_content || false);
          setIsPrivateRoom(vodData.is_adult_content || false);
          
          // Update shared stream data
          sharedStreamData.current = vodData;
        },
        onStartNewRoom: startNewRoom,
        onJoinRoom: (vlr: Vlr) => {
          // Convert Vlr to JoinStreamVlr for compatibility
          const joinStreamVlr = new JoinStreamVlr(vlr);
          joinRoom(joinStreamVlr);
        },
        onShowVlrOptions: (vlrs: Vlr[]) => {
          setVlrs(vlrs);
          setOpenSelectRoomModal(true);
        },
        onError: handleOnError,
        onExit: () => {
          dispatch(setErrorToast("VOD not found"));
          history.push(Routes.Broadcasts);
        },
      });
    } else {
      // For non-VOD rooms (camera), use the existing initStream logic
      console.log("[DEBUG] initStream");
      initStream({
        id,
        roomId,
        onStreamData: (streamVlrs) => (sharedStreamData.current = streamVlrs),
        onStartNewRoom: startNewRoom,
        onJoinRoom: joinRoom,
        onShowVlrOptions: (vlrs: Vlr[]) => {
          setVlrs(vlrs);
          setOpenSelectRoomModal(true);
        },
        onError: handleOnError,
        onExit: () => {
          dispatch(setInfoToast("notifications.roomNotActive"));
          history.push(Routes.Broadcasts);
        },
      });
    }
  }, [id, roomId, joinRoom, startNewRoom, handleOnError, dispatch]);

  useEffect(() => {
    setLoading(true);
    Pip.enable().then();
    let pipListener: PluginListenerHandle;
    Pip.addListener("pipModeChange", ({ isInPictureInPictureMode }) => {
      setIsInPipMode(isInPictureInPictureMode);
    }).then((value) => (pipListener = value));

    let appStateChangeListener: PluginListenerHandle;
    App.addListener("appStateChange", ({ isActive }: AppState) => {
      setIsAppActive(isActive);
    }).then((value) => (appStateChangeListener = value));

    MOBILE_VIEW && KeepAwake.keepAwake().then();

    if (
      profile.jwtToken &&
      !BaseService.isExpired(profile.jwtToken) &&
      prevUrl
    ) {
      dispatch(setPrevRoute(""));
    } else if (
      profile.jwtToken &&
      !BaseService.isExpired(profile.jwtToken) &&
      profile.isAnonymous &&
      !prevUrl
    ) {
      history.push(Routes.Login);
    } else if (profile.jwtToken && BaseService.isExpired(profile.jwtToken)) {
      history.push(Routes.Login);
    }

    return () => {
      setLoading(false);
      // NavigationBar.show().then();
      Pip.disable().then();
      pipListener?.remove().then();
      appStateChangeListener?.remove().then();
      MOBILE_VIEW && KeepAwake.allowSleep().then();
      Clear.clearCache().then();
    };
  }, []);

  useEffect(() => {
    const listener = () => {
      setLoading(false);
      handleRoomExit();
    };
    document.addEventListener("ionBackButton", listener);

    return () => {
      document.removeEventListener("ionBackButton", listener);
    };
  }, [handleRoomExit]);

  useEffect(() => {
    participantsRef.current = participants;
    const participantMe = participants.find((p) => p.me);
    participantMe && setMeMuted(participantMe.audio.muted);
    participantMe && setCamStopped(participantMe.video.muted);
  }, [participants]);

  useEffect(() => {
    setShowLoadingLeaveButton(false);

    // Leave button timeout
    if (loading && !openSelectRoomModal) {
      const timeLoadingTimeout = setTimeout(
        () => setShowLoadingLeaveButton(true),
        15000
      );

      return () => {
        clearTimeout(timeLoadingTimeout);
      };
    }
  }, [loading, openSelectRoomModal]);

  useEffect(() => {
    if (!isInPipMode && !isAppActive) {
      handleRoomExit();
    }
  }, [isInPipMode, isAppActive, handleRoomExit]);

  useEffect(() => {
    if (sharedStreamData.current) {
      setStreamName(sharedStreamData.current.name);
      setStreamUrl(sharedStreamData.current.url);
      setStreamIsAdult(sharedStreamData.current?.is_adult_content || false);
      setIsPrivateRoom(sharedStreamData.current?.is_adult_content || false);
      setStreamEpg(sharedStreamData.current?.epg_channel?.entries || []);
    }

    // console.log("imHost", imHost, "streamVlr", streamVlr.current, "sharedshared", sharedStreamData.current)

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

  const handleOnShowInterstitial = useCallback(() => {
    setAdIsShowing(true);
  }, []);

  const handleOnCloseInterstitial = useCallback(() => {
    setAdIsShowing(false);
  }, []);

  useShowAdmobInterstitial({
    onShow: handleOnShowInterstitial,
    onClose: handleOnCloseInterstitial,
  });

  const handleChatClick = () => {
    if (showChat) {
      setEmoji({ show: false, selected: "" });
    }
    setShowChat(!showChat);
  };

  const handleOnStartNewRoomModal = () => {
    setOpenSelectRoomModal(false);
    startNewRoom();
  };

  const handleOnCancelModal = () => {
    setLoading(false);
    setOpenSelectRoomModal(false);
    history.push(Routes.Broadcasts);
  };

  const handleOnExpandChange = () => {
    handleRoomExpand(!screenIsExpanded);
    setScreenIsExpanded(!screenIsExpanded);
    setEmoji((prevState) =>
      prevState.show ? { ...prevState, show: false } : prevState
    );
  };

  const handleChangeStream = ({
    id,
    name,
    url,
    logo,
    is_adult_content,
    epg_channel,
  }: SharedStream) => {
    StreamService.openStream(url).finally(() => {
      VlrService.patchMetadata({
        channelName: `${name} ${t("sharedStream.by")} ${caller.current}`,
        streamId: id,
        publicId: streamVlr.current.publicId,
        logo,
        isPrivate: is_adult_content ? true : isRoomPrivate,
      }).then();
      const params: ChangeStreamParams = {
        streamName: name,
        streamUrl: url,
        isAdult: is_adult_content || false,
        epgId: epg_channel?.id,
      };
      vertoSession.current?.sendMessage.streamChange(params);
      updateStreamParams(params);
      dispatch(streamLoadingStart());
    });
  };

  return (
    <IonPage
      id={LAYOUT_ID}
      className={`stream-lr-page${
        chatInputIsFocused || emoji.show ? " keyboard-is-open" : ""
      }`}
    >
      {imHost !== null && noVideoTrackRef.current && (
        <EstablishVertoSession
          isRoomPrivate={isRoomPrivate}
          imHost={imHost}
          hostShareCamera={id === "camera"}
          isVodRoom={id !== "camera"}
          caller={caller.current}
          roomRef={roomRef}
          streamVlr={streamVlr.current}
          streamName={streamName}
          streamUrl={streamUrl}
          noVideoTrack={noVideoTrackRef.current}
          onVertoSession={handleVertoSessionChange}
          onDismissLoading={handleDismissLoading}
          onParticipants={handleParticipantsChange}
          onRoomExit={handleRoomExit}
          onUpdateStreamVlr={handleUpdateStreamVlr}
          onImHost={handleImHostChange}
          onRedirect={handleRedirect}
          onSwitchHost={handleSwitchHost}
          onRemoveStream={handleRemoveStream}
        />
      )}

      <IonHeader
        className={`${screenIsExpanded || isInPipMode ? "ion-hide" : ""}`}
      >
        <RoomTopbar
          inPipMode={isInPipMode}
          showPushInvite={(imHost && !isRoomPrivate) || false}
          roomPublicId={streamVlr.current.publicId}
          inviteUrl={`${STREAM_URL}/${id}/${streamVlr.current.publicId}`}
          vertoSession={vertoSession.current}
          onExit={handleRoomExit}
        />
      </IonHeader>

      <IonContent>
        <StreamLoading
          loading={loading}
          imHost={imHost}
          showLeaveButton={showLoadingLeaveButton}
          streamVlr={streamVlr.current}
          reconnecting={reconnecting}
          onLeave={handleCancelRoomEnter}
        />

        <div
          className={`stream-content-holder${
            screenIsExpanded ? " controllers-hidden" : ""
          }${isInPipMode ? " in-pip" : ""} ${loading ? "ion-hide" : ""}`}
        >
          <RoomMetadata
            imHost={imHost}
            screenIsExpanded={screenIsExpanded}
            inPipMode={isInPipMode}
            streamName={streamName}
            numberOfParticipants={participants.length}
            epgEntries={streamEpg}
          />

          <div className={`stream-holder${imHost ? " im-host" : ""}`}>
            {vertoSession.current && (
              <RoomVideoActions
                inPipMode={isInPipMode}
                streamId={id}
                showDebugInfoButton
                isAdult={streamIsAdult}
                isPrivate={isRoomPrivate}
                vertoSession={vertoSession.current}
                publicId={streamVlr.current.publicId}
                isExpanded={screenIsExpanded}
                screenControllersAreHidden={screenIsExpanded}
                imHost={imHost}
                showChat={showChat}
                muteRoom={muteRoom}
                onMuteRoom={() => setMuteRoom(!muteRoom)}
                onExpandChange={handleOnExpandChange}
                onChangeStream={handleChangeStream}
                onChangeRoomStatus={setIsPrivateRoom}
              />
            )}
            <video
              ref={roomRef}
              playsInline
              className="room-video"
              muted={reconnecting || muteRoom || loading}
              onDoubleClick={handleOnExpandChange}
            />

          <div  className="controls-row">
            <div className="left-controls">
              <button className="control-button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              {vodStatus !== "Idle" &&  <button className="control-button" onClick={toggleStatus} aria-label={isPlaying ? 'Pause' : 'Play'}>
                    <SquareIcon size={20} className={'text-red-500'} />
                </button>}


              <button className="control-button" onClick={handleLoop} aria-label="Restart">
                {
                  loop ? <Repeat size={18} /> : <Repeat1 size={18} />
                }
              </button>

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
                {sharedStreamData.current?.duration && <b style={{ color:"#ffab00" }}>{formatTime(sharedStreamData.current?.duration)}</b>}
              </div>


            </div>

            <div className="center-controls">



            </div>

            <div className="right-controls">


            </div>
          </div>

            <NoVideoCanvas onVideoTrack={handleNoVideoTrack} />
          </div>

          <div
            className={`room-footer ${emoji.show ? "emojis-are-open" : ""} ${
              showChat ? "chat-is-open" : ""
            } ${screenIsExpanded || isInPipMode ? "ion-hide" : ""}`}
          >
            <div className={`interactions-holder`}>
              {vertoSession.current && noVideoTrackRef.current && (
                <RoomSidebar
                  me={me}
                  adIsShowing={adIsShowing}
                  hostShareCamera={id === "camera"}
                  meMuted={meMuted}
                  meCamStopped={camStopped}
                  showChat={showChat}
                  vertoSession={vertoSession.current}
                  noVideoTrack={noVideoTrackRef.current}
                  onChatClick={handleChatClick}
                />
              )}

              {vertoSession.current && (
                <Chat
                  vlrId={streamVlr.current.vlrId}
                  session={vertoSession.current}
                  participants={participants}
                  show={showChat}
                  emoji={emoji}
                  onOpenEmojis={() =>
                    setEmoji((prevState) => ({
                      show: !prevState.show,
                      selected: "",
                    }))
                  }
                  onCloseEmojis={handleEmojisClose}
                  onInputStateChange={setChatInputIsFocused}
                />
              )}
            </div>
          </div>
        </div>

        <div
          className="emojis-holder"
          hidden={!emoji.show || !showChat || isInPipMode}
        >
          {/* <Picker
            theme="dark"
            style={{width: 'auto'}}
            onSelect={(emoji: BaseEmoji) => setEmoji({show: true, selected: emoji.native})}
            showPreview={false}
          /> */}
          <Picker
            data={data}
            theme="dark"
            onEmojiSelect={(emoji: any) =>
              setEmoji({ show: true, selected: emoji.native })
            }
            previewPosition="none"
            style={{ width: "auto" }}
          />
        </div>

        <SelectRoomModal
          open={openSelectRoomModal}
          vlrs={vlrs}
          onStartNewRoom={handleOnStartNewRoomModal}
          onJoinRoom={joinRoom}
          onCancel={handleOnCancelModal}
        />
      </IonContent>
    </IonPage>
  );
};

export default VodRoomPage;
