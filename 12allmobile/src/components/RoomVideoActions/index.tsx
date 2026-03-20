import React, { FC } from "react";
import "./styles.scss";
import RoomChangeLayout from "../RoomChangeLayout";
import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import {
  contractOutline,
  expandOutline,
  informationCircleOutline,
  volumeHighOutline,
  volumeMuteOutline,
} from "ionicons/icons";
import RoomChangeStream from "../RoomChangeStream";
import { SharedStream } from "../../shared/types";
import ChangeRoomStatus from "../ChangeRoomStatus";
import VertoSession from "../../verto/VertoSession";
import { ReduxSelectors } from "../../redux/types";
import { useSelector } from "react-redux";
import StreamDebugInfo, {
  OPEN_STREAM_DEBUG,
} from "../../pages/SharedStream/StreamDebugInfo";

type Props = {
  inPipMode: boolean;
  vertoSession: VertoSession;
  showChat: boolean;
  muteRoom: boolean;
  screenControllersAreHidden: boolean;
  isExpanded: boolean;
  showDebugInfoButton?: boolean;
  isPrivate?: boolean;
  publicId?: string;
  imHost?: boolean | null;
  streamId?: string;
  isAdult?: boolean;
  onMuteRoom: () => void;
  onExpandChange: () => void;
  onChangeStream?: (stream: SharedStream) => void;
  onChangeRoomStatus?: (value: boolean) => void;
};

const RoomVideoActions: FC<Props> = ({
  inPipMode,
  vertoSession,
  showChat,
  muteRoom,
  screenControllersAreHidden,
  isExpanded,
  publicId,
  showDebugInfoButton,
  isPrivate,
  imHost,
  isAdult,
  streamId,
  onMuteRoom,
  onExpandChange,
  onChangeStream,
  onChangeRoomStatus,
}: Props) => {
  const { showDebugInfo } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );

  return (
    <IonButtons
      className={`room-video-actions ${
        showChat && !screenControllersAreHidden ? "chat-is-open" : ""
      } ${inPipMode ? "ion-hide" : ""}`}
    >
      {showDebugInfoButton && showDebugInfo && (
        <>
          <IonButton id={OPEN_STREAM_DEBUG}>
            <IonIcon slot="icon-only" icon={informationCircleOutline} />
          </IonButton>
          <StreamDebugInfo inPipMode={inPipMode} />
        </>
      )}
      {imHost && !screenControllersAreHidden && (
        <>
          {publicId && !isAdult && (
            <ChangeRoomStatus
              isPrivateInitial={isPrivate || false}
              publicId={publicId}
              onChangeRoomStatus={(value) =>
                onChangeRoomStatus && onChangeRoomStatus(value)
              }
            />
          )}
          {streamId && streamId !== "camera" && onChangeStream && (
            <RoomChangeStream
              inPipMode={inPipMode}
              streamId={+streamId}
              onChangeStream={onChangeStream}
            />
          )}
          <RoomChangeLayout vertoSession={vertoSession} />
        </>
      )}

      <IonButton onClick={() => onExpandChange()} color="dark">
        <IonIcon
          slot="icon-only"
          icon={isExpanded ? contractOutline : expandOutline}
        />
      </IonButton>

      <IonButton onClick={() => onMuteRoom()} color="dark">
        <IonIcon
          slot="icon-only"
          icon={muteRoom ? volumeMuteOutline : volumeHighOutline}
        />
      </IonButton>
    </IonButtons>
  );
};

export default RoomVideoActions;
