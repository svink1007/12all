import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { IonCard, IonCardHeader, IonCardTitle } from "@ionic/react";
import Layout from "../../components/Layout";
import TermsContent from "../../components/TermsContent";

const TermsPage: FC = () => {
  const { t } = useTranslation();

  return (
    <Layout showGoBackCustom showMenuBtn>
      <IonCard className="terms-page">
        <IonCardHeader>
          <IonCardTitle>{t("terms.header")}</IonCardTitle>
        </IonCardHeader>
        <TermsContent />
      </IonCard>
    </Layout>
  );
};

export default TermsPage;
