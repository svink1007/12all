import React from "react";
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
import PrivacyPolicyContent from "../../../components/PrivacyPolicyContent";

interface PrivacyProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyProps> = ({
  isOpen,
  onDismiss,
}: PrivacyProps) => {
  const { t } = useTranslation();

  return (
    <IonModal
      isOpen={isOpen}
      backdropDismiss={false}
      className="privacy-policy-modal"
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("privacy.header")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="privacy-policy-content">
        <IonCard>
          <PrivacyPolicyContent />
        </IonCard>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>{t("privacy.close")}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default PrivacyPolicyModal;
