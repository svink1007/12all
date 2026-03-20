import React, {FC, useEffect, useState} from 'react';
import {VlrScheduleDuration} from '../../../shared/types';
import {VlrScheduleService} from '../../../services';
import {IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {timeOutline} from 'ionicons/icons';

type Props = {
  duration: number;
  hideIcon?: boolean;
  onDurationChange: (duration: number) => void;
};

const VlrScheduleDurations: FC<Props> = ({duration, hideIcon, onDurationChange}: Props) => {
  const {t} = useTranslation();
  const [durations, setDurations] = useState<VlrScheduleDuration[]>([]);

  useEffect(() => {
    VlrScheduleService.getDurations().then(({data}) => setDurations(data));
  }, []);

  return (
    <IonItem className="vlr-schedule-duration-item">
      <IonIcon icon={timeOutline} slot="start" color="dark" hidden={hideIcon}/>
      <IonLabel position="stacked">{t('vlrScheduleDuration.duration')}</IonLabel>
      <IonSelect
        interface="popover"
        value={duration}
        disabled={!durations.length}
        onIonChange={({detail: {value}}) => onDurationChange(value)}
      >
        {
          durations.map(({id, label, duration}) => (
            <IonSelectOption key={id} value={duration}>
              {t(`vlrScheduleDuration.${label}`)}
            </IonSelectOption>
          ))
        }
      </IonSelect>
    </IonItem>
  );

};

export default VlrScheduleDurations;
