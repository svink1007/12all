import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {IonAvatar, IonImg, IonItem, IonList, IonListHeader, IonText} from '@ionic/react';
import logo from '../../images/12all-logo-128.png';
import {VlrUpcoming} from '../../shared/types';
import {API_URL, parseRoomStart} from '../../shared/constants';

type Props = {
  room: VlrUpcoming;
};

const UpcomingRoom: FC<Props> = ({room}: Props) => {
  const startAt = useRef<string>(parseRoomStart(room.start_at));
  const [hostFirstLetter, setHostFirstLetter] = useState<string>('');

  useEffect(() => {
    room.host.nickname && setHostFirstLetter(room.host.nickname.charAt(0));
  }, [room.host.nickname]);

  return (
    <IonList className="upcoming-room !max-h-[350px]">
      <IonListHeader>{startAt.current}</IonListHeader>
      <IonItem className="room-meta" lines="none">
        <IonImg
          src={room.logo ? room.logo : logo}
          className={`room-logo${room.logo ? ' has-logo' : ''}`}
        />

        <IonText color="dark">{room.name}</IonText>
      </IonItem>
      <IonItem lines="none" className="host">
        {
          room.host.avatar ?
            <IonAvatar slot="start" title={room.host.nickname || ''}>
              <img src={`${API_URL}${room.host.avatar.url}`} alt=""/>
            </IonAvatar>
            :
            hostFirstLetter ?
              <IonText slot="start" className="host-default-avatar" title={room.host.nickname}>
                {hostFirstLetter}
              </IonText>
              :
              null
        }

      </IonItem>
      {/*<RoomActions room={room}/>*/}
    </IonList>
  );
};

export default UpcomingRoom;
