import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "../../../components/Layout";
import { IonButton, IonCheckbox, IonHeader, IonImg, IonLabel, IonRadio, IonRadioGroup, IonTitle } from "@ionic/react";
import starIcon from "../../../images/icons/star-sharp.svg"
import starIconLightRed from "../../../images/icons/star-sharp-light-red.svg"
import medalIcon from "../../../images/icons/medal.svg"
import PremiumPackagesModal from "../premiumPackagesModal";
import CurrentBalanceBox from "../../../components/CurrentBalance";
import { ReduxSelectors } from "../../../redux/shared/types";
import { useDispatch, useSelector } from "react-redux";
import { BillingServices } from "../../../services";
import { setSubscriptionTypes } from "../../../redux/actions/billingRewardActions";
import { SubscriptionTypes } from "../../../shared/types";
import "./styles.scss"
import { setErrorToast } from "../../../redux/actions/toastActions";

const PremiumHosts: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { subscriptionTypes } = useSelector(({ billingRewards }: ReduxSelectors) => billingRewards)
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStarAmount, setSelectedStarAmount] = useState<SubscriptionTypes[]>([])
  const [isAutoRenewal, setIsAutoRenewal] = useState<boolean>(false)

  const radioOptions = [
    { value: 'MONTHLY', label: t('billing.premiumViewer.mothlySubscription') },
    { value: 'YEARLY', label: t('billing.premiumViewer.yearlySubscription') },
  ];

  console.log("subscriptionTypes hosts", subscriptionTypes)

  const getMonthlyAndYearlyPremiumViewer = useCallback((type: string, period: string) => {
    let filteredType
    if (type === "PREMIUM_VLR") {
      switch (period) {
        case "MONTHLY":
          filteredType = subscriptionTypes?.filter((item) => item.type === type && item.period === period)
          return filteredType
        case "YEARLY":
          filteredType = subscriptionTypes?.filter((item) => item.type === type && item.period === period)
          return filteredType
        default: return [];
      }
    }
    return []
  }, [subscriptionTypes])

  const handleRadioButton = (selectedType: string) => {
    let filteredType
    setSelectedType(selectedType)
    console.log("seletedType", selectedType)

    filteredType = subscriptionTypes?.filter((item) => item.type !== "PREMIUM_VLR")

    switch (selectedType) {
      case "MONTHLY":
        filteredType = subscriptionTypes?.filter((item) => item.type === "AD_FREE" && item.period === selectedType)
        setSelectedStarAmount(filteredType)
        return;
      // return filteredType
      case "YEARLY":
        filteredType = subscriptionTypes?.filter((item) => item.type === "AD_FREE" && item.period === selectedType)
        setSelectedStarAmount(filteredType)
        return;
      default: return [];
    }
  }

  const handlePayButton = () => {
    if(subscriptionTypes === undefined || subscriptionTypes.length === 0) {
      dispatch(setErrorToast("Something went wrong. Please try after sometime."))
      return;
    }
    setOpenModal(true)
  }

  useEffect(() => {
    if (subscriptionTypes?.length === 0) {
      BillingServices.getSubscriptionType().then(({ data: { result, status } }) => {
        console.log("response subs type", result, status)
        dispatch(setSubscriptionTypes(result))
      })
    }
  }, [subscriptionTypes, dispatch])

  return (
    <Layout className="premium-host-layout">
      <IonHeader style={{ opacity: !openModal ? "1" : "0.2" }}>
        <IonTitle>{t('billing.premium.header')}</IonTitle>
      </IonHeader>
      <IonHeader style={{ display: !openModal ? "none" : "", position: "absolute", marginTop: "-23px" }}>
        <IonTitle>{t('billing.premiumViewer.button')}</IonTitle>
      </IonHeader>

      <div className="premium-host-balance-box">
        <CurrentBalanceBox
          starsLabel={t('billing.starsStatus.currentBal')}
        />
      </div>

      {!openModal ? <div className="premium-host-content">
        <div className="content-header">
          <IonHeader className="host-header">
            <IonTitle>{t('billing.premiumHost.header')}</IonTitle>
          </IonHeader>
          <IonImg src={medalIcon} />
        </div>
        <IonLabel>{t('billing.premiumHost.description')}</IonLabel>

        <div className="subscription-details">
          <div>
            {/* <IonRadioGroup value="end"> */}
            {/* <div className="radio-button">
              <IonRadio slot="end" value="label" />
              <IonLabel>{t('billing.premiumHost.mothlySubscription')}</IonLabel>
            </div>
            <div className="radio-button">
              <IonRadio slot="end" value="label" />
              <IonLabel>{t('billing.premiumHost.yearlySubscription')}</IonLabel>
            </div> */}
            <IonRadioGroup
              value={selectedType}
              onIonChange={(e) => handleRadioButton(e.detail.value)}
            >
              {radioOptions.map((option) => (
                <div className="radio-button" key={option.value}>
                  <IonRadio slot="end" value={option.value} />
                  <IonLabel>{option.label}</IonLabel>
                </div>
              ))}
            </IonRadioGroup>
            <div className="checkbox-button">
              <IonCheckbox 
                onIonChange={(e) => setIsAutoRenewal(e.detail.checked)}
                checked={isAutoRenewal}
              />
              <IonLabel>{t('billing.premiumHost.autoRenewal')}</IonLabel>
            </div>
            {/* </IonRadioGroup> */}
          </div>

          {subscriptionTypes?.length > 0 && <div className="star-amount-details">
            <div className="star-amount-label">
              <IonImg src={starIcon} />
              <IonLabel>{`${getMonthlyAndYearlyPremiumViewer("PREMIUM_VLR", "MONTHLY")[0].starPrice} ${t('billing.premiumHost.stars')}`}</IonLabel>
            </div>

            <div className="star-amount-label">
              <IonImg src={starIconLightRed} />
              <IonLabel>{`${getMonthlyAndYearlyPremiumViewer("PREMIUM_VLR", "YEARLY")[0].starPrice} ${t('billing.premiumHost.stars')}`}</IonLabel>
            </div>
          </div>}
        </div>

        <IonButton 
          className="pay-button"
          onClick={() => handlePayButton()}
          disabled={selectedStarAmount?.length === 0 && ( subscriptionTypes === undefined || subscriptionTypes?.length === 0)}
        >
          {t('billing.premiumViewer.button')}
        </IonButton>
      </div> :
        <div className="premium-package-host-modal">
          <PremiumPackagesModal
            openModal={true}
            setOpenModal={setOpenModal}
            payCardIcon={medalIcon}
            payCardHeader={t('billing.premiumHost.header')}
            payCardDescription={t('billing.premiumHost.description')}
            currency={"EUR"}
            subscriptionName={selectedStarAmount[0].period === "MONTHLY" ? "Monthly subscription" : "Yearly subscription"}
            starValue={selectedStarAmount[0].starPrice}
            currencyValue={selectedStarAmount[0].price}
            autoRenewal={isAutoRenewal}
            selectedStarAmount={selectedStarAmount}
          />
        </div>
      }
    </Layout>
  )
}

export default PremiumHosts;