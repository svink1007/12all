import React from "react";
import { IonContent, IonImg, IonPage } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";

import Close from "../../images/avatar/close.svg";

const Avatar = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const onClose = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent>
        <div className="avatar-page-container">
          <div className="header">
            <IonImg src={Close} className="close-btn" onClick={onClose} />
            <p>{t("avatar.avatar")}</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Avatar;
