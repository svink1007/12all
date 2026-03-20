import React, {FC} from 'react';
import './styles.scss';
import {IonButton, IonCard, IonCardContent, IonFooter, IonProgressBar, IonText} from '@ionic/react';
import {useTranslation} from 'react-i18next';

interface ProgressLoaderProps {
  progress: number;
  show: boolean;
  showLeave: boolean;
  onLeave: () => void;
}

const ProgressLoader: FC<ProgressLoaderProps> = ({show, progress, showLeave, onLeave}: ProgressLoaderProps) => {
  const {t} = useTranslation();

  return (
    <div className="progress-loader" hidden={!show}>
      <IonCard>
        <IonCardContent>
          <IonText color="dark">{t('livingRoom.wait')}</IonText>
          <IonProgressBar value={progress}/>
        </IonCardContent>
        <IonFooter hidden={!showLeave}>
          <IonButton fill="clear" onClick={() => onLeave()}>{t('livingRoom.cancel')}</IonButton>
        </IonFooter>
      </IonCard>
    </div>
  );
};

export default ProgressLoader;
