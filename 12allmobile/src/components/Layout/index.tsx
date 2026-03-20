import React, { FC } from "react";
import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuToggle,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import "./styles.scss";
import { Routes } from "../../shared/routes";
import { chevronBack } from "ionicons/icons";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/types";
import defaultAvatar from "../../images/default-avatar.png";
import { MAIN_CONTENT_ID } from "../AppMenu";
import { LAYOUT_ID } from "../../shared/constants";
import SafeAreaView from "../SafeAreaView";
import LogoHeader from "../LogoHeader";

type Props = {
  cssContent?: string;
  routeUrl?: string;
  showMenuBtn?: boolean;
  showGoBackCustom?: boolean;
  showGoBack?: boolean;
  goBackDefaultHref?: string;
  hideHeader?: boolean;
  children: React.ReactNode;
};

const Layout: FC<Props> = ({
  cssContent,
  children,
  routeUrl,
  showMenuBtn,
  showGoBackCustom,
  showGoBack,
  goBackDefaultHref,
  hideHeader,
}: Props) => {
  const { avatar } = useSelector(({ profile }: ReduxSelectors) => profile);

  return (
    <>
      <IonPage id={LAYOUT_ID} className="layout-page">
        <IonHeader className={`${hideHeader ? "ion-hide" : ""}`}>
          <IonToolbar className="layout-page-toolbar">
            <IonButtons slot="start" className="layout-buttons-start">
              {showGoBackCustom && (
                <IonButton routerLink={routeUrl || Routes.Home} color="dark">
                  <IonIcon icon={chevronBack} slot="icon-only" />
                </IonButton>
              )}
              {showGoBack && (
                <IonBackButton
                  icon={chevronBack}
                  text={""}
                  color="dark"
                  defaultHref={goBackDefaultHref || Routes.Home}
                  className="layout-back-btn"
                />
              )}
            </IonButtons>

            <LogoHeader />

            <IonButtons slot="end" className="layout-buttons-end">
              {showMenuBtn && (
                <IonMenuToggle>
                  <IonAvatar className="user-avatar">
                    <img src={avatar || defaultAvatar} alt="" />
                  </IonAvatar>
                </IonMenuToggle>
              )}
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent
          className={
            cssContent ? `layout-content ${cssContent}` : "layout-content"
          }
          id={MAIN_CONTENT_ID}
        >
          <SafeAreaView>{children}</SafeAreaView>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Layout;
