import { IonContent, IonItem, IonLabel, IonMenu } from "@ionic/react";
import { Routes } from "../shared/routes";
import React, { useRef } from "react";
import { resetProfile } from "../redux/actions/profileActions";
import appStorage, { StorageKey } from "../shared/appStorage";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../redux/types";
import setPrevRoute from "../redux/actions/routeActions";
import { useHistory } from "react-router-dom";

export const MAIN_CONTENT_ID = "12all-main-content";

const AppMenu = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const menuRef = useRef<HTMLIonMenuElement>(null);
  const { isAuthenticated } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );

  const handleLogout = () => {
    dispatch(resetProfile());
    appStorage.removeItem(StorageKey.Login).then();
  };

  const handleLogin = () => {
    dispatch(setPrevRoute(""));
    history.push(Routes.Login);
  };

  const closeMenu = () => {
    menuRef.current?.close();
  };

  return (
    <IonMenu
      side="end"
      menuId="12all-menu"
      contentId={MAIN_CONTENT_ID}
      swipeGesture={false}
      ref={menuRef}
      onClick={closeMenu}
    >
      <IonContent className="menu-content">
        <IonItem routerLink={isAuthenticated ? Routes.Premium : Routes.Login}>
          <IonLabel>{t("layout.premium")}</IonLabel>
        </IonItem>
        <IonItem routerLink={Routes.WatchPartyJoin}>
          <IonLabel>{t("layout.joinLivingRoom")}</IonLabel>
        </IonItem>
        {isAuthenticated && (
          <>
            <IonItem routerLink={Routes.Profile}>
              <IonLabel>{t("layout.profile")}</IonLabel>
            </IonItem>
            <IonItem routerLink={Routes.ShowContacts}>
              <IonLabel>{t("layout.contacts")}</IonLabel>
            </IonItem>
          </>
        )}
        <IonItem routerLink={Routes.Terms}>
          <IonLabel>{t("layout.terms")}</IonLabel>
        </IonItem>
        <IonItem routerLink={Routes.Privacy}>
          <IonLabel>{t("layout.privacy")}</IonLabel>
        </IonItem>
        <IonItem routerLink={Routes.About}>
          <IonLabel>{t("layout.about")}</IonLabel>
        </IonItem>
        {isAuthenticated ? (
          <IonItem button onClick={handleLogout}>
            <IonLabel>{t("layout.logout")}</IonLabel>
          </IonItem>
        ) : (
          <IonItem button onClick={handleLogin}>
            <IonLabel>{t("layout.login")}</IonLabel>
          </IonItem>
        )}
      </IonContent>
    </IonMenu>
  );
};

export default AppMenu;
