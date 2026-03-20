import React, {FC, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonToolbar,
  isPlatform
} from '@ionic/react';
import {Vlr} from '../../../shared/types';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../redux/shared/types';

interface Props {
  open: boolean;
  vlrs: Vlr[];
  onStartNewRoom: () => void;
  onJoinRoom: (vlr: Vlr) => void;
  onCancel: () => void;
}

const SelectRoomModal: FC<Props> = ({open, vlrs, onStartNewRoom, onJoinRoom, onCancel}: Props) => {
  const {t} = useTranslation();
  const {jwt} = useSelector(({profile}: ReduxSelectors) => profile);
  const [selected, setSelected] = useState<number>(0);

  return (
    <IonModal
      isOpen={open}
      className="select-room-stream-modal"
      backdropDismiss={false}
    >
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>{t('sharedStream.joinOrStartRoom')}</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <IonRadioGroup
            value={selected}
            onIonChange={(e) => setSelected(e.detail.value)}
          >
            {
              vlrs.map(({id, public_id, active_connections_count}, index) => (
                <IonItem key={id}>
                  <IonRadio value={index} slot="start"/>
                  <IonLabel>{t('sharedStream.room')} {public_id} ({t('sharedStream.viewers')}: {(active_connections_count ? (active_connections_count - 1) : 1)})</IonLabel>
                </IonItem>
              ))
            }

            {
             !isPlatform('ios') &&
              <IonItem>
                <IonRadio value={-1} slot="start"/>
                <IonLabel>{t('sharedStream.startNewRoom')}</IonLabel>
              </IonItem>
            }
          </IonRadioGroup>
        </IonCardContent>

        <IonToolbar>
          <IonButtons slot="end">
            <IonButton
              onClick={onCancel}
              color="primary"
            >
              {t('sharedStream.cancel')}
            </IonButton>
            <IonButton
              onClick={() => selected === -1 ? onStartNewRoom() : onJoinRoom(vlrs[selected])}
              color="primary"
            >
              {t('sharedStream.ok')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonCard>
    </IonModal>
  )
};

export default SelectRoomModal;
