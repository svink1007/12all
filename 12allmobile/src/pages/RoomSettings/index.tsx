import React, { useEffect } from "react";
import {
  IonContent,
  IonIcon,
  IonImg,
  IonPage,
  IonRange,
  IonToggle,
} from "@ionic/react";
import {
  Redirect,
  RouteComponentProps,
  useHistory,
  useLocation,
} from "react-router";
import { useTranslation } from "react-i18next";

import "./styles.scss";

import Close from "../../images/settings/close.svg";
import Public from "../../images/settings/public.svg";
import Mute from "../../images/settings/mute.svg";
import Back from "../../images/settings/back.svg";
import VolumeUp from "../../images/settings/volume_up.svg";
import VolumeDown from "../../images/settings/volume_down.svg";
import { RangeValue } from "@ionic/core";
import { Routes } from "../../shared/routes";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/types";
import SafeAreaView from "../../components/SafeAreaView";
import setPrevRoute from "../../redux/actions/routeActions";
import { useDispatch } from "react-redux";

interface ISettings {
  privacy: string;
  voice: boolean;
  sound: RangeValue;
  autoTranslateChat: boolean;
  pictureInPicture: boolean;
  blurNonFriendMedia: boolean;
}

const Settings: React.FC<RouteComponentProps> = ({ history, location }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const VolumeStep = 10;
  const { isAuthenticated } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );

  const [settingState, setSettingState] = React.useState<ISettings>({
    privacy: "public",
    voice: false,
    sound: 0,
    autoTranslateChat: false,
    pictureInPicture: false,
    blurNonFriendMedia: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(setPrevRoute(location.pathname));
      history.push(Routes.Login, { prevPath: location.pathname });
    }
  }, []);

  const handleVolumeUpClick = () => {
    if ((settingState.sound as number) + VolumeStep >= 100) {
      setSettingState({ ...settingState, sound: 100 });
    } else {
      setSettingState({
        ...settingState,
        sound: (settingState.sound as number) + VolumeStep,
      });
    }
  };

  const handleVolumeDownClick = () => {
    if ((settingState.sound as number) - VolumeStep <= 0) {
      setSettingState({ ...settingState, sound: 0 });
    } else {
      setSettingState({
        ...settingState,
        sound: (settingState.sound as number) - VolumeStep,
      });
    }
  };

  const onCloseClick = () => {
    history.push(Routes.Broadcasts);
  };

  const onPreviousClick = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent>
        <SafeAreaView>
          <div className="setting-container">
            <div className="setting-header">
              <IonImg
                src={Close}
                className="setting-close"
                onClick={onCloseClick}
              />
              <div className="setting-header-title">
                <p>{t("settings.settings")}</p>
                <p className="setting-header-meeting-link"></p>
              </div>
            </div>
            <div className="setting-body">
              <div className="setting-body-privacy">
                <div className="privacy-description">
                  <p className="title">{t("settings.privacy")}</p>
                  <p className="sub-title">{t("settings.anyOneCanJoin")}</p>
                </div>
                <div className="privacy-button-container">
                  <IonImg src={Public} className="privacy-image" />
                  <p className="sub-title">{t("settings.public")}</p>
                </div>
              </div>

              <div className="setting-body-voice">
                <div className="privacy-description">
                  <p className="title">{t("settings.voice")}</p>
                  <p className="sub-title">
                    {t("settings.microphoneDisabled")}
                  </p>
                </div>
                <div className="privacy-button-container">
                  <IonImg src={Mute} className="privacy-image" />
                  <p className="sub-title">{t("settings.off")}</p>
                </div>
              </div>

              <div className="setting-body-volume">
                <p className="title">{t("settings.soundVolume")}</p>
                <div className="content">
                  <IonRange
                    pin={true}
                    pinFormatter={(value: number) => `${value}%`}
                    onIonChange={({ detail }) =>
                      setSettingState((prev: ISettings) => {
                        return {
                          ...prev,
                          sound: detail.value,
                        };
                      })
                    }
                    value={settingState.sound as number}
                    className="volume-control"
                  >
                    <IonIcon
                      slot="start"
                      icon={VolumeDown}
                      onClick={handleVolumeDownClick}
                    ></IonIcon>
                    <IonIcon
                      slot="end"
                      icon={VolumeUp}
                      onClick={handleVolumeUpClick}
                    ></IonIcon>
                  </IonRange>
                </div>
              </div>

              <div className="setting-body-options">
                <div className="option">
                  <p className="sub-title">{t("settings.autoTranslateChat")}</p>
                  <IonToggle />
                </div>

                <div className="option">
                  <p className="sub-title">{t("settings.pictureOnPicture")}</p>
                  <IonToggle />
                </div>

                <div className="option">
                  <p className="sub-title">
                    {t("settings.blurNonFriendMedia")}
                  </p>
                  <IonToggle />
                </div>
              </div>
            </div>
            <div className="setting-footer">
              <div className="container" onClick={onPreviousClick}>
                <IonImg src={Back} className="icon" />
              </div>
            </div>
          </div>
        </SafeAreaView>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
