import React from "react";
import "./styles.scss";
import { IonHeader, IonImg, IonTitle } from "@ionic/react";
import Layout from "../../../components/Layout";
import { useTranslation } from "react-i18next";
import comingSoon from "../../../images/comingSoon.png"


const Shop: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Layout className="shop-layout">
      <IonHeader>
        <IonTitle>{t('billing.shop.header')}</IonTitle>
      </IonHeader>

      <div className="coming-soon-img">
        <IonImg src={comingSoon} />
      </div>
    </Layout>
  );
};

export default Shop;
