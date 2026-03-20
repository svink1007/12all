import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {IonIcon, IonSpinner, IonText, useIonViewWillEnter} from '@ionic/react';
import {checkmarkCircleOutline, closeCircleOutline} from 'ionicons/icons';
import {FileStreamSource, MyStreamSource, TYPES} from '../../types';
import videojs from 'video.js';
import {useTranslation} from 'react-i18next';

type Props = {
  files?: FileStreamSource[] | null;
  myStream?: MyStreamSource | MyStreamSource[] | null;
  onValid: (isValid: boolean) => void;
  cssClass?: string;
  hideSupportedFormats?: boolean;
};

const VIDEO_ID = 'validate-stream-video';
const SUPPORTED = TYPES.map(t => t.label).join(', ');

const MediaValidation: FC<Props> = ({
                                      files,
                                      myStream,
                                      onValid,
                                      cssClass,
                                      hideSupportedFormats
                                    }: Props) => {
  const {t} = useTranslation();

  const [player, setPlayer] = useState<videojs.Player>();
  const [validating, setValidating] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errMessage, setErrorMessage] = useState<string | null>(null);

  useIonViewWillEnter(() => {
    setIsValid(null);
  }, []);

  useEffect(() => {
    const setVideoJsPlayer = () => {
      const vjsPlayer = videojs.getPlayer(VIDEO_ID) || videojs(VIDEO_ID, {muted: true});
      setPlayer(vjsPlayer);
      vjsPlayer.off('error');
    };

    const execute = () => {
      const videoEl = document.getElementById(VIDEO_ID);
      if (videoEl) {
        setVideoJsPlayer();
      } else {
        setTimeout(execute, 100);
      }
    };

    execute();
  }, []);

  useEffect(() => {
    if (!player) {
      return;
    }

    if (!files && !myStream) {
      setIsValid(null);
      return;
    }

    setErrorMessage(null);
    setValidating(true);

    if (files && files.length > 0) {
      let index = 0;
      const validateFile = () => {
        player.src(files[index]);
        player.play()
          ?.then(() => {
            if (files.length > index) {
              index++;
              validateFile();
            } else {
              setValidating(false);
              setIsValid(true);
              onValid(true);
            }
          })
          .catch((err) => {
            setErrorMessage(`${files[index].fileName} - ${err.message}`);
          });
      };

      validateFile();
    } else if (myStream) {
      if (!Array.isArray(myStream) && window.location.hostname !== 'localhost') {
        const reg = new RegExp(window.location.protocol);
        if (!reg.test(myStream.src)) {
          setErrorMessage(`streamValidation.${window.location.protocol === 'https:' ? 'https' : 'http'}`);
          setValidating(false);
          setIsValid(false);
          return;
        }
      }

      player.src(myStream);
      player.play()
        ?.then(() => {
          player.reset();
          setValidating(false);
          setIsValid(true);
          onValid(true);
        })
        .catch((err) => {
          setErrorMessage(err.message);
        });
    }

    player.on('error', () => {
      player.reset();
      setValidating(false);
      setIsValid(false);
      onValid(false);
    });

    return () => {
      player.off('error');
    };
  }, [player, files, myStream, onValid]);

  useEffect(() => {
    setIsValid(null);
  }, [hideSupportedFormats]);

  return (
    <div className={`validate-media ${cssClass ? cssClass : ''} ${files ? 'files' : ''}`}>
      {
        !validating ?
          (
            isValid === null ?
              <div className="supported-formats" hidden={hideSupportedFormats}>
                <IonText color="medium">{t('streamValidation.supportedFormats')}: {SUPPORTED}</IonText>
              </div> :
              isValid ?
                <div className={`media-status ${files ? 'files' : ''}`}>
                  <IonIcon icon={checkmarkCircleOutline} color="success"/>
                  <IonText className="ion-padding-start" color="success">
                    {files ? files.map(f => (<div key={f.id}>{f.fileName}</div>)) : t('streamValidation.valid')}
                  </IonText>
                </div>
                :
                <div className="media-status">
                  <IonIcon icon={closeCircleOutline} color="danger"/>
                  <IonText className="ion-padding-start" color="danger">
                    {errMessage !== null ? t(errMessage) : t('streamValidation.invalid')}
                  </IonText>
                </div>
          ) :
          <div className="media-status">
            <IonSpinner name="lines-small" color="warning" className="ion-padding-start"/>
            <IonText className="ion-padding-start" color="warning">
              {t(`streamValidation.${files ? 'processing' : 'validating'}`)}
            </IonText>
          </div>
      }

      <div hidden>
        <video id={VIDEO_ID} crossOrigin="anonymous" muted/>
      </div>
    </div>
  );
};

export default MediaValidation;
