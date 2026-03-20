import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "../../../components/Layout";
import { IonButton, IonHeader, IonImg, IonLabel, IonRadio, IonRadioGroup, IonTitle } from "@ionic/react";
import starIcon from "../../../images/icons/star-sharp.svg"
import starIconLightRed from "../../../images/icons/star-sharp-light-red.svg"
import diamondIcon from "../../../images/icons/diamond.svg"
import "./styles.scss"
import PremiumPackagesModal from "../premiumPackagesModal";
import CurrentBalanceBox from "../../../components/CurrentBalance";
import { ReduxSelectors } from "../../../redux/shared/types";
import { useDispatch, useSelector } from "react-redux";
import { BillingServices } from "../../../services";
import { SubscriptionTypes } from "../../../shared/types";
import { setSubscriptionTypes } from "../../../redux/actions/billingRewardActions";
import { setErrorToast } from "../../../redux/actions/toastActions";

const PremiumViewers: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { subscriptionTypes } = useSelector(({ billingRewards }: ReduxSelectors) => billingRewards)
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStarAmount, setSelectedStarAmount] = useState<SubscriptionTypes[]>([])

  const radioOptions = [
    { value: 'MONTHLY', label: t('billing.premiumViewer.mothlySubscription') },
    { value: 'YEARLY', label: t('billing.premiumViewer.yearlySubscription') },
  ];

  console.log("subscriptionTypes viewer", subscriptionTypes)
  // setSelectedStarAmount(filteredType)

  const getMonthlyAndYearlyPremiumViewer = useCallback((type: string, period: string) => {
    let filteredType
    if (type === "AD_FREE") {
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

  console.log("selectedStarAmount", selectedStarAmount)

  return (
    <>
      <Layout className="premium-viewer-layout">
        <IonHeader style={{ opacity: !openModal ? "1" : "0.2" }}>
          <IonTitle>{t('billing.premium.header')}</IonTitle>
        </IonHeader>
        <IonHeader style={{ display: !openModal ? "none" : "", position: "absolute", marginTop: "-23px" }}>
          <IonTitle>{t('billing.premiumViewer.button')}</IonTitle>
        </IonHeader>

        <div className="premium-viewer-balance-box">
          <CurrentBalanceBox
            starsLabel={t('billing.starsStatus.currentBal')}
          />
        </div>

        {!openModal ?
          <div className="premium-viewer-content">
            <div className="content-header">
              <IonHeader className="viewer-header">
                <IonTitle>{t('billing.premiumViewer.header')}</IonTitle>
              </IonHeader>
              <IonImg src={diamondIcon} />
            </div>
            <IonLabel>{t('billing.premiumViewer.description')}</IonLabel>

            <div className="subscription-details">
              {/* <IonRadioGroup value="end">
                <div className="radio-button">
                  <IonRadio slot="end" value="label" />
                  <IonLabel>{t('billing.premiumViewer.mothlySubscription')}</IonLabel>
                </div>
                <div className="radio-button">
                  <IonRadio slot="end" value="label" />
                  <IonLabel>{t('billing.premiumViewer.yearlySubscription')}</IonLabel>
                </div>
              </IonRadioGroup> */}

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

              {subscriptionTypes?.length > 0 && <div className="star-amount-details">
                <div className="star-amount-label">
                  <IonImg src={starIcon} />
                  <IonLabel>{`${getMonthlyAndYearlyPremiumViewer("AD_FREE", "MONTHLY")[0].starPrice} ${t('billing.premiumViewer.stars')}`}</IonLabel>
                </div>

                <div className="star-amount-label">
                  <IonImg src={starIconLightRed} />
                  <IonLabel>{`${getMonthlyAndYearlyPremiumViewer("AD_FREE", "YEARLY")[0].starPrice} ${t('billing.premiumViewer.stars')}`}</IonLabel>
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
          </div>
          : <div className="premium-package-viewer-modal">
            <PremiumPackagesModal
              openModal={true}
              setOpenModal={setOpenModal}
              payCardIcon={diamondIcon}
              payCardHeader={t('billing.premiumViewer.header')}
              payCardDescription={t('billing.premiumViewer.description')}
              currency={"EUR"}
              subscriptionName={selectedStarAmount[0].period === "MONTHLY" ? "Monthly subscription" : "Yearly subscription"}
              starValue={selectedStarAmount[0].starPrice}
              currencyValue={selectedStarAmount[0].price}
              selectedStarAmount={selectedStarAmount}
            />
          </div>
        }

      </Layout>
    </>

  )
}

export default PremiumViewers;