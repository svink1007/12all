import React, {FC, useRef, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import setUserMedia from '../../redux/actions/userMediaActions';
import appStorage from '../../shared/appStorage';
import {WP_CAM} from '../../shared/constants';

type Props = {
  show: boolean;
  onOk: (cam: string) => void;
  onCancel: () => void;
};

const SelectCamera: FC<Props> = ({show, onOk, onCancel}: Props) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const userMediaStream = useRef<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('any');

  const handleOnWillPresent = async () => {
    setLoading(true);
    userMediaStream.current = await navigator.mediaDevices.getUserMedia({audio: false, video: true});
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(d => d.kind === 'videoinput');
    cameras.unshift({deviceId: 'any', label: 'Default camera'} as MediaDeviceInfo);
    setCameraDevices(cameras);
    setLoading(false);
  };

  const handleOnWillDismiss = () => {
    if (userMediaStream.current) {
      userMediaStream.current.getTracks().forEach(track => track.stop());
      userMediaStream.current = null;
    }
  };

  const handleOk = () => {
    appStorage.setItem(WP_CAM, selectedCamera);
    dispatch(setUserMedia({cam: selectedCamera}));
    onOk(selectedCamera);
  };

  return (
    <IonModal
      className="select-camera-modal"
      isOpen={show}
      onWillPresent={handleOnWillPresent}
      onWillDismiss={handleOnWillDismiss}
    >
      <IonToolbar>
        <IonTitle>{t('selectCamera.header')}</IonTitle>
      </IonToolbar>
      <IonCard>
        <IonCardContent>
          {
            loading ?
              <div className="loading-container">
                <IonSpinner name="lines"/>
              </div>
              :
              <>
                <IonRadioGroup
                  value={selectedCamera}
                  onIonChange={(e) => setSelectedCamera(e.detail.value)}
                >
                  {cameraDevices.map(({deviceId, label}: MediaDeviceInfo) => (
                    <IonItem key={deviceId} lines="none">
                      <IonRadio value={deviceId} slot="start"/>
                      <IonLabel>{label}</IonLabel>
                    </IonItem>
                  ))}
                </IonRadioGroup>
                <IonItem lines="none">
                  <IonButtons slot="end">
                    <IonButton color="primary" onClick={onCancel}>{t('common.cancel')}</IonButton>
                    <IonButton color="primary" onClick={handleOk}>{t('common.ok')}</IonButton>
                  </IonButtons>
                </IonItem>
              </>
          }
        </IonCardContent>
      </IonCard>
    </IonModal>
  )
};

export default SelectCamera;
