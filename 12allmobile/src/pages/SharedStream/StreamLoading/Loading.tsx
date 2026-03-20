import React, { FC } from "react";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { useTranslation } from "react-i18next";

interface Props {
  show: boolean;
  showLeave: boolean;
  onLeave: () => void;
}

const Loading: FC<Props> = ({ show, showLeave, onLeave }: Props) => {
  const { t } = useTranslation();

  return (
    <IonCard className={`loading-card ${!show ? "ion-hide" : ""}`}>
      <IonCardContent>
        <IonSpinner />
        <IonText>{t("sharedStream.loading")}</IonText>
        <IonButtons className={`${!showLeave ? "ion-hide" : ""}`}>
          <IonButton onClick={onLeave} color="primary" expand="full">
            {t("sharedStream.leave")}
          </IonButton>
        </IonButtons>
      </IonCardContent>
    </IonCard>
  );
};

export default Loading;
