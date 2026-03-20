import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonPopover,
  IonText,
  isPlatform
} from '@ionic/react';
import {appsOutline, caretDown, cubeOutline, informationCircleOutline} from 'ionicons/icons';
import {useTranslation} from 'react-i18next';
import {ShareStreamOption} from '../../enums';
import myStream from '../../../../images/icons/my-stream.svg';
import file from '../../../../images/icons/file.svg';
import myCamera from '../../../../images/icons/my-camera.svg';
import obsLogo from '../../../../images/icons/obs-logo.png';
import screen from '../../../../images/icons/screen.svg';
import appStorage from '../../../../shared/appStorage';
import {HTMLVideoStreamElement} from '../../types';
import {IS_CHROME} from '../../../../shared/constants';
import TipsModal from '../../../../components/TipsModal';
import TipButton from '../TipButton';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../../redux/shared/types';

interface ShareProps {
  selected: ShareStreamOption | null;
  onSelect: (value: ShareStreamOption) => void;
}

const SELECTED_COLOR = 'secondary';
const CHROMIUM_MESSAGE_HIDE = 'chromiumMessageHide';

const ShareOptions: FC<ShareProps> = ({selected, onSelect}: ShareProps) => {
  const {t} = useTranslation();
  const {showDebugInfo} = useSelector(({profile}: ReduxSelectors) => profile);

  const [captureStreamSupport, setCaptureStreamSupport] = useState<boolean>(true);
  const [popoverState, setPopoverState] = useState<{ event?: Event, show: boolean }>({show: false});
  const [showChromiumMessage, setShowChromiumMessage] = useState<boolean>(false);
  const [showChromiumAlert, setShowChromiumAlert] = useState<boolean>(false);

  const [openTipModal, setOpenTipModal] = useState<boolean>(false);
  const [tipContent, setTipContent] = useState<Array<string>>([]);

  const showTip = (tipId: string) => {
    setTipContent([t(`vlrTips.${tipId}.title`), t(`vlrTips.${tipId}.tip`)]);
    setOpenTipModal(true);
  };

  const handleModalDismiss = () => {
    setOpenTipModal(false);
  };

  useEffect(() => {
    const videoEl: HTMLVideoStreamElement = document.createElement('video');
    setCaptureStreamSupport(!!videoEl.captureStream || !!videoEl.mozCaptureStream);

    const data = appStorage.getItem(CHROMIUM_MESSAGE_HIDE);
    setShowChromiumMessage(!data);
  }, []);

  const handleOnClick = (event: any) => {
    event.persist();
    setPopoverState({event, show: true});
  };

  const handlePopoverDismiss = () => {
    setPopoverState({show: false});
  };

  const handleSelect = (value: ShareStreamOption) => {
    onSelect(value);
    handlePopoverDismiss();
  };

  const handleChromiumOK = () => {
    appStorage.setItem(CHROMIUM_MESSAGE_HIDE, 'true');
    setShowChromiumMessage(false);
  };

  return (
    isPlatform('ios') ?
      <IonItem lines="none" className="share-options-item" detail={false}>
        <IonImg src={myCamera}/>
        <IonLabel>{t('watchPartyShareOptions.camera')}</IonLabel>
      </IonItem>
      :
      <>
        <TipsModal
          show={openTipModal}
          content={tipContent}
          onDismiss={handleModalDismiss}
        />
        <IonItem lines="none" button onClick={handleOnClick} className="share-options-item" detail={false}>
          {
            (() => {
              switch (selected) {
                case ShareStreamOption.Stream:
                  return (
                    <>
                      <IonImg src={myStream}/>
                      <IonLabel>{t('watchPartyShareOptions.stream')}</IonLabel>
                    </>
                  );
                case ShareStreamOption.File:
                  return (
                    <>
                      <IonImg src={file}/>
                      <IonLabel>{t('watchPartyShareOptions.file')}</IonLabel>
                    </>
                  );
                case ShareStreamOption.Camera:
                  return (
                    <>
                      <IonImg src={myCamera}/>
                      <IonLabel>{t('watchPartyShareOptions.camera')}</IonLabel>
                    </>
                  );
                case ShareStreamOption.Obs:
                  return (
                    <>
                      <IonImg src={obsLogo}/>
                      <IonLabel>{t('watchPartyShareOptions.obs')}</IonLabel>
                    </>
                  );
                case ShareStreamOption.Screen:
                  return (
                    <>
                      <IonImg src={screen}/>
                      <IonLabel>{t('watchPartyShareOptions.screen')}</IonLabel>
                    </>
                  );
                case ShareStreamOption.Hls:
                  return (
                    <>
                      <IonIcon icon={cubeOutline} color="dark" className="hls-icon"/>
                      <IonLabel>HLS</IonLabel>
                    </>
                  );
                default:
                  return (
                    <>
                      <IonIcon icon={appsOutline} className="select-share-icon"/>
                      <IonText color="medium">{t('watchPartyShareOptions.selectSharing')}</IonText>
                    </>
                  );
              }
            })()
          }
          <IonIcon icon={caretDown} className="select-caret-icon"/>

          {
            !showChromiumMessage && IS_CHROME && (selected === ShareStreamOption.Stream || selected === ShareStreamOption.File) &&
            <IonButtons slot="end">
              <IonButton onClick={(e) => {
                e.stopPropagation();
                setShowChromiumAlert(true);
              }
              }>
                <IonIcon icon={informationCircleOutline} slot="icon-only"/>
              </IonButton>
            </IonButtons>
          }
        </IonItem>

       
        <IonText color="warning" className="share-options-warning-message-no-support" hidden={captureStreamSupport}>
          {t('watchPartyShareOptions.noSupport')}
        </IonText>

        <IonItem
          lines="none"
          hidden={
            !showChromiumMessage ||
            !captureStreamSupport ||
            !IS_CHROME ||
            selected === ShareStreamOption.Camera ||
            selected === ShareStreamOption.Screen ||
            selected === ShareStreamOption.Hls
          }>
          <IonText color="warning" className="share-options-warning-message">
            {t('watchPartyShareOptions.hardwareSwitchOff')}
          </IonText>
          <IonButton slot="end" onClick={handleChromiumOK}>OK</IonButton>
        </IonItem>

        <IonPopover
          isOpen={popoverState.show}
          event={popoverState.event}
          onDidDismiss={handlePopoverDismiss}
          className="wp-share-options-popover"
        >
          {
            captureStreamSupport &&
            <>
              <IonItem
                className="option-wrapper"
                color={selected === ShareStreamOption.Stream ? SELECTED_COLOR : ''}
                detail={false}
              >
                <IonItem
                  button
                  lines="none"
                  onClick={() => handleSelect(ShareStreamOption.Stream)}
                  detail={false}
                  className="option"
                >
                  <IonImg src={myStream} slot="start"/>
                  <IonLabel>{t('watchPartyShareOptions.stream')}</IonLabel>
                </IonItem>
                <TipButton onClick={() => showTip('myStream')}/>
              </IonItem>

              <IonItem
                className="option-wrapper"
                color={selected === ShareStreamOption.File ? SELECTED_COLOR : ''}
                detail={false}
              >
                <IonItem
                  button
                  lines="none"
                  onClick={() => handleSelect(ShareStreamOption.File)}
                  detail={false}
                  className="option"
                >
                  <IonImg src={file} slot="start"/>
                  <IonLabel>{t('watchPartyShareOptions.file')}</IonLabel>
                </IonItem>
                <TipButton onClick={() => showTip('videoAudioFile')}/>
              </IonItem>
            </>
          }
          <IonItem
            className="option-wrapper"
            color={selected === ShareStreamOption.Camera ? SELECTED_COLOR : ''}
            detail={false}
          >
            <IonItem
              button
              lines="none"
              onClick={() => handleSelect(ShareStreamOption.Camera)}
              detail={false}
              className="option"
            >
              <IonImg src={myCamera} slot="start"/>
              <IonLabel>{t('watchPartyShareOptions.camera')}</IonLabel>
            </IonItem>
            <TipButton onClick={() => showTip('shareMyCamera')}/>
          </IonItem>

          <IonItem
            className="option-wrapper"
            color={selected === ShareStreamOption.Obs ? SELECTED_COLOR : ''}
            detail={false}
          >
            <IonItem
              button
              lines="none"
              onClick={() => handleSelect(ShareStreamOption.Obs)}
              detail={false}
              className="option"
            >
              <IonImg src={obsLogo} slot="start"/>
              <IonLabel>{t('watchPartyShareOptions.obs')}</IonLabel>
            </IonItem>
            <TipButton onClick={() => showTip('shareMyCamera')}/>
          </IonItem>

          <IonItem
            className="option-wrapper"
            color={selected === ShareStreamOption.Screen ? SELECTED_COLOR : ''}
            detail={false}
          >
            <IonItem
              button
              lines="none"
              onClick={() => handleSelect(ShareStreamOption.Screen)}
              detail={false}
              className="option"
            >
              <IonImg src={screen} slot="start"/>
              <IonLabel>{t('watchPartyShareOptions.screen')}</IonLabel>
            </IonItem>
            <TipButton onClick={() => showTip('shareMyScreen')}/>
          </IonItem>

          {
            showDebugInfo &&
            <IonItem
              className="option-wrapper"
              color={selected === ShareStreamOption.Hls ? SELECTED_COLOR : ''}
              detail={false}
            >
              <IonItem
                button
                lines="none"
                onClick={() => handleSelect(ShareStreamOption.Hls)}
                detail={false}
                className="option"
              >
                <IonIcon icon={cubeOutline} slot="start" color="dark"/>
                <IonLabel>HLS</IonLabel>
              </IonItem>
              <TipButton onClick={() => showTip('HLS')}/>
            </IonItem>
          }

          {/*<IonItem*/}
          {/*  button*/}
          {/*  lines="none"*/}
          {/*  onClick={() => handleSelect(ShareStreamOption.RP)}*/}
          {/*  color={selected === ShareStreamOption.RP ? SELECTED_COLOR : ''}*/}
          {/*>*/}
          {/*  <IonIcon icon={filmOutline} slot="start" color="dark"/>*/}
          {/*  <IonLabel>RP</IonLabel>*/}
          {/*</IonItem>*/}
        </IonPopover>

        <IonAlert
          isOpen={showChromiumAlert}
          onDidDismiss={() => setShowChromiumAlert(false)}
          message={t('watchPartyShareOptions.hardwareSwitchOff')}
          buttons={['OK']}
        />
      </>
  );
};

export default ShareOptions;
