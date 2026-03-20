import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { IonCard, IonCardHeader, IonCardTitle } from "@ionic/react";
import Layout from "../../components/Layout";
import PrivacyPolicyContent from "../../components/PrivacyPolicyContent";
import { RouteComponentProps } from "react-router";

const PrivacyPolicyPage: FC<RouteComponentProps> = () => {
  const { t } = useTranslation();

  return (
    <Layout showGoBackCustom showMenuBtn>
      <IonCard className="privacy-policy">
        <IonCardHeader>
          <IonCardTitle>{t("privacy.header")}</IonCardTitle>
        </IonCardHeader>
        <PrivacyPolicyContent />
      </IonCard>
    </Layout>
  );
};

export default PrivacyPolicyPage;
