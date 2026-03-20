import React, { FC, useState } from "react";
import "./styles.scss";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonItem,
  IonModal,
  IonSpinner,
  IonText,
  IonTitle,
} from "@ionic/react";
import { closeCircleOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import SocialNetworks from "../SocialNetworks";
import { VlrService } from "../../services";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import { useDispatch } from "react-redux";

type Props = {
  show: boolean;
  url: string;
  roomPublicId?: string;
  showPushInvite?: boolean;
  onClose: () => void;
};

const Invite: FC<Props> = ({
  show,
  url,
  roomPublicId,
  showPushInvite,
  onClose,
}: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [invitationSending, setInvitationSending] = useState(false);

  const dismissModal = () => {
    onClose();
  };

  const handleInviteAllToMyRoom = () => {
    if (roomPublicId) {
      setInvitationSending(true);
      VlrService.inviteAllToMyRoom(roomPublicId)
        .then(() => dispatch(setInfoToast("invite.invitationSend")))
        .catch(() => dispatch(setErrorToast("invite.invitationCouldNotBeSend")))
        .finally(() => {
          setInvitationSending(false);
          dismissModal();
        });
    }
  };

  return (
    <IonModal
      isOpen={show}
      onDidDismiss={dismissModal}
      className="wp-invite-modal"
    >
      <IonItem lines="none">
        <IonTitle>{t("invite.header")}</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={dismissModal} color="dark">
            <IonIcon slot="icon-only" icon={closeCircleOutline} />
          </IonButton>
        </IonButtons>
      </IonItem>

      <IonCard>
        <IonCardContent>
          <IonText color="dark">{url}</IonText>
          <SocialNetworks url={url} />
          {showPushInvite && roomPublicId && (
            <IonButton
              className="invite-all"
              onClick={handleInviteAllToMyRoom}
              disabled={invitationSending}
              size="small"
            >
              {invitationSending && <IonSpinner />}
              {t("invite.notifyAll")}
            </IonButton>
          )}
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
};

export default Invite;
