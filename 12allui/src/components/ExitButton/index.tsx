import React, {FC} from 'react';
import './styles.scss';
import {IonButton, IonIcon} from '@ionic/react';
import {call} from 'ionicons/icons';

type Props = {
  onExit: () => void;
};

const ExitButton: FC<Props> = ({onExit}) => {
  return (
    <IonButton
      onClick={onExit}
      className="exit-room-button border border-red-500"
      color="tertiary"
      slot="start"
    >
      <IonIcon slot="icon-only" color="dark" icon={call}/>
    </IonButton>
  );
};
export default ExitButton;
