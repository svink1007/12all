import React, { useEffect, useState } from "react";
import { IonButton, IonImg, IonLabel, IonRadio, IonRadioGroup, IonTitle } from "@ionic/react";
import { useTranslation } from "react-i18next";
import starIconWhite from "../../../images/icons/star-sharp-hollow-white.svg"
import crossButton from "../../../images/icons/cross.svg"
import "./styles.scss";
import { PaymentConfig, SubscriptionTypes } from "../../../shared/types";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import { BillingServices } from "../../../services";
import { callPaymentMethod } from "../../../shared/helpers";
import { getHostUrl } from "../../../shared/constants";

type PremiumPackagesProp = {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  payCardIcon: string,
  payCardHeader: string,
  payCardDescription: string,
  currency: string,
  subscriptionName: string,
  starValue: number,
  currencyValue: number,
  selectedStarAmount: SubscriptionTypes[],
  autoRenewal?: boolean,
}

const PremiumPackagesModal: React.FC<PremiumPackagesProp> = ({ openModal, setOpenModal, payCardIcon, payCardHeader, payCardDescription, currency, subscriptionName, starValue, currencyValue, autoRenewal, selectedStarAmount }) => {
  const { t } = useTranslation()
  const { id, jwt, email } = useSelector(({ profile }: ReduxSelectors) => profile);
  const { subscriptionTypes } = useSelector(({ billingRewards }: ReduxSelectors) => billingRewards)
  const [selectedType, setSelectedType] = useState<string>("")
  const [conversionRate, setConversionRate] = useState<string>("")

  console.log("selectedStarAmount modal", selectedStarAmount, id)

  const handlePaymentEuro = () => {

    let config: PaymentConfig;
    if(starValue) {
      config = {
        externalClientId: id,
        currency: 'EUR',
        items: [
          {
            itemId: 1,
            quantity: starValue,
            type: 'TOP_UP'
          },
        ],
        userEmail: email,
        fullPrice: Number(currencyValue.toFixed(6)),
        authToken: jwt,
        withPromoCodes: false,
        redirectOptions: {
          text: "redirect text",
          successUrl: getHostUrl(),
          backUrl: `${getHostUrl()}/top-up`
        }
      };

      const payment = callPaymentMethod(config)

      console.log("payment", payment)
    }
  }

  const handlePaymentStar = () => {
    BillingServices.subscribeStars(selectedStarAmount[0].id, id.toString()).then(({ data: { result, status } }) => {
      console.log("billing subs stars", result)
    })
  }

  const handlePay = (type: string) => {
    switch (type) {
      case "STAR":
        handlePaymentStar()
        return;
      case "EURO":
        handlePaymentEuro()
        return;
      default: return
    }
  }

  useEffect(() => {
    BillingServices.getConversionRateTopUp(0).then(({ data: { result } }) => {
      if (result) {
        setConversionRate(result.conversionRate.toString())
      }
    })
  }, [])

  return (
    <div
      // isOpen={openModal}
      // onDidDismiss={() => setOpenModal(false)}
      className="premium-package-modal"
    >

      <div className="cross-button" onClick={() => setOpenModal(false)}>
        <IonImg src={crossButton} />
      </div>

      <div className="premium-viewer-pay-header">
        <IonLabel>
          {t('billing.premiumViewer.yourChoice')}
        </IonLabel>
        <IonImg src={payCardIcon} className="sharp-star" />
        <IonTitle>{payCardHeader}</IonTitle>

        <IonLabel className="description">
          {payCardDescription}
        </IonLabel>

        <IonLabel className="tenure">
          {subscriptionName}
        </IonLabel>

        {autoRenewal && <IonLabel className="tenure">
          {t('billing.premiumHost.autoRenewal')}
        </IonLabel>}
      </div>

      <div className="subscription-details">
        <IonRadioGroup
          value={selectedType}
          onIonChange={(e) => setSelectedType(e.detail.value)}>
          <div className="radio-button">
            <IonRadio slot="end" value="STAR" />
            <IonImg src={starIconWhite} />
            {/* <IonLabel>{t('billing.premiumViewer.mothlySubscription')}</IonLabel> */}
          </div>
          <div className="radio-button">
            <IonRadio slot="end" value="EURO" />
            <IonLabel>{currency}</IonLabel>
          </div>
        </IonRadioGroup>

        <div className="star-amount-details">
          <div className="star-amount-label">
            <IonLabel>{starValue}</IonLabel>
          </div>

          <div className="star-amount-label">
            <IonLabel>{currencyValue}</IonLabel>
          </div>
        </div>


      </div>
      <IonLabel className="total-amount">{`${1} ${t('billing.premiumViewer.star')} = ${conversionRate} ${t('billing.premiumViewer.eur')}`}</IonLabel>
      <hr className="horizontal-row" />

      <IonButton 
        className="pay-button"
        onClick={() => handlePay(selectedType)}
        disabled={subscriptionTypes.length === 0}
      >
        {t('billing.premiumViewer.button')}
      </IonButton>

    </div>

  );
};

export default PremiumPackagesModal;
