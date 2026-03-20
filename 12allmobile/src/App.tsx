import React, { FC, useEffect, useState } from "react";
import { IonApp, isPlatform, setupIonicReact } from "@ionic/react";
import "./app.scss";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

/* Redux */
import { useDispatch, useSelector } from "react-redux";
import { resetProfile, setProfile } from "./redux/actions/profileActions";

import appStorage, { StorageKey } from "./shared/appStorage";
import {
  API_URL,
  DEBUG_MODE,
  DEBUG_PHONE_NUMBER,
  DEBUG_TOKEN,
  MOBILE_VIEW,
} from "./shared/constants";
import AppToast from "./components/AppToast";
import setAppConfig from "./redux/actions/appConfigActions";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar } from "@capacitor/status-bar";
import Router from "./components/Router";
import { StreamService, UserManagementService } from "./services";
import AppService from "./services/AppService";
import BaseService from "./services/BaseService";
import { Ad } from "capacitor-ad-plugin";
import { ReduxSelectors } from "./redux/types";
import { Device, DeviceId } from "@capacitor/device";
import useAppsflyer from "./hooks/useAppsflyer";
import { setDeviceInfo } from "./redux/actions/deviceInfoActions";
import { setNetworkConfig } from "./redux/actions/networkConfigActions";
import NetworkService from "./services/NetworkService";
import DeviceService from "./services/DeviceService";
import useInAppPurchase from "./hooks/useInAppPurchase";
import { StorageData } from "./shared/types";
import useInitAdmob from "./admob/useInitAdmob";
import VertoVariables from "./verto/VertoVariables";
// import {NavigationBar} from '@hugotomazi/capacitor-navigation-bar';

setupIonicReact();

// const APP_LNG = 'appLng';

const App: FC = () => {
  const dispatch = useDispatch();
  const { countryOfResidence } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [storageData, setStorageData] = useState<StorageData | null>(null);

  // const changeLanguage = (lng: ILanguage) => {
  //   i18n.changeLanguage(lng.key).then();
  //   setLanguage(lng);
  // };

  useEffect(() => {
    if (isPlatform("ios")) {
      SplashScreen.show({ showDuration: 2000 }).then();
    }

    StatusBar.setBackgroundColor({ color: "#000000" }).then();
  }, []);

  useEffect(() => {
    const executeSync = async () => {
      let appStorageData: StorageData | null = null;

      if (DEBUG_MODE && DEBUG_PHONE_NUMBER && DEBUG_TOKEN) {
        appStorageData = {
          phoneNumber: DEBUG_PHONE_NUMBER,
          token: DEBUG_TOKEN,
        };
      } else {
        appStorageData = await appStorage.getObject(StorageKey.Login);
      }

      if (appStorageData) {
        BaseService.setAuth(appStorageData);
        if (MOBILE_VIEW) {
          const updateAdvertisingId = (id: string) =>
            UserManagementService.updateAdvertisingId(id);

          if (isPlatform("android")) {
            Ad.getAdId().then(({ id }) => updateAdvertisingId(id));
          } else if (isPlatform("ios")) {
            Device.getId().then(({ identifier }: DeviceId) =>
              updateAdvertisingId(identifier)
            );
          }
        }
        UserManagementService.getUserData()
          .then(({ data }) => {
            if (data.status === "ok") {
              const {
                result: {
                  avatar,
                  nickname,
                  country_of_residence,
                  preferred_language,
                  gender,
                  preferred_genre,
                  premium_status,
                  has_confirmed_is_over_eighteen,
                  show_debug_info,
                  has_confirmed_phone_number,
                  id,
                  username,
                  email,
                },
              } = data;

              // Check if this is a skip login user (anonymous user)
              const isAnonymous = !email
                ? false
                : email.includes("@skiplogin.com")
                  ? true
                  : false;

              // For skip login users, don't automatically authenticate them on app startup
              // They need to explicitly click "Skip Login" to be authenticated
              if (isAnonymous) {
                // Clear the stored authentication data for skip login users
                // But keep the skip login token and nickname in storage
                appStorage.removeItem(StorageKey.Login).then();
                BaseService.clearAuth();
                dispatch(resetProfile());
                setLoading(false);
                return;
              }

              // if (!has_confirmed_phone_number) {
              //   appStorage.removeItem(StorageKey.Login).then();
              //   BaseService.clearAuth();
              //   dispatch(resetProfile());
              //   return;
              // }

              setStorageData(appStorageData);

              dispatch(
                setProfile({
                  ...appStorageData,
                  id,
                  avatar: avatar,
                  nickname: nickname || username,
                  countryOfResidence: country_of_residence,
                  preferredLanguage: preferred_language,
                  gender,
                  preferredGenre: preferred_genre,
                  premium: premium_status,
                  isOverEighteen: has_confirmed_is_over_eighteen,
                  showDebugInfo: show_debug_info || false,
                  isAnonymous: isAnonymous,
                })
              );
            }
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }

      const deviceInfo = await Device.getInfo();
      dispatch(setDeviceInfo(deviceInfo));

      if (appStorageData) {
        DeviceService.sendDeviceInfo({
          model: deviceInfo.model,
          os: deviceInfo.operatingSystem,
          osVersion: deviceInfo.osVersion,
          webViewVersion: deviceInfo.webViewVersion,
        }).then();
      }
    };

    executeSync().catch((err) =>
      console.error("12ALL_LOG - executeSync ERROR", err)
    );

    AppService.getAppConfig().then(({ data }) => {
      dispatch(setAppConfig(data));
      VertoVariables.sdpVideoCodecRegex = data.sdpVideoCodecRegex;
    });
    NetworkService.getNetworkConfig().then(({ data }) =>
      dispatch(setNetworkConfig(data))
    );
  }, [dispatch]);

  useEffect(() => {
    StreamService.countryOfResidence = countryOfResidence;
  }, [countryOfResidence]);

  useAppsflyer();
  // useInAppPurchase(storageData);
  useInitAdmob();

  return loading ? null : (
    <IonApp>
      <Router />
      <AppToast />
    </IonApp>
  );
};

export default App;
