import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import Layout from "../../components/Layout";
import { RouteComponentProps } from "react-router";
import {
  IAPProduct,
  InAppPurchase2 as Store,
} from "@ionic-native/in-app-purchase-2";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ReduxSelectors } from "../../redux/types";
import { App, AppState } from "@capacitor/app";
import { cogOutline, refreshOutline } from "ionicons/icons";
import { PluginListenerHandle } from "@capacitor/core";

const PremiumPage: FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  const { products, ownedProduct } = useSelector(
    ({ inAppProduct }: ReduxSelectors) => inAppProduct
  );
  const { inAppProrotaionMode } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let appStateChangeListener: PluginListenerHandle;

    App.addListener("appStateChange", ({ isActive }: AppState) => {
      if (isActive) {
        Store.refresh();
      }
    }).then((value) => (appStateChangeListener = value));
    return () => {
      appStateChangeListener?.remove().then();
    };
  }, []);

  useEffect(() => {
    Store.update();
  }, [ownedProduct]);

  const purchase = (product: IAPProduct) => {
    let additionalData = null;
    if (ownedProduct) {
      additionalData = {
        prorationMode: inAppProrotaionMode,
        oldSku: ownedProduct.id,
      };
    }
    Store.order(product.id, additionalData);
  };

  const refreshSubscriptions = () => {
    setRefreshing(true);
    Store.refresh().finished(() => setRefreshing(false));
  };

  return (
    <Layout showGoBack showMenuBtn cssContent="premium-page">
      <IonToolbar>
        <IonTitle>{t("premium.premiumPackages")}</IonTitle>
      </IonToolbar>

      {products.map((product: IAPProduct) => (
        <IonItem key={product.id} detail={false}>
          <IonLabel>
            {product.title}
            <p>{product.description}</p>
          </IonLabel>
          {ownedProduct && ownedProduct.id === product.id ? (
            <IonText slot="end" color="success" className="subscribed">
              {t("premium.subscribed")}
            </IonText>
          ) : (
            <IonButton
              slot="end"
              onClick={() => purchase(product)}
              disabled={
                product.state === "approved" || product.state === "finished"
              }
            >
              {product.price}{" "}
              {(product.state === "approved" ||
                product.state === "finished") && <IonSpinner />}
            </IonButton>
          )}
        </IonItem>
      ))}

      <IonItem detail={false} className="manage-subscriptions">
        <IonLabel>{t("premium.manageSubscriptions")}</IonLabel>
        <IonButton slot="end" onClick={() => Store.manageSubscriptions()}>
          <IonIcon icon={cogOutline} slot="start" /> {t("premium.manage")}
        </IonButton>
      </IonItem>
      <IonItem detail={false}>
        <IonLabel>{t("premium.refreshSubscriptions")}</IonLabel>
        <IonButton
          slot="end"
          onClick={refreshSubscriptions}
          disabled={refreshing}
        >
          <IonIcon icon={refreshOutline} slot="start" /> {t("premium.refresh")}{" "}
          {refreshing && <IonSpinner />}
        </IonButton>
      </IonItem>
    </Layout>
  );
};

export default PremiumPage;
