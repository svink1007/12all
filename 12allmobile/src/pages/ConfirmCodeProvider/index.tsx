import React, { FC } from "react";
import {
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  IonText,
  useIonViewWillEnter,
} from "@ionic/react";
import "./styles.scss";
import Layout from "../../components/Layout";
import { RouteComponentProps } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Routes } from "../../shared/routes";
import { ReceiveCodeVia, ReduxSelectors } from "../../redux/types";
import { setProfile } from "../../redux/actions/profileActions";

const ConfirmCodeProviderPage: FC<RouteComponentProps> = ({
  history,
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  useIonViewWillEnter(() => {
    if (!profile.phoneNumber) {
      history.replace(Routes.Login);
      return;
    }
  }, [history, profile.phoneNumber]);

  const handleNext = () => {
    history.push(Routes.Code);
  };

  return (
    <Layout
      cssContent="code-provider-page"
      showGoBackCustom
      routeUrl={Routes.Login}
    >
      <IonText className="header" color="medium">
        {t("sendCode.header")}
      </IonText>
      <IonList>
        <IonListHeader>{t("login.receiveCodeVia")}</IonListHeader>
        <IonRadioGroup
          value={profile.codeProvider}
          onIonChange={(e) =>
            dispatch(setProfile({ codeProvider: e.detail.value }))
          }
        >
          <IonItem>
            <IonRadio value={ReceiveCodeVia.Sms} slot="start" />
            <IonLabel>{t("login.sms")}</IonLabel>
          </IonItem>
          <IonItem>
            <IonRadio value={ReceiveCodeVia.Call} slot="start" />
            <IonLabel>{t("login.call")}</IonLabel>
          </IonItem>
        </IonRadioGroup>
      </IonList>
      <IonButton expand="block" onClick={handleNext}>
        {t("common.next")}
      </IonButton>
    </Layout>
  );
};

export default ConfirmCodeProviderPage;
