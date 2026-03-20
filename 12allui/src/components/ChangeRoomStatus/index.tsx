import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {IonButton, IonIcon} from '@ionic/react';
import {setInfoToast} from '../../redux/actions/toastActions';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {globeOutline, lockClosed} from 'ionicons/icons';

type Props = {
  isPrivateInitial: boolean;
  onChangeRoomStatus: (value: boolean) => void;
};

const ChangeRoomStatus: FC<Props> = ({isPrivateInitial, onChangeRoomStatus}: Props) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [isPrivate, setIsPrivate] = useState<boolean>(isPrivateInitial);

  useEffect(() => {
    setIsPrivate(isPrivateInitial);
  }, [isPrivateInitial]);

  const handleClick = () => {
    const newStatus = !isPrivate;
    dispatch(setInfoToast(`notifications.${newStatus ? 'roomIsPrivate' : 'roomIsPublic'}`));
    setIsPrivate(newStatus);
    onChangeRoomStatus(newStatus);
  };

  return (
    <IonButton
      onClick={handleClick}
      title={t(`${isPrivate ? 'roomSideBar.roomStatusPrivate' : 'roomSideBar.roomStatusPublic'}`)}
      className="change-room-status"
    >
      <IonIcon slot="icon-only" icon={globeOutline} className={isPrivate ? 'globe-private' : ''}/>
      {isPrivate && <IonIcon slot="icon-only" icon={lockClosed} className="lock"/>}
    </IonButton>
  );
};

export default ChangeRoomStatus;
