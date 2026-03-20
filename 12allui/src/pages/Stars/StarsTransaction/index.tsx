import React, { useEffect, useState } from "react";
import "./styles.scss";
import { IonButton, IonButtons, IonCardHeader, IonCardTitle, IonCheckbox, IonHeader, IonImg, IonInput, IonLabel, IonTitle } from "@ionic/react";
import Layout from "../../../components/Layout";
import { useTranslation } from "react-i18next";
import CurrentBalanceBox from "../../../components/CurrentBalance";
import { BillingServices } from "../../../services";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import { CashOutConfig, PaymentConfig, StarPackages } from "../../../shared/types";
import { callCashoutMethod, callPaymentMethod } from "../../../shared/helpers";
import { getHostUrl } from "../../../shared/constants";
import starHollowWhite from "../../../images/icons/star-sharp-hollow-white.svg"
import starFilledRed from "../../../images/icons/star-sharp.svg"
import starHollowRed from "../../../images/icons/star-sharp-red-hollow.svg"
import starFilledGrey from "../../../images/icons/star-sharp-grey-filled.svg"
import starFilledBlack from "../../../images/icons/star-sharp-black-filled.svg"
import downwardsArrow from "../../../images/icons/downwards-arrow.svg"
import { Routes } from "../../../shared/routes";

const StarsTransaction: React.FC = () => {
  const { t } = useTranslation()
  const { id, jwt, email } = useSelector(({ profile }: ReduxSelectors) => profile);
  const { starsBalance } = useSelector(({ billingRewards }: ReduxSelectors) => billingRewards)
  const [conversionRate, setConversionRate] = useState<string>("")
  const [starsValue, setStarsValue] = useState<number>(0)
  const [cost, setCost] = useState<number>(0)
  const [starPackages, setStarPackages] = useState<StarPackages[]>([])
  const [toggleTabs, setToggleTabs] = useState<boolean>(true)
  const [isWholeBalChecked, setIsWholeBalChecked] = useState<boolean>(false)
  const [isTopUpSelected, setIsTopUpSelected] = useState<boolean>(false)
  const [selectedPackageId, setSelectedPackageId] = useState<number>(0)

  useEffect(() => {
    BillingServices.getConversionRateTopUp2(0).then(({ data: { result } }) => {
      if (result) {
        setConversionRate(result.conversionRate.toString())
      }
    })

    BillingServices.getStarPackages().then(({ data: { result } }) => {
      // const doubledResult = [...result, ...result]
      setStarPackages(result)
    })
  }, [])

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
          backUrl: `${getHostUrl()}${Routes.StarsTransaction}`
        }
      };

      const payment = callPaymentMethod(config)

      console.log("payment", payment)
    }
  }

  const handleConvert = () => {
    if (starsValue) {
      let config: CashOutConfig;
      if (starPackages.length > 0) {
        config = {
          backUrl: `${getHostUrl()}${Routes.StarsTransaction}`,
          amount: cost,
          externalClientId: id,
          currency: 'EUR',
          stars: starsValue,
          authToken: jwt,

        };

        const payment = callCashoutMethod(config)

        console.log("payment", payment)
      }
    }
  }

  const handlePackageSelect = (packageId: number) => {
    const filteredPackage = starPackages.filter((packages) => packages.id === packageId)
    setSelectedPackageId(filteredPackage[0].id)
    setCost(filteredPackage[0].price)
    setStarsValue(filteredPackage[0].stars)
    setIsTopUpSelected(true)
  }

  const calculateStarsToEuro = (stars: string | null | undefined) => {
    if (stars === '') {
      setCost(0)
      setStarsValue(0)
    }
    if (stars && starsBalance !== parseInt(stars)) {
      setIsWholeBalChecked(false)
    }
    if (stars && conversionRate) {
      setStarsValue(parseInt(stars))
      const calculatedCost = (parseFloat(conversionRate) * parseInt(stars))
      setCost(calculatedCost)
    }
  }

  return (
    <Layout className="top-up-cash-out-layout">
      <IonHeader>
        <IonTitle>{t('billing.topupAndCashout.header')}</IonTitle>
      </IonHeader>

      <CurrentBalanceBox
        starsLabel={t('billing.starsStatus.currentBal')}
      />

      <div className="top-up-cash-out-card-layout">
        <div className="top-up-cash-out-card">
          <div className="top-up-cash-out-tabs" >
            <IonButtons className="tab-buttons">
              <IonButton
                className={`${toggleTabs ? 'active-button' : ''}`}
                type="button"
                onClick={() => {
                  setToggleTabs(true)
                  setStarsValue(0)
                  setCost(0)
                }}
              >
                <IonLabel>{t('billing.topUp.header')}</IonLabel>
              </IonButton>
              <IonButton
                className={`${toggleTabs ? '' : 'active-button'}`}
                type="button"
                onClick={() => {
                  setToggleTabs(false)
                  setStarsValue(0)
                  setCost(0)
                  setSelectedPackageId(0)
                }}
              >
                <IonLabel>{t('billing.cashOut.header')}</IonLabel>
              </IonButton>
            </IonButtons>
          </div>

          <IonCardHeader className="top-up-card-header">
            <IonCardTitle>Star CashOut</IonCardTitle>
          </IonCardHeader>

          <IonLabel>{`1 star = ${conversionRate} EUR`}</IonLabel>

          {toggleTabs ?
            (
              <div className="top-up-section">
                <div className="top-up-columns">
                  <IonLabel>{t('billing.topUp.hashStars')}</IonLabel>
                  <IonLabel>{"EUR"}</IonLabel>
                </div>

                <div className="top-up-packages">
                  {starPackages?.map((packages: StarPackages, index) => {
                    return (
                      <>
                        <div className={`top-up-package-list ${isTopUpSelected && selectedPackageId === packages.id ? "package-list-active" : ""}`} onClick={(e) => handlePackageSelect(packages.id)}>
                          <div className="top-up-stars-value">
                            <IonImg src={isTopUpSelected && selectedPackageId === packages.id ? starFilledRed : starHollowWhite} />
                            <IonLabel>{packages.stars}</IonLabel>
                          </div>
                          <IonLabel>{packages.price}</IonLabel>
                        </div>
                      </>
                    )
                  })
                  }
                </div>

                <div className="add-button-div">
                  <IonButton
                    className="add-button"
                    disabled={!selectedPackageId}
                    onClick={() => handleAdd()}
                  >
                    {t('billing.topUp.add')}
                  </IonButton>
                </div>
              </div>
            ) : (
              <div className="cash-out-section">
                <div className="stars-box">
                  <div className="stars-input-row">
                    <div className="stars-input-left">
                      <IonImg src={starHollowRed} />
                      <IonLabel># stars</IonLabel>
                    </div>
                    <div className="stars-input-right">
                      <IonInput
                        type="number"
                        value={starsValue}
                        defaultValue={0}
                        onIonChange={({ detail }) => calculateStarsToEuro(detail.value)}
                      />
                    </div>
                  </div>
                  <div className="balance-checkbox-row">
                    <div className={`checkbox-row ${isWholeBalChecked ? "checked" : ""}`}>
                      <IonCheckbox
                        value={isWholeBalChecked}
                        checked={isWholeBalChecked}
                        onIonChange={(e) => {
                          if (e.detail.checked) {
                            setIsWholeBalChecked(e.detail.checked)
                            setStarsValue(starsBalance)
                          } else {
                            setIsWholeBalChecked(e.detail.checked)
                            setStarsValue(0)
                            setCost(0)
                          }
                        }}
                      />
                      <IonImg src={isWholeBalChecked ? starFilledBlack : starFilledGrey} />
                      <IonLabel>Whole balance</IonLabel>
                    </div>
                    <IonLabel className={`total-checkbox ${isWholeBalChecked ? "checked" : ""}`}>Total: {starsBalance}</IonLabel>

                  </div>
                </div>

                <IonImg className="down-arrow-icon" src={downwardsArrow} />

                <div className="cost-euro-box">
                  <div className="cost-box-left">
                    <IonLabel>EUR</IonLabel>
                    <IonLabel>Value</IonLabel>
                  </div>

                  <div>
                    <IonLabel>{cost.toFixed(6)}</IonLabel>
                  </div>
                </div>

                <div className="convert-button-div ">
                  <IonButton
                    className="convert-button"
                    disabled={!starsValue}
                    onClick={() => handleConvert()}
                  >
                    {t('billing.cashOut.convert')}
                  </IonButton>
                </div>

              </div>
            )
          }

        </div>
      </div>

    </Layout>
  );
};

export default StarsTransaction;
