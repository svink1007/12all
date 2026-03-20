import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/react";
import Layout from "../../components/Layout";

const Terms: FC = () => {
  const { t } = useTranslation();

  return (
    <Layout className="center md">
      <IonCard className="how-to-delete-your-data-page">
        <IonCardHeader>
          <IonCardTitle>{t("howToDeleteYourData.header")}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent className="how-to-delete-your-data-content">
          <h3>
            If you wish to delete all your data from 12all.tv database, please
            follow these steps:
          </h3>
          <ol>
            <li>Log into your profile</li>
            <li>
              Navigate to <a href="/my-profile">your settings page</a>
            </li>
            <li>
              Enter the confirmation text and click on the <b>DELETE MY DATA</b>{" "}
              button
            </li>
          </ol>
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};

export default Terms;
