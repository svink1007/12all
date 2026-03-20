import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import "./RoomWatchPartyPage.scss";
import VertoSession from "../../verto/VertoSession";
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonImg,
  IonModal,
  IonPage,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps, useParams } from "react-router";
import Chat from "../../components/Chat";
import { Participant } from "../../verto/models";
import defaultLogo from "../../images/12all-logo-128.svg";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/types";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import appStorage from "../../shared/appStorage";
import { Routes } from "../../shared/routes";
import useShowAdmobInterstitial from "../../admob/useShowAdmobInterstitial";
import { API_URL, MOBILE_VIEW } from "../../shared/constants";
import RoomTopbar from "../../components/RoomTopbar";
import RoomSideBar from "../../components/RoomSidebar";
import NoVideoCanvas from "../../components/NoVideoCanvas";
import RoomVideoActions from "../../components/RoomVideoActions";
import RoomMetadata from "../../components/RoomMetadata";
import { handleRoomExpand } from "../../shared/methods/handleRoomExpand";
import getMediaStreamPermission from "../../shared/methods/getMediaStreamPermission";
import { FakeAudioTrack } from "../../models/FakeAudioTrack";
import { HTMLVideoStreamElement } from "../../shared/types";
import { Pip } from "capacitor-pip-plugin";
import { PluginListenerHandle } from "@capacitor/core";
import { Socket } from "socket.io-client";
import { initRoomSocket } from "../../shared/methods/initRoomSocket";
import { App, AppState } from "@capacitor/app";
import validateVlr from "../../shared/validateVlr";

const INITIAL_EMOJI = { show: false, selected: "" };

const RoomWatchPartyPage: FC<RouteComponentProps> = ({
  history,
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const {
    fsUrl,
    roomId,
    mappedRoomId,
    channelLogo,
    publicRoomId,
    vlrId,
    moderatorUsername,
    moderatorPassword,
    channel,
    isHost,
    joinRoomWithCoHost,
  } = useSelector(({ livingRoom }: ReduxSelectors) => livingRoom);
  const { userCameraMaxWidth } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );

  const roomLayout = useSelector(
    ({ roomLayout }: ReduxSelectors) => roomLayout
  );

  console.log("ROOMLAYOUT:", roomLayout);

  const roomRef = useRef<HTMLVideoStreamElement>(null);
  const vertoSession = useRef<VertoSession | null>(null);
  const exiting = useRef<boolean>(false);
  const fakeAudioTrack = useRef<FakeAudioTrack>(new FakeAudioTrack());
  const noVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const socket = useRef<Socket>();
  const timeLoadingRef = useRef<NodeJS.Timeout>();

  const [loading, setLoading] = useState<boolean>(true);
  const [showLoadingCancel, setShowLoadingCancel] = useState<boolean>(false);
  const [alertState, setAlertState] = useState<{ show: boolean; mic: boolean }>(
    { show: false, mic: false }
  );
  const [showChat, setShowChat] = useState<boolean>(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [emoji, setEmoji] = useState<{ show: boolean; selected: string }>(
    INITIAL_EMOJI
  );
  const [meMuted, setMeMuted] = useState<boolean>(true);
  const [camStopped, setCamStopped] = useState<boolean>(true);
  const [muteRoom, setMuteRoom] = useState<boolean>(false);
  const [screenIsExpanded, setScreenIsExpanded] = useState<boolean>(false);
  const [chatInputIsFocused, setChatInputIsFocused] = useState<boolean>(false);
  const [adIsShowing, setAdIsShowing] = useState<boolean>(false);
  const [isInPipMode, setIsInPipMode] = useState<boolean>(false);
  const [isAppActive, setIsAppActive] = useState<boolean>(true);
  const [validated, setValidated] = useState<boolean>(false);

  const handleRoomExit = useCallback(() => {
    if (vertoSession.current) {
      vertoSession.current?.cleanupWebRTC();
      vertoSession.current.hangup();
      vertoSession.current = null;
    } else {
      history.replace(Routes.WatchPartyJoin);
    }
  }, [history]);

  useEffect(() => {
    const listener = () => {
      exiting.current = true;
      setLoading(false);
      vertoSession.current?.cleanupWebRTC();
      vertoSession.current?.hangup();
    };
    const fakeAudioTrackRef = fakeAudioTrack.current;

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
    document.addEventListener("ionBackButton", listener);

    return () => {
      document.removeEventListener("ionBackButton", listener);
      vertoSession.current?.cleanupWebRTC();
      vertoSession.current?.hangup();
      Pip.disable().then();
      pipListener?.remove().then();
      appStateChangeListener?.remove().then();
      MOBILE_VIEW && KeepAwake.allowSleep().then();
      setLoading(false);
      fakeAudioTrackRef.stopTrack();
      socket.current?.disconnect();
      timeLoadingRef.current && clearTimeout(timeLoadingRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isInPipMode && !isAppActive) {
      handleRoomExit();
    }
  }, [isInPipMode, isAppActive, handleRoomExit]);

  // Validate publicRoomId and decide where to navigate or proceed to connect
  useEffect(() => {
    appStorage.setItem("wpRoomId", id).then();

    validateVlr(id, dispatch)
      .then(({ streamId, streamCamera }) => {
        if (streamId) {
          history.replace(`${Routes.ProtectedStream}/${streamId}/${id}`);
          return;
        }
        if (streamCamera) {
          history.replace(`${Routes.ProtectedStreamCamera}/${id}`);
          return;
        }
        // It is a watch-party room. Proceed to connect.
        setValidated(true);
      })
      .catch((err) => {
        dispatch(setErrorToast(err.message));
        history.replace(Routes.WatchPartyJoin);
      });
  }, [id, dispatch, history]);

  useEffect(() => {
    if (!validated) {
      return;
    }

    const redirect = () => {
      timeLoadingRef.current && clearTimeout(timeLoadingRef.current);
      history.replace(Routes.WatchPartyJoin);
    };

    const connect = async () => {
      console.log("connect function called");
      let reconnect = false;
      setLoading(true);
      console.log("Set loading to true");

      timeLoadingRef.current = setTimeout(
        () => setShowLoadingCancel(true),
        10000
      );

      const userMedia = await getMediaStreamPermission(
        fakeAudioTrack.current.getTrack(),
        noVideoTrackRef.current as MediaStreamTrack
      );
      if (!userMedia) {
        console.log("No userMedia, redirecting");
        dispatch(setErrorToast("sharedStream.givePermission"));
        redirect();
        return;
      }

      console.log("Got userMedia:", userMedia);

      const realNumber = roomId,
        streamNumber = `${roomId}_stream`;

      console.log("Creating VertoSession with:", {
        realNumber,
        streamNumber,
        callerName: profile.nickname,
        fsUrl,
        isHost,
        channelName: channel.name,
        destinationNumber: `${roomId}_720_with_stream`,
        connectionType: "watch_party_camera",
      });

      const vs = new VertoSession({
        realNumber,
        streamNumber,
        callerName: profile.nickname,
        localStream: userMedia,
        giveFloor: isHost,
        fsUrl,
        isHost,
        isHostSharedVideo: false,
        channelName: channel.name,
        moderatorUsername,
        moderatorPassword,
        userId: profile.id,
        outgoingBandwidth: 500,
        incomingBandwidth: 1500,
        notifyOnStateChange: true,
        destinationNumber: `${roomId}_720_with_stream`,
        connectionType: "watch_party_camera",
      });

      console.log("VertoSession created:", vs);
      vertoSession.current = vs;

      vs.notification.failToConnectToWs.subscribe(() => {
        console.log("failToConnectToWs called");
        timeLoadingRef.current && clearTimeout(timeLoadingRef.current);
        dispatch(setErrorToast("userLivingRoom.failToConnectToWs"));
        redirect();
      });

      vs.notification.onPlayRemoteVideo.subscribe((stream: MediaStream) => {
        console.log("onPlayRemoteVideo called with stream:", stream);
        if (!roomRef?.current) {
          console.log("roomRef.current is null");
          return;
        }

        timeLoadingRef.current && clearTimeout(timeLoadingRef.current);

        console.log("Setting loading to false in onPlayRemoteVideo");
        setLoading(false);

        if (!socket.current) {
          console.log("Initializing socket in onPlayRemoteVideo");
          socket.current = initRoomSocket({
            userId: profile.id,
            callId: vs.primaryCallId as string,
            vlrId,
            nickname: profile.nickname,
            isHost: false,
            isVlr: true,
          });
        }

        roomRef.current.srcObject = stream;
        console.log("Set roomRef.current.srcObject to stream");
      });

      vs.notification.onPrimaryCallRemoteStream.subscribe(
        (remoteMediaStream: MediaStream) => {
          console.log(
            "onPrimaryCallRemoteStream called with stream:",
            remoteMediaStream
          );
          if (!roomRef?.current) {
            console.log("roomRef.current is null in onPrimaryCallRemoteStream");
            return;
          }

          console.log("roomRef.current.srcObject", roomRef.current.srcObject);
          console.log("remotestream", remoteMediaStream);

          timeLoadingRef.current && clearTimeout(timeLoadingRef.current);

          console.log("Setting loading to false in onPrimaryCallRemoteStream");
          setLoading(false);

          if (!socket.current) {
            console.log("Initializing socket in onPrimaryCallRemoteStream");
            socket.current = initRoomSocket({
              userId: profile.id,
              callId: vs.primaryCallId as string,
              vlrId,
              nickname: profile.nickname,
              isHost: false,
              isVlr: true,
            });
          }

          roomRef.current.srcObject = remoteMediaStream;
          console.log("Set roomRef.current.srcObject to remoteMediaStream");
        }
      );

      vs.notification.onAskToUnmuteMic.subscribe(() => {
        setAlertState({ show: true, mic: true });
      });

      vs.notification.onAskToStartCam.subscribe(() => {
        setAlertState({ show: true, mic: false });
      });

      vs.notification.onBootstrappedParticipants.subscribe(
        (bootParticipants: Participant[]) => {
          console.log(
            "onBootstrappedParticipants called with:",
            bootParticipants
          );
          const sortParticipants = (participants: Participant[]) =>
            participants.sort((a, b) => (b.me === a.me ? 0 : b.me ? 1 : -1));

          const filteredParticipants = bootParticipants.filter((p) => p.showMe);
          setParticipants((prev) =>
            sortParticipants([...prev, ...filteredParticipants])
          );

          const me = bootParticipants.find((p) => p.me);
          if (me) {
            setMeMuted(me.audio.muted);
            setCamStopped(me.video.muted);
            !me.audio.muted && vs.togglePrimaryMic();
            !me.video.muted && vs.togglePrimaryCam();
          }

          // Set loading to false when participants are bootstrapped as a fallback
          timeLoadingRef.current && clearTimeout(timeLoadingRef.current);
          console.log("Setting loading to false in onBootstrappedParticipants");
          setLoading(false);
        }
      );

      vs.notification.onAddedParticipant.subscribe(
        (participant: Participant) => {
          if (participant.showMe) {
            setParticipants((prev) => [...prev, participant]);
          }
        }
      );

      const modifyParticipantId =
        vs.notification.onModifiedParticipant.subscribe(
          (participant: Participant) => {
            if (participant.me) {
              setMeMuted(participant.audio.muted);
              setCamStopped(participant.video.muted);
            }

            setParticipants((prevState) => {
              const part = prevState.find(
                (p) =>
                  p.callId === participant.callId &&
                  p.audio.muted === participant.audio.muted &&
                  p.video?.muted === participant.video?.muted
              );
              return part
                ? prevState
                : prevState.map((p) =>
                    p.callId === participant.callId ? participant : p
                  );
            });
          }
        );

      const removeParticipationSubscriber =
        vs.notification.onRemovedParticipant.subscribe(
          (participant: Participant) => {
            setParticipants((prev) =>
              prev.filter((p) => p.callId !== participant.callId)
            );
          }
        );

      vs.notification.onYouHaveBeenRemoved.subscribe(() => {
        console.log("onYouHaveBeenRemoved called");
        timeLoadingRef.current && clearTimeout(timeLoadingRef.current);
        dispatch(setInfoToast("userLivingRoom.youHaveBeenRemoved"));
        vs.hangup();
      });

      vs.notification.onYouHaveBeenBlocked.subscribe(() => {
        console.log("onYouHaveBeenBlocked called");
        timeLoadingRef.current && clearTimeout(timeLoadingRef.current);
        dispatch(setInfoToast("userLivingRoom.blockedToEnterRoom"));
        vs.hangup();
      });

      vs.notification.onEarlyCallError.subscribe(() => {
        console.log("onEarlyCallError called");
        timeLoadingRef.current && clearTimeout(timeLoadingRef.current);
        dispatch(setErrorToast("notifications.earlyCallError"));
        redirect();
      });

      vs.notification.onFreeswitchReconnectLogin.subscribe(() => {
        console.log("onFreeswitchReconnectLogin called");
        timeLoadingRef.current && clearTimeout(timeLoadingRef.current);
        reconnect = true;
        if (roomRef.current) {
          roomRef.current.srcObject = null;
        }
        vs.hangup();
      });

      vs.notification.onRoomClosed.subscribe(() => {
        console.log("onRoomClosed called");
        timeLoadingRef.current && clearTimeout(timeLoadingRef.current);
        vs.notification.onModifiedParticipant.unsubscribe(modifyParticipantId);
        vs.notification.onRemovedParticipant.unsubscribe(
          removeParticipationSubscriber
        );
        dispatch(setInfoToast("notifications.roomClosed"));
        vs.hangup();
      });

      vs.notification.onHostChange.subscribe((hostName) => {
        dispatch(
          setInfoToast(`${t("notifications.roomHostChange")} ${hostName}`)
        );
      });

      vs.notification.onDestroy.subscribe(() => {
        vs.notification.removeAllSubscribers();
        vertoSession.current = null;

        if (!exiting.current) {
          if (reconnect) {
            connect().catch((err) => {
              console.error(err);
              redirect();
            });
          } else {
            redirect();
          }
        }
      });
    };

    connect().catch((err) => {
      console.log("connect function error:", err);
      timeLoadingRef.current && clearTimeout(timeLoadingRef.current);
      console.error(err);
      redirect();
    });
  }, [validated, id, profile.nickname, profile.id, fsUrl, mappedRoomId, history, dispatch, userCameraMaxWidth, t, vlrId, roomId, channel?.name, isHost, moderatorUsername, moderatorPassword]);

  const handleNoVideoTrack = useCallback((track: MediaStreamTrack) => {
    noVideoTrackRef.current = track;
  }, []);

  const handleEmojisClose = useCallback(() => {
    setEmoji((prevState) =>
      prevState.show ? { show: false, selected: "" } : prevState
    );
  }, []);

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

  const handleOnExpandChange = () => {
    handleRoomExpand(!screenIsExpanded);
    setScreenIsExpanded(!screenIsExpanded);
    setEmoji((prevState) =>
      prevState.show ? { ...prevState, show: false } : prevState
    );
  };

  return (
    <>
      <IonModal
        isOpen={loading}
        backdropDismiss={false}
        className="wp-user-loading-modal"
      >
        <IonCard>
          <IonCardContent>
            <IonSpinner />
            <IonText>{t("userLivingRoom.loading")}</IonText>
            <IonButtons
              className={`cancel-loading ${
                !showLoadingCancel ? "ion-hide" : ""
              }`}
            >
              <IonButton onClick={handleRoomExit} color="primary">
                {t("userLivingRoom.cancel")}
              </IonButton>
            </IonButtons>
          </IonCardContent>
        </IonCard>
      </IonModal>

      <IonPage
        className={`user-lr-page${showChat ? " chat-is-open" : ""} ${
          chatInputIsFocused || emoji.show ? " keyboard-is-open" : ""
        }`}
      >
        <IonHeader
          className={`${screenIsExpanded || isInPipMode ? "ion-hide" : ""}`}
        >
          <RoomTopbar
            inPipMode={isInPipMode}
            inviteUrl={`${API_URL}${Routes.WatchParty}/${publicRoomId}`}
            vertoSession={vertoSession.current}
            onExit={handleRoomExit}
          />
        </IonHeader>

        <IonContent>
          <div
            className={`content-holder${
              screenIsExpanded ? " controllers-hidden" : ""
            } ${loading ? "ion-hide" : ""}`}
          >
            <RoomMetadata
              screenIsExpanded={screenIsExpanded}
              inPipMode={isInPipMode}
              numberOfParticipants={participants.length}
            />

            <div className="video-holder">
              {vertoSession.current && (
                <RoomVideoActions
                  inPipMode={isInPipMode}
                  vertoSession={vertoSession.current}
                  isExpanded={screenIsExpanded}
                  screenControllersAreHidden={screenIsExpanded}
                  showChat={showChat}
                  muteRoom={muteRoom}
                  onMuteRoom={() => setMuteRoom(!muteRoom)}
                  onExpandChange={handleOnExpandChange}
                />
              )}
              <video
                ref={roomRef}
                autoPlay
                playsInline
                className="room"
                muted={muteRoom}
                onDoubleClick={handleOnExpandChange}
              />
              <div
                className={`channel-logo-name-container ${
                  isInPipMode ? "ion-hide" : ""
                }`}
              >
                {channelLogo ? (
                  <IonImg src={channelLogo} className="lr-channel-logo" />
                ) : (
                  <IonImg src={defaultLogo} className="lr-channel-logo" />
                )}
              </div>

              <NoVideoCanvas onVideoTrack={handleNoVideoTrack} />
            </div>

            <div
              className={`interactions-holder ${
                emoji.show ? "emojis-are-open" : ""
              } ${showChat ? "chat-is-open" : ""} ${
                screenIsExpanded || isInPipMode ? "ion-hide" : ""
              }`}
            >
              {vertoSession.current && noVideoTrackRef.current && (
                <RoomSideBar
                  adIsShowing={adIsShowing}
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
                  vlrId={vlrId}
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
          </div>

          <IonAlert
            isOpen={alertState.show && !isInPipMode}
            onDidDismiss={() => setAlertState({ show: false, mic: false })}
            message={t(
              `userLivingRoom.${alertState.mic ? "unmuteMic" : "startCam"}`
            )}
            buttons={[
              {
                text: `${t("userLivingRoom.decline")}`,
                role: "cancel",
              },
              {
                text: `${t("userLivingRoom.ok")}`,
                handler: () => {
                  if (vertoSession.current) {
                    alertState.mic
                      ? vertoSession.current.togglePrimaryCam()
                      : vertoSession.current?.togglePrimaryMic();
                  }
                },
              },
            ]}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default RoomWatchPartyPage;
