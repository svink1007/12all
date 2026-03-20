import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";
import VertoSession from "../../verto/VertoSession";
import {
  IonContent,
  IonHeader,
  IonPage,
  useIonViewWillEnter,
} from "@ionic/react";
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

const SharedStreamPage: FC<RouteComponentProps> = ({
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

  const handleRoomExit = useCallback(() => {
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
    startStreamVlr({
      onStart: (data: StreamVlrBase) => {
        streamVlr.current = { ...streamVlr.current, ...data, isMyRoom: true };
        setImHost(true);
      },
      onError: handleOnError,
    });
  }, [handleOnError]);

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

  const handleVertoSessionChange = useCallback(
    (session: VertoSession) => {
      vertoSession.current = session;

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
    },
    [updateStreamParams]
  );

  const handleRemoveStream = useCallback(() => {
    if (sharedStreamData.current) {
      sharedStreamData.current.id = 0;
    }
    setStreamName("");
    setStreamUrl(null);
  }, []);

  useBackButtonStream(backButtonListener);

  useIonViewWillEnter(() => {
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
              autoPlay
              muted={reconnecting || muteRoom || loading}
              onDoubleClick={handleOnExpandChange}
            />
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

export default SharedStreamPage;
