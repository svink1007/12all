import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import { IonButton, IonButtons, IonIcon, IonToolbar } from "@ionic/react";
import ExitButton from "../ExitButton";
import {
  cameraReverse,
  cameraReverseOutline,
  shareSocialOutline,
} from "ionicons/icons";
import setUserMedia from "../../redux/actions/userMediaActions";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/types";
import VertoSession from "../../verto/VertoSession";
import Invite from "../Invite";
import LogoHeader from "../LogoHeader";

type Props = {
  inPipMode: boolean;
  inviteUrl: string;
  vertoSession: VertoSession | null;
  roomPublicId?: string;
  showPushInvite?: boolean;
  onExit: () => void;
};

const RoomTopbar: FC<Props> = ({
  inPipMode,
  inviteUrl,
  vertoSession,
  roomPublicId,
  showPushInvite,
  onExit,
}: Props) => {
  const dispatch = useDispatch();
  const { facingMode } = useSelector(
    ({ userCamera }: ReduxSelectors) => userCamera
  );
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);

  const handleUserCameraFacingModeChange = () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    vertoSession?.stopPrimaryVideoTrack();

    dispatch(setUserMedia({ facingMode: newFacingMode }));
  };

  useEffect(() => {
    return () => {
      dispatch(setUserMedia({ facingMode: "user" }));
    };
  }, [dispatch]);

  return (
    <>
      <IonToolbar className="room-top-bar" mode="md">
        <IonButtons slot="start" className="start-buttons">
          <ExitButton onExit={onExit} />
        </IonButtons>

        <LogoHeader />

        <IonButtons slot="end" className="end-buttons">
          <IonButton
            onClick={() => setShowInviteModal(true)}
            className="invite-button"
          >
            <IonIcon
              slot="icon-only"
              icon={shareSocialOutline}
              color={showInviteModal ? "success" : "dark"}
            />
          </IonButton>
          <IonButton onClick={handleUserCameraFacingModeChange} color="dark">
            <IonIcon
              slot="icon-only"
              icon={
                facingMode === "user" ? cameraReverseOutline : cameraReverse
              }
            />
          </IonButton>
        </IonButtons>
      </IonToolbar>

      <Invite
        roomPublicId={roomPublicId}
        showPushInvite={showPushInvite}
        show={showInviteModal && !inPipMode}
        onClose={() => setShowInviteModal(false)}
        url={inviteUrl}
      />
    </>
  );
};

export default RoomTopbar;
