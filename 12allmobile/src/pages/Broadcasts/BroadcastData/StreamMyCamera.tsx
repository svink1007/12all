import React, { FC } from "react";
import { IonIcon, IonItem, IonText } from "@ionic/react";
import { Routes } from "../../../shared/routes";
import { videocam } from "ionicons/icons";
import { useTranslation } from "react-i18next";

const StreamMyCamera: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="channel-wrapper">
      <IonItem
        button
        lines="none"
        className="my-camera-item"
        routerLink={Routes.ProtectedStreamCamera}
        color="light"
        detail={false}
      >
        <div className="item-inner">
          <IonIcon icon={videocam} />
          <IonText>{t("sharedStream.myCamera")}</IonText>
        </div>
      </IonItem>
    </div>
  );
};

export default StreamMyCamera;
