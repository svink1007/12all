import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonIcon, IonItem, IonText, IonToolbar} from '@ionic/react';
import {addCircleOutline, exitOutline, scanOutline} from 'ionicons/icons';
import {useTranslation} from 'react-i18next';
import {Participant} from '../../../../verto/models';
import AddParticipantsModal from '../AddParticipantsModal';
import VertoSession from '../../../../verto/VertoSession';

type Props = {
  vertoSession: VertoSession;
  streamName?: string;
  roomId: string;
  fullscreen: boolean;
  participants: Participant[];
  onAddAdditionalParticipants: (value: number) => void;
  onExit: () => void;
  onFullscreen: () => void;
};

const TopBarRoomTest: FC<Props> = ({
                                     vertoSession,
                                     streamName,
                                     roomId,
                                     fullscreen,
                                     participants,
                                     onAddAdditionalParticipants,
                                     onFullscreen,
                                     onExit
                                   }: Props) => {
  const {t} = useTranslation();
  const [numberOfParticipants, setNumberOfParticipants] = useState<number>(1);
  const [openAddAdditionalParticipantsModal, setOpenAddAdditionalParticipantsModal] = useState<boolean>(false);
  const [websocketDisconnected, setWebsocketDisconnected] = useState<boolean>(false);


  useEffect(() => {
    setNumberOfParticipants(participants.filter(p => !p.isHostSharedVideo).length || 1);
  }, [participants]);

  const handleDismissAdditionalParticipants = () => {
    setOpenAddAdditionalParticipantsModal(false);
  };

  const handleAddAdditionalParticipants = (participants: number) => {
    handleDismissAdditionalParticipants();
    onAddAdditionalParticipants(participants);
  };

  return (
    <>
      <IonToolbar className="top-bar-room-test">
        <IonButtons slot="start">
          <IonButton onClick={onExit} title="Exit">
            <IonIcon slot="icon-only" icon={exitOutline} color="primary"/>
          </IonButton>
          <IonButton onClick={() => setOpenAddAdditionalParticipantsModal(true)} title="Add participants">
            <IonIcon slot="icon-only" icon={addCircleOutline}/>
          </IonButton>
          <IonButton onClick={() => onFullscreen()} className="fullscreen-button" title="Toggle fullscreen">
            <IonIcon
              slot="icon-only"
              icon={scanOutline}
              color={fullscreen ? 'success' : 'dark'}
            />
          </IonButton>
          {
            websocketDisconnected ?
              <IonButton fill="solid" color="primary" onClick={() => {
                vertoSession.reconnectWebSocket();
                setWebsocketDisconnected(false);
              }}>
                Reconnect websocket
              </IonButton> :
              <IonButton fill="solid" onClick={() => {
                vertoSession.disconnectWebSocket();
                setWebsocketDisconnected(true);
              }}>
                Disconnect websocket
              </IonButton>
          }
        </IonButtons>

        <IonItem className="room-info" slot="end" lines="none">
          {streamName && <IonText>{streamName}</IonText>}
          <IonText>{t('topBar.room')}: {roomId}</IonText>
          <IonText>{t('topBar.participants')}: {numberOfParticipants}</IonText>
        </IonItem>
      </IonToolbar>

      <AddParticipantsModal
        open={openAddAdditionalParticipantsModal}
        onAdd={handleAddAdditionalParticipants}
        onCancel={handleDismissAdditionalParticipants}
      />
    </>
  );
};

export default TopBarRoomTest;
