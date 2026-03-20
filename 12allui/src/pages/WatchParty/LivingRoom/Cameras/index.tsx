import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {IonAlert} from '@ionic/react';
import appStorage from '../../../../shared/appStorage';
import {WP_CAM} from '../../../../shared/constants';

interface CamProps {
  open: boolean;
  onClose: () => void;
  onSelect: (deviceId: string) => void;
}

type Devices = {
  name: string;
  type: 'radio',
  label: string;
  value: string;
  checked: boolean
};

const Cameras: FC<CamProps> = ({open, onClose, onSelect}: CamProps) => {
  const [cameras, setCameras] = useState<Devices[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoading(true);

    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const selectedMicStorage = appStorage.getItem(WP_CAM) || 'none';

      const cams: Devices[] = devices
        .filter(d => d.kind === 'videoinput')
        .map(({label, deviceId}: MediaDeviceInfo) => {
          return {
            name: deviceId,
            type: 'radio',
            label,
            value: deviceId,
            checked: selectedMicStorage === deviceId
          };
        });

      setCameras(cams);
      setLoading(false);
    };

    getDevices().catch((err) => console.error(err));
  }, [open]);

  if (loading) {
    return null;
  }

  return (
    <IonAlert
      isOpen={open}
      onDidDismiss={onClose}
      cssClass='select-device-alert'
      inputs={cameras}
      buttons={[
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: (deviceId: string) => {
            appStorage.setItem(WP_CAM, deviceId);
            onSelect(deviceId);
          }
        }
      ]}
    />
  );
};

export default Cameras;
