import React, {FC, useRef} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonIcon, IonRange, IonToolbar} from '@ionic/react';
import {volumeMediumOutline, volumeMuteOutline} from 'ionicons/icons';

type Props = {
  volume: number;
  onVolumeChange: (value: number) => void;
};

const PlayerBarStream: FC<Props> = ({volume, onVolumeChange}) => {
  const lastVolume = useRef<number>(1);

  const handleVolumeIconClick = () => {
    if (volume) {
      lastVolume.current = volume;
      onVolumeChange(0);
    } else {
      onVolumeChange(lastVolume.current);
    }
  };

  return (
    <div className="player-bar-stream">
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton className="volume-button" onClick={handleVolumeIconClick} size="large">
            <IonIcon slot="icon-only" icon={volume === 0 ? volumeMuteOutline : volumeMediumOutline}/>
          </IonButton>
        </IonButtons>

        <IonRange
          max={1}
          step={0.1}
          value={volume}
          onIonChange={(e) => onVolumeChange(+e.detail.value)}
          color="dark"
        />
      </IonToolbar>
    </div>
  );
};

export default PlayerBarStream;
