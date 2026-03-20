import React, {FC, FormEvent, useState} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonInput, IonItem, IonLabel, IonModal, IonTitle, IonToolbar} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import SelectLanguage from '../SelectLanguage';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import SelectCountry from '../SelectCountry';
import SelectLogo from '../SelectLogo';
import {StreamService} from '../../services/StreamService';
import {SaveSharedStream} from '../../shared/types';
import {setErrorToast, setInfoToast} from '../../redux/actions/toastActions';
import SelectGenre from '../SelectGenre';

type Props = {
  show: boolean;
  onDismiss: () => void;
};

const SaveStream: FC<Props> = ({show, onDismiss}: Props) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {language, genre, customStreamUrl} = useSelector(({vlrTemplate}: ReduxSelectors) => vlrTemplate.selected);
  const [streamName, setStreamName] = useState<string>();
  const [streamLanguage, setStreamLanguage] = useState<string | null>(language);
  const [streamGenre, setStreamGenre] = useState<string | null>(genre);
  const [streamCountry, setStreamCountry] = useState<string | null>(null);
  const [streamLogo, setStreamLogo] = useState<File | null>(null);

  const handleCountryChange = (country: string | null) => {
    setStreamCountry(country);
  };

  const handleLanguageChange = (language: string | null) => {
    setStreamLanguage(language);
  };

  const handleGenreChange = (genre: string | null) => {
    setStreamGenre(genre);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (streamName && customStreamUrl) {
      const formData = new FormData();
      streamLogo && formData.append('files.logo_image', streamLogo, streamLogo.name);
      const data: SaveSharedStream = {
        name: streamName.trim(),
        url: customStreamUrl.trim(),
        genre: streamGenre,
        language: streamLanguage,
        country: streamCountry
      };
      formData.append('data', JSON.stringify(data));

      StreamService.saveStream(formData)
        .then(() => {
          dispatch(setInfoToast('manageStream.saved'));
          onDismiss();
        })
        .catch((error) => {
          if (error?.response?.data?.statusCode === 400 && error.response.data.message === 'url_already_exists') {
            dispatch(setErrorToast('manageStream.urlAlreadyExists'));
          } else {
            dispatch(setErrorToast('manageStream.generalError'));
          }
        });
    }
  };

  const handleDismiss = () => {
    onDismiss();
  };


  const handleLogoSelection = (logo: File | null) => {
    setStreamLogo(logo);
  };

  return (
    <IonModal
      isOpen={show}
      backdropDismiss={false}
      className="save-stream-modal"
    >
      <form onSubmit={handleSubmit}>
        <IonToolbar className="toolbar-header">
          <IonTitle>
            <h1>{t('manageStream.titleSave')}</h1>
            <h2>{customStreamUrl}</h2>
          </IonTitle>
        </IonToolbar>

        <IonItem className="row-item">
          <IonLabel position="floating">
            {t('manageStream.streamName')}
          </IonLabel>
          <IonInput
            value={streamName}
            placeholder={t('manageStream.enterStreamName')}
            onIonChange={(e) => setStreamName(e.detail.value || '')}
            required
          />
        </IonItem>

        <SelectLogo onLogoSelected={handleLogoSelection}/>

        <SelectCountry
          country={streamCountry}
          onSelect={handleCountryChange}
          showInput
        />

        <SelectLanguage
          language={streamLanguage}
          onSelect={handleLanguageChange}
          showInput
        />

        <SelectGenre
          genre={streamGenre}
          onSelect={handleGenreChange}
          showInput
        />

        <IonToolbar className="toolbar-footer">
          <IonButtons slot="end">
            <IonButton onClick={handleDismiss}>{t('common.cancel')}</IonButton>
            <IonButton type="submit" disabled={!streamName}>{t('common.save')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </form>
    </IonModal>
  );
};

export default SaveStream;
