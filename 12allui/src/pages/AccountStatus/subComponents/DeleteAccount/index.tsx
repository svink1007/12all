import React, { FC } from "react";
import "./styles.scss";
import { IonButton, IonLabel } from "@ionic/react";
import { useTranslation } from "react-i18next";

// type Props = {
//   setItemAsActive: (value: string) => void;
//   activeNav: string
// }

const DeleteAccount: FC = () => {
  const { t } = useTranslation()
  // const menuItems = ["menu1", "menu2", "menu3", "menu4", "menu5", "menu6"];

  return (
    <div className="delete-account">
      <div className="delete-container">
        <IonLabel>{t('billing.accountStatus.menu6.header')}</IonLabel>

        <div className="delete-buttons">
          <IonButton className="yes-button">
            {t('billing.accountStatus.menu6.yesButton')}
          </IonButton>

          <IonButton className="no-button">
            {t('billing.accountStatus.menu6.noButton')}
          </IonButton>

        </div>
      </div>
    </div>
  )
}

export default DeleteAccount

