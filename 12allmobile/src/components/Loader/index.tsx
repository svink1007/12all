import React, { FC } from "react";
import "./styles.scss";
import {
  IonCard,
  IonCardContent,
  IonModal,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { useTranslation } from "react-i18next";

interface LoaderProps {
  show: boolean;
  status?: string;
}

const Loader: FC<LoaderProps> = ({ show, status }: LoaderProps) => {
  const { t } = useTranslation();
  return (
    <IonModal
      isOpen={show}
      className="loader-component"
      backdropDismiss={false}
    >
      <div className="loader-inner-wrapper">
        <IonCard>
          <IonCardContent>
            <IonSpinner />
            {status && <IonText>{t(status)}</IonText>}
          </IonCardContent>
        </IonCard>
      </div>
    </IonModal>
  );
};

export default Loader;
