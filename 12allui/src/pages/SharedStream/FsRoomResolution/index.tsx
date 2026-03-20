import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {IonAlert} from '@ionic/react';
import {FsRoomResolutionService} from '../../../services';
import {FsResolution} from '../../../shared/types';

type Props = {
  show: boolean;
  onSelect: (resolution: number) => void;
};

const FsRoomResolution: FC<Props> = ({show, onSelect}: Props) => {
  const [resolutions, setResolutions] = useState<FsResolution[]>([]);

  useEffect(() => {
    FsRoomResolutionService.getResolutions().then(({data}) => setResolutions(data));
  }, []);

  return (
    <IonAlert
      isOpen={show}
      cssClass="fs-room-selection-alert"
      header="Select fs resolution"
      backdropDismiss={false}
      inputs={
        resolutions.map(({name, resolution}: FsResolution) => (
          {
            name: name,
            type: 'radio',
            label: name,
            value: resolution,
            handler: () => onSelect(resolution)
          }
        ))
      }
    />
  );
};

export default FsRoomResolution;
