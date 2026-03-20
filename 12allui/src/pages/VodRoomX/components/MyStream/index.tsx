import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import './styles.scss';
import {IonButton, IonButtons, IonCheckbox, IonIcon, IonInput, IonItem, IonLabel} from '@ionic/react';
import {MyStreamSource, TYPES} from '../../types';
import {filmOutline} from 'ionicons/icons';
import MediaValidation from '../MediaValidation';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../../redux/shared/types';
import SaveStream from '../../../../components/SaveStream';
import SelectStream from '../../../../components/SelectStream';
import {SharedStream} from '../../../../shared/types';

export const getStreamSource = (url: string) => {
  let source: MyStreamSource | MyStreamSource[] | null = null;
  const input = url.trim();

  if (input) {
    const known = TYPES.find(t => new RegExp(t.label).test(input));

    if (known) {
      source = {src: input, type: known.value};
    } else {
      source = TYPES.map((t) => ({src: input, type: t.value}));
    }
  }

  return source;
};

type Props = {
  hideSaveButton?: boolean;
  showIcon?: boolean;
  validate?: boolean;
  showCustomStream?: boolean;
  enterCustomStreamColor?: 'medium'
  onSrc: (source: MyStreamSource | MyStreamSource[] | null, isValid?: boolean, stream?: SharedStream) => void;
  onValid: (isValid: boolean) => void;
  onCustomUrlValidationStart?: (url: string) => void;
  onShowCustomUrlChange?: (value: boolean) => void;
};

const MyStream: FC<Props> = ({
                               hideSaveButton,
                               showIcon,
                               validate,
                               showCustomStream,
                               onSrc,
                               onValid,
                               onCustomUrlValidationStart,
                               onShowCustomUrlChange
                             }: Props) => {
  const {t} = useTranslation();

  const vlrTemplate = useSelector(({vlrTemplate}: ReduxSelectors) => vlrTemplate.selected);

  const inputRef = useRef<HTMLIonInputElement>(null);

  const [previewSrc, setPreviewSrc] = useState<MyStreamSource | MyStreamSource[] | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [showAddStream, setShowAddStream] = useState<boolean>(false);
  const [streamIsValid, setStreamIsValid] = useState<boolean>(false);

  const handleOnValid = useCallback((isValid: boolean) => {
    onValid(isValid);
    setStreamIsValid(isValid);
    setIsValidating(false);
    !isValid && setShowAddStream(false);
  }, [onValid]);

  const handleValidate = useCallback((url: string) => {
    if (url) {
      const source = getStreamSource(url);
      setIsValidating(true);
      setPreviewSrc(source);
      onSrc(source);
    } else {
      setIsValidating(false);
      setPreviewSrc(null);
      onSrc(null);
    }
  }, [onSrc]);

  useEffect(() => {
    if (validate && inputRef.current) {
      if (!inputRef.current.value) {
        inputRef.current?.setFocus();
      } else {
        handleValidate(inputRef.current.value as string);
      }
    }
  }, [validate, handleValidate]);

  const handleEnterCustomStreamChange = (showCustomStream: boolean) => {
    onValid(!showCustomStream);
    onShowCustomUrlChange && onShowCustomUrlChange(showCustomStream);
  };

  const handleStreamChange = useCallback((stream: SharedStream) => {
    const source = getStreamSource(stream.url);
    onSrc(source, true, stream);
  }, [onSrc]);

  const handleCustomStreamValidation = () => {
    if (inputRef.current) {
      onValid(false);
      onCustomUrlValidationStart && onCustomUrlValidationStart(inputRef.current.value as string);
      handleValidate(inputRef.current.value as string);
    }
  };

  const handleOpenSaveStream = () => {
    setStreamIsValid(false);
    setShowAddStream(true);
    handleCustomStreamValidation();
  };

  const handleResetValidation = () => {
    setStreamIsValid(false);
    setPreviewSrc(null);
    onSrc(null);
  };

  return (
    <section className="my-stream-component">
      <section hidden={!showCustomStream}>
        <IonItem className="my-stream-item">
          {showIcon && <IonIcon slot="start" icon={filmOutline} className="ion-align-self-center" color="dark"/>}
          <IonLabel position="stacked">{t('watchPartyMyStream.streamUrl')}</IonLabel>

          <IonInput
            ref={inputRef}
            value={vlrTemplate.customStreamUrl}
            onIonBlur={handleCustomStreamValidation}
            placeholder={t('watchPartyMyStream.enterStreamUrl')}
          />

          <IonButtons slot="end">
            <IonButton
              onClick={handleOpenSaveStream}
              color="success"
              fill="solid"
              size="small"
              hidden={hideSaveButton}
            >
              {t('common.save')}
            </IonButton>

            <IonButton
              onClick={handleCustomStreamValidation}
              disabled={isValidating}
              color="primary"
              fill="solid"
              size="small"
            >
              {t('watchPartyMyStream.validate')}
            </IonButton>
          </IonButtons>
        </IonItem>

        <SaveStream
          show={showAddStream && streamIsValid}
          onDismiss={() => setShowAddStream(false)}
        />
      </section>

      <section hidden={showCustomStream}>
        <SelectStream
          inputLabel="watchPartyMyStream.stream"
          inputPlaceholder="watchPartyMyStream.selectStream"
          onSelect={handleStreamChange}
          onResetValidation={handleResetValidation}
        />
      </section>

      <MediaValidation
        myStream={previewSrc}
        onValid={handleOnValid}
        hideSupportedFormats={!showCustomStream}
      />

      <IonItem lines="none" className="enter-custom-stream">
        <IonCheckbox
          checked={showCustomStream}
          onIonChange={(e) => handleEnterCustomStreamChange(e.detail.checked)}
          slot="start"
        />
        <IonLabel>Enter custom stream</IonLabel>
      </IonItem>
    </section>
  );
};

export default MyStream;
