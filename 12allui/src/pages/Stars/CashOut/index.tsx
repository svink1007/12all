import React, { useEffect, useState } from "react";
import "./styles.scss";
import { IonButton, IonCardHeader, IonCardTitle, IonHeader, IonLabel, IonTitle } from "@ionic/react";
import Layout from "../../../components/Layout";
import { useTranslation } from "react-i18next";
import starIconWhite from "../../../images/icons/star-sharp-hollow-white.svg"
import InputWithCurrency from "../../../components/InputComponent/InputWithCurrency";
import CurrentBalanceBox from "../../../components/CurrentBalance";
import { BillingServices } from "../../../services";
import { ReduxSelectors } from "../../../redux/shared/types";
import { useSelector } from "react-redux";
import { callPaymentMethod } from "../../../shared/helpers";
import { PaymentConfig, StarPackages } from "../../../shared/types";
import InputDropdownWithIcon from "../../../components/InputComponent/InputDropdownWithIcon";
import { getHostUrl } from "../../../shared/constants";

const CashOut: React.FC = () => {
  const { t } = useTranslation()
  const { id, jwt, email } = useSelector(({ profile }: ReduxSelectors) => profile);
  const [conversionRate, setConversionRate] = useState<string>("")
  const [starsValue, setStarsValue] = useState<number>(0)
  const [cost, setCost] = useState<number>(0)
  const [starPackages, setStarPackages] = useState<StarPackages[]>([])

  useEffect(() => {
    BillingServices.getConversionRateCashOut(0).then(({ data: { result } }) => {
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

  const handleAdd = () => {

    let config: PaymentConfig;
    if (starPackages.length > 0) {
      config = {
        externalClientId: id,
        currency: 'EUR',
        items: [
          {
            itemId: 1,
            quantity: starsValue,
            type: 'CASH_OUT'
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
    <Layout className="cash-out-layout">
      <IonHeader>
        <IonTitle>{t('billing.cashOut.header')}</IonTitle>
      </IonHeader>

      <div className="cash-out-balance-box">
        <CurrentBalanceBox
          starsLabel={t('billing.starsStatus.currentBal')}
        />
      </div>

      <div className="cash-out-card-layout">
        <div className="cash-out-card">
          <IonCardHeader className="cash-out-card-header">
            <IonCardTitle>{t('billing.cashOut.cardTitle')}</IonCardTitle>
          </IonCardHeader>

          <IonLabel>{`1 star = ${conversionRate} EUR`}</IonLabel>

          <hr className="horizontal-row" />

          <div className="middle-card-content">
            <InputDropdownWithIcon
              icon={starIconWhite}
              inputLabel={t('billing.cashOut.hashStars')}
              name={t('billing.cashOut.hashStars')}
              type="number"
              starPackages={starPackages}
              handlePackageSelect={handlePackageSelect}
            />

            <InputWithCurrency
              currencyLabel="EUR"
              inputLabel={t('billing.cashOut.value')}
              name={t('billing.cashOut.value')}
              type="text"
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
            {t('billing.cashOut.convert')}
          </IonButton>
        </div>
      </div>

    </Layout>
  );
};

export default CashOut;
