import React, { useEffect, useState } from "react";
import "./styles.scss";
import { IonButton, IonCardHeader, IonCardTitle, IonHeader, IonLabel, IonTitle } from "@ionic/react";
import Layout from "../../../components/Layout";
import { useTranslation } from "react-i18next";
import starIconWhite from "../../../images/icons/star-sharp-hollow-white.svg"
import InputWithCurrency from "../../../components/InputComponent/InputWithCurrency";
import CurrentBalanceBox from "../../../components/CurrentBalance";
import { BillingServices } from "../../../services";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import { PaymentConfig, StarPackages } from "../../../shared/types";
import InputDropdownWithIcon from "../../../components/InputComponent/InputDropdownWithIcon";
import { callPaymentMethod } from "../../../shared/helpers";
import { getHostUrl } from "../../../shared/constants";

const TopUp: React.FC = () => {
  const { t } = useTranslation()
  const { id, jwt, email } = useSelector(({ profile }: ReduxSelectors) => profile);
  const [conversionRate, setConversionRate] = useState<string>("")
  const [starsValue, setStarsValue] = useState<number>(0)
  const [cost, setCost] = useState<number>(0)
  const [starPackages, setStarPackages] = useState<StarPackages[]>([])

  useEffect(() => {
    BillingServices.getConversionRateTopUp(0).then(({ data: { result } }) => {
      if (result) {
        setConversionRate(result.conversionRate.toString())
      }
    })

    BillingServices.getStarPackages().then(({ data: { result } }) => {
      console.log("getStarPackages result", result)
      setStarPackages(result)
    })
  }, [])

  // useEffect(() => {
  //   if (starsValue && conversionRate) {
  //     const calculateStars = parseFloat(conversionRate) * parseInt(starsValue)
  //     console.log("calculatedStars", calculateStars)
  //     setCost(calculateStars.toFixed(6))
  //   } else if (!starsValue) {
  //     setCost(null)
  //   }
  // }, [starsValue, conversionRate])

  console.log("cost",cost)

  const handleAdd = () => {

    console.log("handle add", starPackages)
    let config: PaymentConfig;
    if(starPackages.length > 0) {
      config = {
        externalClientId: id,
        currency: 'EUR',
        items: [
          {
            itemId: 1,
            quantity: starsValue,
            type: 'TOP_UP'
          },
        ],
        userEmail: email,
        fullPrice: cost,
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

  const handlePackageSelect = (packageId: number) => {
    const filteredPackage = starPackages.filter((packages) => packages.id === packageId)
    setCost(filteredPackage[0].price)
    setStarsValue(filteredPackage[0].stars)
  }

  return (
    <Layout className="top-up-layout">
      <IonHeader>
        <IonTitle>{t('billing.topUp.header')}</IonTitle>
      </IonHeader>

      <CurrentBalanceBox
        starsLabel={t('billing.starsStatus.currentBal')}
      />

      <div className="top-up-card-layout">
        <div className="top-up-card">
          <IonCardHeader className="top-up-card-header">
            <IonCardTitle>{t('billing.topUp.cardTitle')}</IonCardTitle>
          </IonCardHeader>

          <IonLabel>{`1 star = ${conversionRate} EUR`}</IonLabel>

          <hr className="horizontal-row" />

          <div className="middle-card-content">

            <InputDropdownWithIcon
              icon={starIconWhite}
              inputLabel={t('billing.topUp.hashStars')}
              name={t('billing.topUp.hashStars')}
              type="number"
              starPackages={starPackages}
              handlePackageSelect={handlePackageSelect}
            />

            <InputWithCurrency
              currencyLabel="EUR"
              inputLabel={t('billing.topUp.cost')}
              name={t('billing.topUp.cost')}
              type="number"
              value={cost.toString()}
              setValue={setCost}
              disabled={true}
            />
          </div>

          <hr className="horizontal-row" />

          <IonButton
            className="add-button"
            onClick={() => handleAdd()}
          >
            {t('billing.topUp.add')}
          </IonButton>
        </div>
      </div>

    </Layout>
  );
};

export default TopUp;
