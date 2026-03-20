import React, {FC} from 'react';
import './styles.scss';
import {IonAlert} from '@ionic/react';

type Props = {
  show: boolean;
  content: Array<string>;
  onDismiss: () => void;
};

const TipsModal: FC<Props> = ({show,content,onDismiss}: Props) => {

  return (
    <IonAlert
      isOpen={show}
      cssClass="fs-room-selection-alert"
      header={content[0]}
      backdropDismiss={true}
      onDidDismiss={()=>onDismiss()}
      message={content[1]}
      buttons={['OK']}
    />
    
  );
};

export default TipsModal;
