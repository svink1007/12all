import React, {FC, FormEvent, useCallback, useEffect, useState} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonInput, IonItem, IonLabel, IonModal, IonTitle, IonToolbar} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import SelectLanguage from '../SelectLanguage';
import SelectCountry from '../SelectCountry';
import SelectLogo from '../SelectLogo';
import {StreamService} from '../../services/StreamService';
import {DbImage, SaveSharedStream, SharedStream} from '../../shared/types';
import {setErrorToast, setInfoToast} from '../../redux/actions/toastActions';
import {useDispatch} from 'react-redux';
import MediaValidation from '../../pages/WatchParty/components/MediaValidation';
import {MyStreamSource, TYPES} from '../../pages/WatchParty/types';
import SelectGenre from '../SelectGenre';
import {API_URL} from '../../shared/constants';

type EditSharedStream = {
  id?: number;
  name: string;
  url: string;
  logoFile: File | null;
  logoImage: DbImage | null;
  genre?: string | null;
  country?: string | null;
  language?: string | null;
};

type Props = {
  stream: SharedStream;
  open: boolean;
  onDismiss: () => void;
  onUpdateStream: (stream: SharedStream) => void;
};

const EditStream: FC<Props> = ({stream, open, onDismiss, onUpdateStream}: Props) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [currentStream, setCurrentStream] = useState<EditSharedStream>({url: '', name: '', logoFile: null, logoImage: null});
  const [previewSrc, setPreviewSrc] = useState<MyStreamSource | MyStreamSource[] | null>(null);
  const [streamUrlIsValid, setStreamUrlIsValid] = useState<boolean>(true);


  useEffect(() => {
    const {id, url, name, genre, country, language, logo_image} = stream;
    setCurrentStream({
      id,
      url,
      name,
      genre,
      country,
      language,
      logoImage: logo_image || null,
      logoFile: null
    });
  }, [stream]);

  const handleCountryChange = (country: string | null) => {
    setCurrentStream(prevState => ({...prevState, country}));
  };

  const handleLanguageChange = (language: string | null) => {
    setCurrentStream(prevState => ({...prevState, language}));
  };

  const handleGenreChange = (genre: string | null) => {
    setCurrentStream(prevState => ({...prevState, genre}));
  };

  const handleLogoSelection = (logo: File | null) => {
    setCurrentStream(prevState => ({...prevState, logoImage: null, logoFile: logo}));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (currentStream.name && currentStream.url && streamUrlIsValid) {
      const formData = new FormData();
      currentStream.logoFile && formData.append('files.logo_image', currentStream.logoFile, currentStream.logoFile.name);
      const data: SaveSharedStream = {
        id: stream.id,
        name: currentStream.name.trim(),
        url: currentStream.url.trim(),
        genre: currentStream.genre,
        language: currentStream.language,
        country: currentStream.country
      };
      if (!currentStream.logoImage && !currentStream.logoFile) {
        data.logo_image = null;
      }
      formData.append('data', JSON.stringify(data));

      StreamService.editStream(formData, stream.id)
        .then(({data}) => {
          dispatch(setInfoToast('manageStream.edited'));
          onUpdateStream(data);
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

  const handleValidate = () => {
    setStreamUrlIsValid(false);

    if (currentStream.url) {
      let source: MyStreamSource | MyStreamSource[];

      const known = TYPES.find(t => new RegExp(t.label).test(currentStream.url));

      if (known) {
        source = {src: currentStream.url, type: known.value};
      } else {
        source = TYPES.map((t) => ({src: currentStream.url, type: t.value}));
      }

      setPreviewSrc(source);
    } else {
      setPreviewSrc(null);
    }
  };

  const handleOnValid = useCallback((isValid: boolean) => {
    setStreamUrlIsValid(isValid);
  }, []);

  return (
    <IonModal
      isOpen={open}
      backdropDismiss={false}
      className="edit-stream-modal"
    >
      <form onSubmit={handleSubmit}>
        <IonToolbar className="toolbar-header">
          <IonTitle>{t('manageStream.titleEdit')} {stream.name}</IonTitle>
        </IonToolbar>

        <IonItem className="row-item">
          <IonLabel position="floating">
            {t('manageStream.streamName')}
          </IonLabel>
          <IonInput
            value={currentStream.name}
            placeholder={t('manageStream.enterStreamName')}
            onIonChange={(e) => setCurrentStream(prevState => ({...prevState, name: e.detail.value || ''}))}
            required
          />
        </IonItem>

        <IonItem className="row-item">
          <IonLabel position="floating">
            {t('manageStream.streamUrl')}
          </IonLabel>
          <IonInput
            value={currentStream.url}
            placeholder={t('manageStream.enterStreamUrl')}
            onIonBlur={handleValidate}
            onIonChange={(e) => setCurrentStream(prevState => ({
              ...prevState,
              url: e.detail.value ? e.detail.value.trim() : ''
            }))}
            required
          />
          <IonButton slot="end" onClick={handleValidate} className="validate-button">{t('validate')}</IonButton>
        </IonItem>

        <MediaValidation
          myStream={previewSrc}
          onValid={handleOnValid}
        />

        <SelectLogo
          logo={currentStream.logoImage?.url ? `${API_URL}${currentStream.logoImage.url}` : null}
          onLogoSelected={handleLogoSelection}
        />

        <SelectCountry
          country={currentStream.country || null}
          onSelect={handleCountryChange}
          showInput
        />

        <SelectLanguage
          language={currentStream.language || null}
          onSelect={handleLanguageChange}
          showInput
        />

        <SelectGenre
          genre={currentStream.genre || null}
          onSelect={handleGenreChange}
          showInput
        />

        <IonToolbar className="toolbar-footer">
          <IonButtons slot="end">
            <IonButton onClick={handleDismiss}>
              {t('common.cancel')}
            </IonButton>
            <IonButton type="submit" disabled={!currentStream.name || !streamUrlIsValid}>
              {t('common.edit')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </form>
    </IonModal>
  );
};

export default EditStream;
