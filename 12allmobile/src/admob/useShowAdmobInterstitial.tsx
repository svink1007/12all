import { useEffect, useRef } from "react";
import {
  AdMob,
  AdMobError,
  AdOptions,
  InterstitialAdPluginEvents,
} from "@capacitor-community/admob";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../redux/types";
import { PluginListenerHandle } from "@capacitor/core";
import { InAppPurchase2 as Store } from "@ionic-native/in-app-purchase-2";
import { isPlatform } from "@ionic/react";

type Props = {
  onShow?: () => void;
  onClose?: () => void;
};

const useShowAdmobInterstitial = ({ onShow, onClose }: Props = {}) => {
  const { premium } = useSelector(({ profile }: ReduxSelectors) => profile);
  const { ownedProduct } = useSelector(
    ({ inAppProduct }: ReduxSelectors) => inAppProduct
  );
  const { adPublisherIdAndroid, adPublisherIdIOS, adInterval } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );
  const platformAdId = useRef<string>(
    isPlatform("android") ? adPublisherIdAndroid : adPublisherIdIOS
  );

  useEffect(() => {
    Store.refresh();
  }, []);

  useEffect(() => {
    let listeners: PluginListenerHandle[] = [];
    let adTimeout: NodeJS.Timeout;

    if (!ownedProduct && !premium) {
      const prepareNextAd = () => {
        adTimeout = setTimeout(async () => {
          const options: AdOptions = {
            adId: platformAdId.current,
            // adId: 'ca-app-pub-3940256099942544/1033173712',  // Interstitial
            // adId: 'ca-app-pub-3940256099942544/8691691433',  // Interstitial video
            // isTesting: true
          };
          await AdMob.prepareInterstitial(options);
          await AdMob.showInterstitial();
          onShow && onShow();
          // }, 20000);
        }, adInterval * 1000);

        onClose && onClose();
      };

      prepareNextAd();

      const failedToLoad = AdMob.addListener(
        InterstitialAdPluginEvents.FailedToLoad,
        (info: AdMobError) => {
          prepareNextAd();
          console.error("Interstitial failed to load", JSON.stringify(info));
        }
      );

      const failedToShow = AdMob.addListener(
        InterstitialAdPluginEvents.FailedToShow,
        (info: AdMobError) => {
          prepareNextAd();
          console.error("Interstitial failed to show", JSON.stringify(info));
        }
      );

      const dismissed = AdMob.addListener(
        InterstitialAdPluginEvents.Dismissed,
        () => prepareNextAd()
      );

      listeners = [failedToLoad, failedToShow, dismissed];
    }

    return () => {
      adTimeout && clearTimeout(adTimeout);
      listeners.forEach((l) => l.remove());
    };
  }, [premium, adInterval, onShow, onClose, ownedProduct]);
};

export default useShowAdmobInterstitial;
