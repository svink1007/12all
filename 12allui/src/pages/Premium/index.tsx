import React, { useEffect, useState } from "react";
import "./styles.scss";
import { IonHeader, IonTitle } from "@ionic/react";
import Layout from "../../components/Layout";
import { useTranslation } from "react-i18next";
import PremiumPackagesCard from "./PremiumPackagesCard";
import diamondIcon from "../../images/icons/diamond.svg"
import medalIcon from "../../images/icons/medal.svg"
import { Routes } from "../../shared/routes";
import CurrentBalanceBox from "../../components/CurrentBalance";
import { SubscriptionTypes } from "../../shared/types";
import { BillingServices } from "../../services";
import { useDispatch, useSelector } from "react-redux";
import { setSubscriptionTypes } from "../../redux/actions/billingRewardActions";
import { ReduxSelectors } from "../../redux/shared/types";
import { setErrorToast } from "../../redux/actions/toastActions";


const Premium: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { subscriptionTypes } = useSelector(({ billingRewards }: ReduxSelectors) => billingRewards)
  const [subsTypes, setSubsTypes] = useState<Array<SubscriptionTypes>>([])
  // const [isSubsTypesEmpty, setIsSubsTypesEmpty] = useState<Boolean>(false)

  const premiumCardDetails = [
    {
      icon: diamondIcon,
      cardTitle: t('billing.premium.cardTitle1'),
      cardDescription: t('billing.premium.cardDescription1'),
      cardButton: t('billing.premium.button'),
      routePath: Routes.PremiumViewer
    },
    {
      icon: medalIcon,
      cardTitle: t('billing.premium.cardTitle2'),
      cardDescription: t('billing.premium.cardDescription2'),
      cardButton: t('billing.premium.button'),
      routePath: Routes.PremiumHost
    }
  ]

  console.log("subsTypes", subsTypes)
  console.log("subsTypes.length", subsTypes.length)

  useEffect(() => {
    if (subsTypes.length === 0) {
      BillingServices.getSubscriptionType().then(({ data: { result, status } }) => {
        console.log("response subs type", result, status)
        if (status === 'nok') {
          dispatch(setErrorToast("Something went wrong. Please try again later."))
          return;
        }

        if (status === 'ok' && result.length === 0) {
          // setIsSubsTypesEmpty(true)
        } else if (status === 'ok') {
          // setIsSubsTypesEmpty(false)
          setSubsTypes(result)
          dispatch(setSubscriptionTypes(result))
        }
      })
    }
  }, [subsTypes, subscriptionTypes, dispatch])

  console.log("subscriptionTypes type", subscriptionTypes)

  return (
    <Layout className="premium-layout">
      <IonHeader>
        <IonTitle>{t('billing.premium.header')}</IonTitle>
      </IonHeader>

      <div className="premium-balance-box">
        <CurrentBalanceBox
          starsLabel={t('billing.starsStatus.currentBal')}
        />
      </div>

      {premiumCardDetails.map((card, index) => {
        return (
          <PremiumPackagesCard card={{ ...card, subsTypes }} key={index} />
        )
      })
      }

    </Layout>
  );
};

export default Premium;
