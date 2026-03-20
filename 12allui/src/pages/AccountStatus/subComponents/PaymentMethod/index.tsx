import React, { FC, useState } from "react";
import "./styles.scss";
import { IonButton, IonImg, IonLabel, IonRadio, IonToggle } from "@ionic/react";
import { useTranslation } from "react-i18next";
import InputWithLabel from "../../../../components/InputComponent/PlainInput";
import masterCard from "../../../../images/icons/mastercard.svg";
import shieldCheck from "../../../../images/icons/shield-check.svg";
import revolut from "../../../../images/icons/revolut.svg";
import payPal from "../../../../images/icons/paypal.svg";

// type Props = {
//   setItemAsActive: (value: string) => void;
//   activeNav: string
// }

const PaymentMethod: FC = () => {
  const { t } = useTranslation()
  // const menuItems = ["menu1", "menu2", "menu3", "menu4", "menu5", "menu6"];
  const [name, setName] = useState<string>("")
  const [cardNumber, setCardNumber] = useState<string>("")
  const [cardSecurityCode, setCardSecurityCode] = useState<string>("")
  const [expirationDate, setExpirationDate] = useState<string>("")

  return (
    <div className="payment-method-status">
      <div className="radio-button-box">
        <IonRadio slot="end" value="label" />
        <div className="radio-labels">
          <div className="first-row">
            <IonLabel>{t('billing.accountStatus.menu2.revolut')}</IonLabel>
            <IonImg src={revolut} />
          </div>
          <IonLabel className="second-row">{t('billing.accountStatus.menu2.revolutDescription')}</IonLabel>
        </div>
      </div>

      <div className="radio-button-box">
        <IonRadio slot="end" value="label" />
        <div className="radio-labels">
          <div className="first-row">
            <IonLabel>{t('billing.accountStatus.menu2.paypal')}</IonLabel>
            <IonImg src={payPal} />
          </div>
          <IonLabel className="second-row">{t('billing.accountStatus.menu2.paypalDescription')}</IonLabel>
        </div>
      </div>


      <div className="pay-with-card-box">
        <IonRadio slot="end" value="label" />
        <div className="radio-labels">
          <div className="first-row">
            <IonLabel>{t('billing.accountStatus.menu2.payWithCard')}</IonLabel>
            <IonImg src={masterCard} />
          </div>

          <div className="input-row-1">
            <InputWithLabel
              label={t('billing.accountStatus.menu2.name')}
              type="text"
              name={name}
              value={name}
              setValue={setName}
            />

            <InputWithLabel
              label={t('billing.accountStatus.menu2.cardNumber')}
              type="text"
              name={cardNumber}
              value={cardNumber}
              setValue={setCardNumber}
            />
          </div>

          <div className="input-row-2">
            <InputWithLabel
              label={t('billing.accountStatus.menu2.cardSecurityCode')}
              type="password"
              name={cardSecurityCode}
              value={cardSecurityCode}
              setValue={setCardSecurityCode}
            />

            <InputWithLabel
              label={t('billing.accountStatus.menu2.expirationDate')}
              type="date"
              name={expirationDate}
              value={expirationDate}
              setValue={setExpirationDate}
            />
          </div>
        </div>
      </div>

      <div className="shield">
        <IonImg src={shieldCheck} />
        <IonLabel>{t('billing.accountStatus.menu2.shieldDescription')}</IonLabel>

      </div>

      <div className="save-card-switch">
        <IonToggle />
        <IonLabel>{t('billing.accountStatus.menu2.defaultSwitch')}</IonLabel>
      </div>

      <div className="save-button">
        <IonButton>
          {t('billing.accountStatus.menu2.save')}
        </IonButton>
      </div>

    </div>
  )
}

export default PaymentMethod

