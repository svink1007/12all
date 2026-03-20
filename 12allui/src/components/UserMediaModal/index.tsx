import React, {FC, useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import './styles.scss';
import {IonButton, IonButtons, IonCard, IonCardContent, IonIcon, IonModal, IonTitle, IonToolbar} from '@ionic/react';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import {WebRTCUserMedia} from '../../pages/WatchParty/types';
import UserMediaSettings from '../UserMediaSettings';
import appStorage from '../../shared/appStorage';
import {WP_CAM, WP_MIC} from '../../shared/constants';
import setUserMedia from '../../redux/actions/userMediaActions';
import {closeCircleOutline} from 'ionicons/icons';

interface DevicesSettingsProps {
  show: boolean;
  setShow: (value: boolean) => void;
  onSelect?: (userMedia: WebRTCUserMedia) => void;
}

const UserMediaModal: FC<DevicesSettingsProps> = ({show, setShow, onSelect}: DevicesSettingsProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const userMedia = useSelector(({userMedia}: ReduxSelectors) => userMedia);
  const mediaChangedRef = useRef<boolean>(false);
  const modalRef = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    const selectedMic = appStorage.getItem(WP_MIC);
    const selectedCam = appStorage.getItem(WP_CAM);

    const mic = selectedMic || 'any';
    const cam = selectedCam || 'none';

    dispatch(setUserMedia({mic, cam}));
  }, [dispatch]);

  useEffect(() => {
    mediaChangedRef.current = true;
  }, [userMedia.cam, userMedia.mic]);

  const modalWillPresent = () => {
    mediaChangedRef.current = false;
  };

  const onDismiss = () => {
    if (show) {
      mediaChangedRef.current && onSelect && onSelect({cam: userMedia.cam, mic: userMedia.mic});
      setShow(false);
    }
  };

  return (
    <IonModal
      isOpen={show}
      ref={modalRef}
      className="wp-settings-modal"
      onDidDismiss={onDismiss}
      onWillPresent={modalWillPresent}
    >
      <IonToolbar>
        <IonTitle>{t('userMediaSettings.header')}</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={onDismiss}>
            <IonIcon icon={closeCircleOutline} slot="icon-only"/>
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonCard>
        <IonCardContent>
          <UserMediaSettings/>
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
};

export default UserMediaModal;
