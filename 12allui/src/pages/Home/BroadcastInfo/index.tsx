import React, { FC } from 'react';
import './styles.scss';
import { IonButton, IonButtons, IonCard, IonCardContent, IonIcon, IonImg, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { closeCircleOutline } from 'ionicons/icons';
import dollar from "../../../images/icons/dollar.svg";
import redStar from "../../../images/icons/star-sharp.svg";

interface BroadcastInfoProps {
  show: boolean;
  name: string;
  country: string;
  language: string;
  genre: string;
  description?: string;
  starsAmount: string;
  onClose: () => void;
}

const BroadcastInfo: FC<BroadcastInfoProps> = ({
  show,
  name,
  country,
  language,
  genre,
  description,
  starsAmount,
  onClose
}: BroadcastInfoProps) => {
  const { t } = useTranslation();

  const dismissInfoModal = () => {
    onClose();
  };

  const getCamelCase = (starsAmount: string) => {
    switch (starsAmount) {
      case "FREE":
      case "Free":
      case "free":
        return "Free"
      default: return starsAmount
    }
  }

  return (
    <IonModal
      isOpen={show}
      onDidDismiss={dismissInfoModal}
      className="broadcast-info-modal"
    >
      <IonToolbar>
        <IonTitle>{name}</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={dismissInfoModal}>
            <IonIcon slot="icon-only" icon={closeCircleOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>

      <IonCard>
        <IonCardContent>
          <div className="stars-amount">
            {!["FREE", "Free", "free", "", null].includes(starsAmount) && <IonImg src={dollar} />}
            <label>{getCamelCase(starsAmount)}</label>
            {!["FREE", "Free", "free", "", null].includes(starsAmount) && <IonImg src={redStar} />}
          </div>
          <div className="info-row">
            <label>{t('broadcastInfo.genre')}: </label>
            <span>{genre || t('broadcastInfo.na')}</span>
          </div>
          <div className="info-row">
            <label>{t('broadcastInfo.country')}: </label>
            <span>{country || t('broadcastInfo.na')}</span>
          </div>
          <div className="info-row">
            <label>{t('broadcastInfo.language')}: </label>
            <span>{language || t('broadcastInfo.na')}</span>
          </div>
          {
            description !== undefined &&
            <div className="info-row">
              <label>{t('broadcastInfo.description')}: </label>
              <span>{description || t('broadcastInfo.na')}</span>
            </div>
          }
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
};

export default BroadcastInfo;
