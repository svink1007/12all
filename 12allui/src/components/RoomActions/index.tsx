import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {useTranslation} from 'react-i18next';
import {IonButton, IonButtons, IonIcon, IonItem, IonLabel} from '@ionic/react';
import {peopleOutline, shareSocialOutline} from 'ionicons/icons';
import {Channel, Vlr} from '../../shared/types';
import {getChannelUrlSuffix} from '../../shared/helpers';
import Invite from '../Invite';
import { Routes } from 'src/shared/routes';

type Props = {
  room: Vlr;
};

const RoomActions: FC<Props> = ({room}: Props) => {
  const {t} = useTranslation();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [numberOfParticipants, setNumberOfParticipants] = useState<string>('1');

  useEffect(() => {
    setNumberOfParticipants(room.participants.length > 99 ? '99+' : `${room.participants.length || 1}`);
  }, [room.participants]);

  const handleShare = (e: any, rom: Vlr) => {
    // if(room.vod?.id && !room.stream){
    //   setInviteUrl(`${window.location.origin}/vod/${room.vod.id}?roomId=${room.public_id}`)
    // }else{
    //   setInviteUrl(`${window.location.origin}${getChannelUrlSuffix(room.channel)}`);
    // }
    let roomPath=getChannelUrlSuffix(room.channel)
    if(room.vod?.id && !room.stream){
      roomPath=`${Routes.WatchParty}/${room.channel.channel_deep_link}`
    }
    setInviteUrl(`${window.location.origin}${roomPath}`);
    setShowInviteModal(true);
  };

  const onInviteClose = () => {
    setShowInviteModal(false);
  };

  return (
    <>
      <div className="room-actions flex justify-end">
        <IonItem lines="none" className="number-of-participants">
          <IonIcon icon={peopleOutline} color="dark"/>
          <span className={"bg-[#E0007A] text-[0.7rem] flex justify-center items-center ms-1 w-[16px] h-[16px] text-white rounded-[50%]"}>{numberOfParticipants}</span>
        </IonItem>
        <IonButtons className="room-actions-buttons" slot="end">
          <IonButton onClick={e => handleShare(e, room)}>
            <IonIcon
              slot="icon-only"
              icon={shareSocialOutline}
              color={showInviteModal ? 'success' : 'dark'}
            />
          </IonButton>
        </IonButtons>
      </div>
      <Invite
        title={t('home.share')}
        show={showInviteModal}
        onClose={() => onInviteClose()}
        url={inviteUrl}
      />
    </>
  );
};

export default RoomActions;
