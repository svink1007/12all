import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {IonCard, IonCardContent, IonSpinner, IonText} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {Participant} from '../../verto/models';
import VertoSession from '../../verto/VertoSession';

type Props = {
  vertoSession: VertoSession;
}

const RoomConnectionStatus: FC<Props> = ({vertoSession}: Props) => {
  const {t} = useTranslation();
  const [reconnecting, setReconnecting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const onlineListener = () => setIsOffline(false);
    const offlineListener = () => setIsOffline(true);
    window.addEventListener('online', onlineListener);
    window.addEventListener('offline', offlineListener);

    vertoSession.notification.onWebsocketReconnecting.subscribe(() => {
      setReconnecting(true);
    });

    vertoSession.notification.onConnectedToRoom.subscribe(() => {
      setReconnecting(false);
    });

    vertoSession.notification.onBootstrappedParticipants.subscribe((participants: Participant[]) => {
      if (vertoSession.previousPrimaryId) {
        const previousPrimaryConnection = participants.find(({callId}) => callId === vertoSession.previousPrimaryId);
        previousPrimaryConnection && vertoSession.removeParticipant(previousPrimaryConnection.participantId);
      }

      if (vertoSession.previousSecondaryId) {
        const previousSecondaryConnection = participants.find(({callId}) => callId === vertoSession.previousSecondaryId);
        previousSecondaryConnection && vertoSession.removeParticipant(previousSecondaryConnection.participantId);
      }
    });

    return () => {
      window.removeEventListener('online', onlineListener);
      window.removeEventListener('offline', offlineListener);
    };
  }, [vertoSession]);

  return (
    <>
      {
        (isOffline || reconnecting) ?
          <div className="room-connection-status">
            <IonCard>
              <IonCardContent>
                {
                  isOffline &&
                  <IonText>{t('notifications.youAreOffline')}</IonText>
                }
                {
                  !isOffline && reconnecting &&
                  <>
                    <IonText>{t('common.reconnecting')}</IonText> <IonSpinner/>
                  </>
                }
              </IonCardContent>
            </IonCard>
          </div>
          :
          null
      }
    </>
  );
};

export default RoomConnectionStatus;
