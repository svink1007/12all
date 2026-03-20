import React, {FC, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import './styles.scss';
import {IonIcon, IonItem, IonSelect, IonSelectOption} from '@ionic/react';
import {micOutline, videocamOutline} from 'ionicons/icons';
import appStorage from '../../shared/appStorage';
import {WP_CAM, WP_MIC} from '../../shared/constants';
import {useDispatch, useSelector} from 'react-redux';
import setUserMedia from '../../redux/actions/userMediaActions';
import {ReduxSelectors} from '../../redux/shared/types';

const UserMediaSettings: FC = () => {
  const {t} = useTranslation();

  const dispatch = useDispatch();
  const userMedia = useSelector(({userMedia}: ReduxSelectors) => userMedia);

  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const onAudioDeviceChange = (id: string) => {
    appStorage.setItem(WP_MIC, id);
    dispatch(setUserMedia({mic: id}));
  };

  const onVideoDeviceChange = (id: string) => {
    appStorage.setItem(WP_CAM, id);
    dispatch(setUserMedia({cam: id}));
  };

  const updateMicrophoneDevices = () => {
    const setDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices.filter(d => d.kind === 'audioinput' && d.deviceId !== '');
      microphones.unshift({deviceId: 'any', label: 'Default Microphone'} as MediaDeviceInfo);
      setMicrophoneDevices(microphones);
    };

    setDevices().catch(err => console.error(err));
  };

  const updateCameraDevices = () => {
    const setDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput' && d.deviceId !== '');
      cameras.unshift({deviceId: 'any', label: 'Default camera'} as MediaDeviceInfo);
      cameras.unshift({deviceId: 'none', label: 'No Camera'} as MediaDeviceInfo);
      setCameraDevices(cameras);
    };

    setDevices().catch(err => console.error(err));
  };

  useEffect(() => {
    const setDevices = async () => {
      setLoading(true);

      const getDevices = async () => {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        userMediaStream.getTracks().forEach(track => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();

        const microphones = devices.filter(d => d.kind === 'audioinput');
        microphones.unshift({deviceId: 'any', label: 'Default Microphone'} as MediaDeviceInfo);
        setMicrophoneDevices(microphones);

        const cameras = devices.filter(d => d.kind === 'videoinput');
        cameras.unshift({deviceId: 'any', label: 'Default camera'} as MediaDeviceInfo);
        cameras.unshift({deviceId: 'none', label: 'No Camera'} as MediaDeviceInfo);
        setCameraDevices(cameras);

        return {mic: microphones, cam: cameras};
      };
      const devices = await getDevices();
      const selectedMic = appStorage.getItem(WP_MIC);
      const selectedCam = appStorage.getItem(WP_CAM);

      const mic = selectedMic || (devices.mic.length && devices.mic[0].deviceId) || '';
      const cam = selectedCam || (devices.cam.length && devices.cam[0].deviceId) || '';

      dispatch(setUserMedia({mic, cam}));

      setLoading(false);
    };

    setDevices().catch((err) => console.error(err));
  }, [dispatch]);

  return (
    <>
      <IonItem className="mic-item">
        <IonIcon icon={micOutline} color="dark" slot="start"/>
        <IonSelect
          value={userMedia.mic}
          onIonFocus={updateMicrophoneDevices}
          onIonChange={e => onAudioDeviceChange(e.detail.value)}
          placeholder={t(`userMediaSettings.${loading ? 'loading' : 'micPlaceholder'}`)}
          interfaceOptions={{cssClass: 'select-device-alert'}}
        >
          {microphoneDevices.map((d: MediaDeviceInfo, i: number) =>
            <IonSelectOption
              key={`${d.deviceId}-${i}`}
              value={d.deviceId}>
              {d.label}
            </IonSelectOption>)
          }
        </IonSelect>
      </IonItem>
      <IonItem className="cam-item">
        <IonIcon icon={videocamOutline} color="dark" slot="start"/>
        <IonSelect
          value={userMedia.cam}
          onIonFocus={updateCameraDevices}
          onIonChange={e => onVideoDeviceChange(e.detail.value)}
          placeholder={t(`userMediaSettings.${loading ? 'loading' : 'camPlaceholder'}`)}
          interfaceOptions={{cssClass: 'select-device-alert'}}
        >
          {cameraDevices.map((d: MediaDeviceInfo, i: number) =>
            <IonSelectOption
              key={`${d.deviceId}-${i}`}
              value={d.deviceId}
            >
              {d.label}
            </IonSelectOption>)}
        </IonSelect>
      </IonItem>
    </>
  );
};

export default UserMediaSettings;
