import React, {FC} from 'react';
import './styles.scss';
import {useTranslation} from 'react-i18next';
import {IonTitle, IonToolbar} from '@ionic/react';

const RoomHeader: FC<{ title: string }> = ({title}) => {
  const {t} = useTranslation();

  return (
    <IonToolbar className="room-header">
      <IonTitle>{t(title)}</IonTitle>
    </IonToolbar>
  );
};

export default RoomHeader;
