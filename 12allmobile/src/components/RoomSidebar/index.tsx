import React, { FC, useEffect, useRef, useState } from "react";
import "./styles.scss";
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonText,
} from "@ionic/react";
import {
  chatbubblesOutline,
  micOffOutline,
  micOutline,
  videocamOffOutline,
  videocamOutline,
} from "ionicons/icons";
import { useSelector } from "react-redux";
import VertoSession from "../../verto/VertoSession";
import { ReduxSelectors } from "../../redux/types";
import { useTranslation } from "react-i18next";
import { FakeAudioTrack } from "../../models/FakeAudioTrack";
import { Participant } from "../../verto/models";

const FRAMES_RATE = 30;

type Props = {
  adIsShowing: boolean;
  meMuted: boolean;
  meCamStopped: boolean;
  showChat: boolean;
  vertoSession: VertoSession;
  noVideoTrack: MediaStreamTrack;
  hostShareCamera?: boolean;
  me?: Participant;
  onChatClick: () => void;
};

const RoomSidebar: FC<Props> = ({
  adIsShowing,
  meMuted,
  meCamStopped,
  showChat,
  vertoSession,
  noVideoTrack,
  hostShareCamera,
  me,
  onChatClick,
}: Props) => {
  const { t } = useTranslation();

  const { accumulator } = useSelector(
    ({ unreadMessages }: ReduxSelectors) => unreadMessages
  );
  const { userCameraMaxWidth } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );
  const { facingMode, audioTrack } = useSelector(
    ({ userCamera }: ReduxSelectors) => userCamera
  );

  const camStoopedTimeout = useRef<NodeJS.Timeout | null>();
  const camVideoInterval = useRef<NodeJS.Timeout | null>();
  const userMediaAudio = useRef<MediaStream | null>(
    audioTrack ? new MediaStream([audioTrack]) : null
  );
  const userMediaVideo = useRef<MediaStream>();
  const fakeAudioTrack = useRef<FakeAudioTrack>(new FakeAudioTrack());

  const [micMuted, setMicMuted] = useState<boolean>(true);
  const [pttMuted, setPttMuted] = useState<boolean>(true);
  const [camStopped, setCamStopped] = useState<boolean>(true);

  useEffect(() => {
    const fakeAudioTrackRef = fakeAudioTrack.current;

    return () => {
      camVideoInterval.current && clearInterval(camVideoInterval.current);
      userMediaVideo.current?.getTracks().forEach((track) => track.stop());
      userMediaAudio.current?.getTracks().forEach((track) => track.stop());
      fakeAudioTrackRef.stopTrack();
    };
  }, []);

  useEffect(() => {
    if (pttMuted) {
      setMicMuted(meMuted);
    }
  }, [meMuted, pttMuted]);

  useEffect(() => {
    setMicMuted(true);
  }, [pttMuted]);

  useEffect(() => {
    if (adIsShowing) {
      setPttMuted(true);
    }
  }, [adIsShowing]);

  useEffect(() => {
    if (micMuted && pttMuted && !meMuted && !hostShareCamera) {
      vertoSession.togglePrimaryMic();
      vertoSession.replacePrimaryTracks(
        new MediaStream([fakeAudioTrack.current.getTrack()])
      );
      userMediaAudio.current?.getAudioTracks().forEach((track) => track.stop());
    }
  }, [micMuted, pttMuted, meMuted, vertoSession, hostShareCamera]);

  useEffect(() => {
    setCamStopped(meCamStopped);

    if (camStoopedTimeout.current) {
      clearTimeout(camStoopedTimeout.current);
      camStoopedTimeout.current = null;
    }

    const toggleCam = async () => {
      let mediaStream: MediaStream;

      if (!meCamStopped) {
        userMediaVideo.current = await navigator.mediaDevices.getUserMedia({
          audio: false,
          // web: add code from video: getCamParams(cam) function from web app code to set the current deviceId, witdth, height, frameRate and aspectRatio
          video: {
            facingMode,
            width: { max: userCameraMaxWidth },
            frameRate: FRAMES_RATE,
          },
        });

        mediaStream = userMediaVideo.current;
      } else {
        camVideoInterval.current && clearInterval(camVideoInterval.current);
        camVideoInterval.current = null;
        userMediaVideo.current
          ?.getVideoTracks()
          .forEach((track) => track.stop());
        mediaStream = new MediaStream([noVideoTrack]);
      }

      vertoSession.replacePrimaryTracks(mediaStream);
    };

    toggleCam().catch((err) => console.error(err));
  }, [
    vertoSession,
    meCamStopped,
    noVideoTrack,
    userCameraMaxWidth,
    facingMode,
  ]);

  const toggleVertoMic = () => {
    // We need this because there is some incorrect behaviour on the fs when,
    // immediately after entering the room, the host tries to stop his mic
    if (me?.isHost) {
      vertoSession.toggleParticipantMic(me.participantId);
    } else {
      vertoSession.togglePrimaryMic();
    }
  };

  const handleMicChange = (turnOn: boolean) => {
    if (hostShareCamera) {
      toggleVertoMic();
    } else if (turnOn) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          userMediaAudio.current = stream;
          vertoSession.replacePrimaryTracks(userMediaAudio.current);
        });

      toggleVertoMic();
    }
  };

  const handleToggleMic = () => {
    setMicMuted((prevState) => !prevState);
    handleMicChange(micMuted);
  };

  const handlePttStart = () => {
    setMicMuted(true);
    setPttMuted(false);
    micMuted && handleMicChange(true);
  };

  const handlePttEnd = () => {
    setPttMuted(true);
    handleMicChange(false);
  };

  const handleToggleCamera = () => {
    setCamStopped((prev) => !prev);
    // We need this because there is some incorrect behaviour on the fs when,
    // immediately after entering the room, the host tries to stop his camera
    if (me?.isHost) {
      vertoSession.toggleParticipantCam(me.participantId);
    } else {
      vertoSession.togglePrimaryCam();
    }
  };

  return (
    <IonItem className="stream-side-bar" lines="none">
      <IonButtons>
        <IonButton
          className="chat-button"
          onClick={(event) => {
            event.stopPropagation();
            onChatClick();
          }}
        >
          <IonIcon
            icon={chatbubblesOutline}
            color={showChat ? "success" : "dark"}
            slot="icon-only"
          />
          <IonBadge
            color="primary"
            className={`${!showChat ? "show-delay" : ""} ${
              showChat || accumulator < 1 ? "ion-hide" : ""
            }`}
          >
            {accumulator}
          </IonBadge>
        </IonButton>

        <IonButton className="camera-button" onClick={handleToggleCamera}>
          <IonIcon
            slot="icon-only"
            icon={camStopped ? videocamOffOutline : videocamOutline}
            color={camStopped ? "dark" : "success"}
          />
        </IonButton>

        <IonButton className="mic-button" onClick={handleToggleMic}>
          <IonIcon
            slot="icon-only"
            icon={micMuted ? micOffOutline : micOutline}
            color={micMuted ? "dark" : "success"}
          />
        </IonButton>

        <IonButton
          className="ptt-button"
          fill="solid"
          color={pttMuted ? "secondary" : "success"}
          shape="round"
          onTouchStart={handlePttStart}
          onTouchEnd={handlePttEnd}
        >
          <IonText slot="icon-only" class="item-text-wrap">
            {t("roomSideBar.ptt")}
          </IonText>
        </IonButton>
      </IonButtons>
    </IonItem>
  );
};

export default RoomSidebar;
