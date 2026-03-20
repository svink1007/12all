import React from "react";
import Layout from "../../components/Layout";
import "./styles.scss";
import { IonCard, IonCardContent, IonRouterLink, IonText } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { ENV_IS_DEVELOPMENT } from "../../shared/constants";
import { appVersion } from "../../shared/variables";
import { Routes } from "../../shared/routes";
import { handleNavigation } from "../../utils/navigationUtils";

const About = () => {
  const { t } = useTranslation();

  return (
    <Layout
      showGoBackCustom
      showMenuBtn
      cssContent="about-page"
      routeUrl={Routes.Broadcasts}
    >
      <IonCard>
        <IonCardContent>
          <IonText>
            {t("about.contactUs")}:{" "}
            <IonRouterLink href="mailto:support@12all.tv">
              support@12all.tv
            </IonRouterLink>
          </IonText>
          <IonText>
            {t("about.visitUs")}{" "}
            <a onClick={() => handleNavigation("https://12all.tv")}>12all.tv</a>
          </IonText>
          <IonText>
            {t("about.version")} {appVersion}
          </IonText>

          <IonText class="text-[#e91e63]">
            <a
              onClick={() =>
                handleNavigation("https://12all.tv/privacy-policy")
              }
            >
              {t("about.privacy")}{" "}
            </a>
          </IonText>
          <IonText class="text-[#e91e63]">
            <a
              onClick={() =>
                handleNavigation("https://12all.tv/terms-and-conditions")
              }
            >
              {t("about.terms")}{" "}
            </a>
          </IonText>

          <IonText class="text-[#e91e63]">
            <a
              onClick={() => handleNavigation("https://12all.tv/child-safety")}
            >
              {t("about.childSafety")}{" "}
            </a>
          </IonText>

          {ENV_IS_DEVELOPMENT && <IonText>Development</IonText>}
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};

export default About;
