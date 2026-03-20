import React, { FC, FormEvent, useCallback, useState } from "react";
import "./styles.scss";
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  HTMLVideoStreamElement,
  SaveSharedStream,
  SharedStream,
} from "../../../../shared/types";
import { StreamService } from "../../../../services";
import {
  setErrorToast,
  setInfoToast,
} from "../../../../redux/actions/toastActions";
import SelectCountry from "../../../../components/SelectCountry";
import SelectLanguage from "../../../../components/SelectLanguage";
import SelectGenre from "../../../../components/SelectGenre";
import SelectLogo from "../../../../components/SelectLogo";
import {
  addStream,
  updateStream,
} from "../../../../redux/actions/broadcastActions";
import ReactPlayer from "react-player";
import {
  checkmark,
  checkmarkCircleOutline,
  closeCircleOutline,
} from "ionicons/icons";
import Loader from "../../../../components/Loader";
import { API_URL } from "../../../../shared/constants";

type Props = {
  show: boolean;
  stream?: SharedStream;
  onDismiss: () => void;
};

const SaveStream: FC<Props> = ({ show, stream, onDismiss }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [streamName, setStreamName] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamGenre, setStreamGenre] = useState<string | null>(null);
  const [streamLanguage, setStreamLanguage] = useState<string | null>(null);
  const [streamCountry, setStreamCountry] = useState<string | null>(null);
  const [streamLogoFile, setStreamLogoFile] = useState<File | null>(null);
  const [streamLogoImage, setStreamLogoImage] = useState<string | null>(null);
  const [validateStreamUrl, setValidateStreamUrl] = useState<boolean | null>(
    null
  );
  const [streamUrlIsValid, setStreamUrlIsValid] = useState<boolean | null | 2>(
    null
  );
  const [saving, setSaving] = useState<boolean>(false);

  const handleWillPresent = () => {
    if (stream) {
      const { name, url, genre, language, country, logo_image } = stream;
      setStreamName(name);
      setStreamUrl(url);
      setStreamGenre(genre);
      setStreamLanguage(language);
      setStreamCountry(country);
      setStreamLogoImage(logo_image ? `${API_URL}${logo_image.url}` : null);
      setStreamLogoFile(null);
      setStreamUrlIsValid(2);
    }
  };

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

    if (streamName && streamUrl && streamUrlIsValid) {
      const formData = new FormData();

      if (streamLogoFile) {
        formData.append(
          "files.logo_image",
          streamLogoFile,
          streamLogoFile.name
        );
      }

      const streamData: SaveSharedStream = {
        name: streamName.trim(),
        url: streamUrl.trim(),
        genre: streamGenre,
        language: streamLanguage,
        country: streamCountry,
      };

      if (stream) {
        streamData.id = stream.id;
      }

      if (!streamLogoImage && !streamLogoFile) {
        streamData.logo_image = null;
      }

      formData.append("data", JSON.stringify(streamData));

      const execute = async () => {
        setSaving(true);

        if (stream) {
          const { data } = await StreamService.editStream(formData, stream.id);
          dispatch(setInfoToast("manageStream.edited"));
          dispatch(updateStream(data));
        } else {
          const { data } = await StreamService.saveStream(formData);
          dispatch(setInfoToast("manageStream.saved"));
          dispatch(addStream(data));
        }

        setStreamName(null);
        setStreamUrl(null);
        setStreamGenre(null);
        setStreamLanguage(null);
        setStreamCountry(null);
        setStreamLogoFile(null);
        setStreamLogoImage(null);
        setValidateStreamUrl(null);
        setStreamUrlIsValid(null);
        onDismiss();
      };

      execute()
        .catch((error) => {
          if (
            error?.response?.data?.statusCode === 400 &&
            error.response.data.message === "url_already_exists"
          ) {
            dispatch(setErrorToast("manageStream.urlAlreadyExists"));
          } else {
            dispatch(setErrorToast("manageStream.generalError"));
          }
        })
        .finally(() => setSaving(false));
    }
  };

  const handleDismiss = () => {
    setValidateStreamUrl(null);
    setStreamUrlIsValid(null);
    onDismiss();
  };

  const handleLogoSelection = (logo: File | null) => {
    setStreamLogoFile(logo);
    !logo && setStreamLogoImage(null);
  };

  const handleValidateStreamUrl = () => {
    if (streamUrl) {
      setStreamUrlIsValid(null);
      setValidateStreamUrl(true);
    }
  };

  const handlePlayerReady = useCallback((player: ReactPlayer) => {
    const showError = () => {
      setValidateStreamUrl(false);
      setStreamUrlIsValid(false);
    };

    const videoElement = player.getInternalPlayer() as HTMLVideoStreamElement;
    const playTimeout = setTimeout(() => {
      showError();
      videoElement.pause();
    }, 5000);

    try {
      videoElement
        .play()
        .then(() => {
          clearTimeout(playTimeout);

          let capturedStream = null;

          if (videoElement.captureStream) {
            capturedStream = videoElement.captureStream();
          } else if (videoElement.mozCaptureStream) {
            capturedStream = videoElement.mozCaptureStream();
          } else {
            showError();
            return;
          }

          if (capturedStream.getVideoTracks().length > 0) {
            videoElement.pause();
            setValidateStreamUrl(false);
            setStreamUrlIsValid(true);
          } else {
            showError();
          }
        })
        .catch(() => showError());
    } catch (e) {
      showError();
    }
  }, []);

  const renderValidateState = () => {
    switch (streamUrlIsValid) {
      case null:
        return (
          <IonItem className="validating-stream" lines="none" color="light">
            <IonSpinner color="warning" />
            <IonText color="warning">
              {t("streamValidation.validating")}
            </IonText>
          </IonItem>
        );
      case true:
        return (
          <IonItem className="valid-stream" lines="none" color="light">
            <IonIcon icon={checkmark} color="success" />
            <IonText color="success">{t("streamValidation.valid")}</IonText>
          </IonItem>
        );
      case false:
        return (
          <IonItem lines="none" color="light">
            <IonText color="danger" className="invalid-stream">
              {t("streamValidation.invalid")}
            </IonText>
          </IonItem>
        );
      default:
        return null;
    }
  };

  return (
    <IonModal
      isOpen={show}
      onWillPresent={handleWillPresent}
      backdropDismiss={false}
      className="save-stream-modal"
    >
      <form onSubmit={handleSubmit}>
        <IonToolbar className="form-toolbar">
          <IonButtons slot="start">
            <IonButton
              type="submit"
              className="submit-form-button"
              disabled={!streamName || !streamUrlIsValid}
              color="dark"
            >
              <IonIcon icon={checkmarkCircleOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>

          <IonTitle className="ion-text-center">
            {t(stream ? "manageStream.editStream" : "manageStream.addStream")}
          </IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={handleDismiss} color="dark">
              <IonIcon icon={closeCircleOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        <IonItem className="row-item" detail={false}>
          <IonLabel position="floating">
            {t("manageStream.streamName")}
          </IonLabel>
          <IonInput
            value={streamName}
            placeholder={t("manageStream.enterStreamName")}
            onIonChange={(e) =>
              setStreamName(e.detail.value ? e.detail.value.trim() : "")
            }
            required
          />
        </IonItem>

        <IonItem className="row-item" detail={false}>
          <IonLabel position="floating">{t("manageStream.streamUrl")}</IonLabel>
          <IonInput
            value={streamUrl}
            placeholder={t("manageStream.enterStreamUrl")}
            onIonChange={(e) => setStreamUrl(e.detail.value || "")}
            onIonBlur={handleValidateStreamUrl}
            required
          />

          <IonButton
            slot="end"
            size="small"
            className="validate-stream-button"
            disabled={!streamUrl || saving}
            onClick={handleValidateStreamUrl}
          >
            {t("common.validate")}
          </IonButton>
        </IonItem>

        <div
          className={`stream-validation-item ${
            (streamUrlIsValid === null || streamUrlIsValid === 2) &&
            validateStreamUrl === null
              ? "ion-hide"
              : ""
          }`}
        >
          {renderValidateState()}
        </div>

        <IonText color="medium" className="stream-supported-formats">
          {t("streamValidation.supportedFormats")}: mp4, m3u8, mpd, webm, ogv
        </IonText>

        <SelectLogo
          logo={streamLogoImage}
          logoText="manageStream.streamLogo"
          selectLogoText="manageStream.selectStreamLogo"
          onLogoSelected={handleLogoSelection}
        />

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
      </form>
      {validateStreamUrl && streamUrl && (
        <ReactPlayer
          playsinline
          url={streamUrl}
          config={{
            file: {
              forceHLS: true,
              attributes: {
                crossOrigin: "true",
              },
            },
          }}
          muted
          onReady={handlePlayerReady}
          onError={() => {
            setValidateStreamUrl(false);
            setStreamUrlIsValid(false);
          }}
          style={{ display: "none" }}
        />
      )}

      <Loader show={saving} status="manageStream.saving" />
    </IonModal>
  );
};

export default SaveStream;
