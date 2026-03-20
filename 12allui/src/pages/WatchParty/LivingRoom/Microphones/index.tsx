import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {IonAlert} from '@ionic/react';
import appStorage from '../../../../shared/appStorage';
import {WP_MIC} from '../../../../shared/constants';

interface MicProps {
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

const Microphones: FC<MicProps> = ({open, onClose, onSelect}: MicProps) => {
  const [microphones, setMicrophones] = useState<Devices[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoading(true);

    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const selectedMicStorage = appStorage.getItem(WP_MIC) || 'any';

      const mics: Devices[] = devices
        .filter(d => d.kind === 'audioinput')
        .map(({label, deviceId}: MediaDeviceInfo) => {
          return {
            name: deviceId,
            type: 'radio',
            label,
            value: deviceId,
            checked: selectedMicStorage === deviceId
          };
        });
      mics.unshift({name: 'any', type: 'radio', label: 'Default Microphone', value: 'any', checked: false});

      setMicrophones(mics);
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
      inputs={microphones}
      buttons={[
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: (deviceId: string) => {
            appStorage.setItem(WP_MIC, deviceId);
            onSelect(deviceId);
          }
        }
      ]}
    />
  );
};

export default Microphones;
