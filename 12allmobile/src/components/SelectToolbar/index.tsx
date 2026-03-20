import React, { FC } from "react";
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { checkmarkCircleOutline, closeCircleOutline } from "ionicons/icons";

type Props = {
  titleText: string;
  onOk?: () => void;
  onDismiss: () => void;
};

const SelectToolbar: FC<Props> = ({ titleText, onOk, onDismiss }: Props) => {
  const { t } = useTranslation();

  return (
    <IonToolbar>
      {onOk && (
        <IonButtons slot="start">
          <IonButton onClick={onOk} color="dark">
            <IonIcon icon={checkmarkCircleOutline} slot="icon-only" />
          </IonButton>
        </IonButtons>
      )}
      <IonTitle className={`${onOk ? "ion-text-center" : ""}`}>
        {t(titleText)}
      </IonTitle>
      <IonButtons slot="end">
        <IonButton onClick={onDismiss} color="dark">
          <IonIcon icon={closeCircleOutline} slot="icon-only" />
        </IonButton>
      </IonButtons>
    </IonToolbar>
  );
};

export default SelectToolbar;
