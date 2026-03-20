import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonFooter,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import TermsContent from "../../../components/TermsContent";

interface TermsProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const TermsModal: FC<TermsProps> = ({ isOpen, onDismiss }: TermsProps) => {
  const { t } = useTranslation();

  return (
    <IonModal isOpen={isOpen} backdropDismiss={false} className="terms-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("terms.header")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <TermsContent />
        </IonCard>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>{t("terms.close")}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default TermsModal;
