import {IonButton, IonButtons, IonInput, IonItem, IonSpinner} from '@ionic/react';
import {Channel} from '../../../shared/types';
import React, {FC, useState} from 'react';
import {useTranslation} from 'react-i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {Routes} from '../../../shared/routes';
// import StreamBroadcast from './StreamBroadcast';
// import WatchPartyBroadcast from './WatchPartyBroadcast';

type Props = {
  loading: boolean;
  channels: Channel[];
  setOpenPartyModal: Function;
};

const JoinTheParty: FC<Props> = ({loading, channels, setOpenPartyModal}: Props) => {
  const {t} = useTranslation();
  const [roomId, setRoomId] = useState<string | null | undefined>('');

  return channels ? (
    <PerfectScrollbar className={`channel-list ${loading ? 'loading' : ''}`}>
      {
        loading ?
          <IonSpinner name="lines"/>
          :
          <div className="channel-list-div">
            <IonItem className="home-room-id-item">
              <IonInput
                placeholder={t('joinScreen.room')}
                value={roomId}
                onIonChange={({detail}) => setRoomId(detail.value)}
              />
              <IonButtons slot="end">
                <IonButton onClick={() => setOpenPartyModal(false)} routerLink={`${Routes.WatchParty}/${roomId}`} color="primary" fill="solid">
                  {t('joinScreen.join')}
                </IonButton>
              </IonButtons>
            </IonItem>

            {/* {
              channels.map((channel: Channel) => !channel.is_vlr && channel.stream_id ?
                <StreamBroadcast key={channel.id} channel={channel}/> :
                <WatchPartyBroadcast key={channel.id} channel={channel}/>
              )
            } */}
          </div>
      }
    </PerfectScrollbar>
  ) : null;
};

export default JoinTheParty;
