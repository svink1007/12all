import { useEffect } from "react";
import {
  APPSFLYER_ANDROID_KEY,
  APPSFLYER_IOS_KEY,
  IOS_APP_ID,
} from "../shared/constants";
import { AFInit, AppsFlyer } from "appsflyer-capacitor-plugin";
import { isPlatform } from "@ionic/react";

const useAppsflyer = () => {
  useEffect(() => {
    const afConfig: AFInit = {
      appID: IOS_APP_ID,
      devKey: isPlatform("android") ? APPSFLYER_ANDROID_KEY : APPSFLYER_IOS_KEY,
      isDebug: false,
      waitForATTUserAuthorization: 10, // for iOS 14 and higher
      registerOnDeepLink: false,
      registerConversionListener: false,
      registerOnAppOpenAttribution: false,
      useReceiptValidationSandbox: false, // iOS only
      useUninstallSandbox: false, // iOS only
    };

    AppsFlyer.initSDK(afConfig)
      // .then(() => console.log('Appsflyer init ok'))
      .catch((err) => console.error("Appsflyer error: " + JSON.stringify(err)));
  }, []);
};

export default useAppsflyer;
