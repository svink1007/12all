import React, { FC } from "react";
import "./styles.scss";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonItem,
  IonModal,
  IonText,
  IonTitle,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { closeCircleOutline } from "ionicons/icons";

interface BroadcastInfoProps {
  show: boolean;
  name: string;
  country: string;
  language: string;
  genre: string;
  description?: string;
  approved?: boolean | null;
  onClose: () => void;
}

const BroadcastInfo: FC<BroadcastInfoProps> = ({
  show,
  name,
  country,
  language,
  genre,
  description,
  approved,
  onClose,
}: BroadcastInfoProps) => {
  const { t } = useTranslation();

  const dismissInfoModal = () => {
    show && onClose();
  };

  return (
    <IonModal
      isOpen={show}
      onDidDismiss={dismissInfoModal}
      className="broadcast-info-modal"
    >
      <IonItem lines="none">
        <IonTitle>{name}</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={dismissInfoModal} color="dark">
            <IonIcon slot="icon-only" icon={closeCircleOutline} />
          </IonButton>
        </IonButtons>
      </IonItem>

      <IonCard>
        <IonCardContent>
          {approved === false && (
            <IonText color="warning">
              {t("channelInfo.inApprovalProcess")}
            </IonText>
          )}
          <div>
            <label>{t("channelInfo.genre")}: </label>
            <span>{genre || t("channelInfo.na")}</span>
          </div>
          <div>
            <label>{t("channelInfo.country")}: </label>
            <span>{country || t("channelInfo.na")}</span>
          </div>
          <div>
            <label>{t("channelInfo.language")}: </label>
            <span>{language || t("channelInfo.na")}</span>
          </div>
          {description && (
            <div>
              <label>{t("channelInfo.description")}: </label>
              <span>{description || t("channelInfo.na")}</span>
            </div>
          )}
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
};

export default BroadcastInfo;
