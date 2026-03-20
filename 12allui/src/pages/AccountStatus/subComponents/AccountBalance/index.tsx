import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import { IonButton, IonCardTitle, IonLabel } from "@ionic/react";
import { useTranslation } from "react-i18next";
import InputWithCurrency from "../../../../components/InputComponent/InputWithCurrency";
import InputWithIcon from "../../../../components/InputComponent/InputWithIcon";
import starHollowWhite from "../../../../images/icons/star-sharp-hollow-white.svg"
import CurrentBalanceBox from "../../../../components/CurrentBalance";
import { BillingServices } from "../../../../services";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../../../redux/shared/types";
import { PaymentConfig } from "../../../../shared/types";
import { callPaymentMethod } from "../../../../shared/helpers";
import { getHostUrl } from "../../../../shared/constants";

// type Props = {
//   setItemAsActive: (value: string) => void;
//   activeNav: string
// }

const AccountBalance: FC = () => {
  const { t } = useTranslation()
  const { id, jwt, email } = useSelector(({ profile }: ReduxSelectors) => profile);
  const [conversionRate, setConversionRate] = useState<string>("")
  const [starsTopUp, setStarsTopUp] = useState<string | null>(null)
  const [starsCashOut, setStarsCashOut] = useState<string | null>(null)
  const [costTopUp, setCostTopUp] = useState<number>(0)
  const [costCashOut, setCostCashOut] = useState<number>(0)


  useEffect(() => {
    BillingServices.getConversionRateTopUp(0).then(({ data: { result } }) => {
      if (result) {
        setConversionRate(result.conversionRate.toString())
      }
    })
  }, [])

  // useEffect(() => {
  //   if (starsTopUp && conversionRate) {
  //     const calculateStars = parseFloat(conversionRate) * parseInt(starsTopUp)
  //     console.log("calculatedStars", calculateStars)
  //     setCostTopUp(calculateStars.toFixed(6))
  //   } else if (!starsTopUp) {
  //     setCostTopUp(null)
  //   }

  //   if (starsCashOut && conversionRate) {
  //     const calculateStars = parseFloat(conversionRate) * parseInt(starsCashOut)
  //     console.log("calculatedStars", calculateStars)
  //     setCostCashOut(calculateStars.toFixed(6))
  //   } else if (!starsCashOut) {
  //     setCostCashOut(null)
  //   }

  // }, [starsTopUp, conversionRate, starsCashOut])

  const handleConvertStarsToTopup = () => {
    let config: PaymentConfig;
    if(starsTopUp) {
      config = {
        externalClientId: id,
        currency: 'EUR',
        items: [
          {
            itemId: 1,
            quantity: Number(starsTopUp),
            type: 'TOP_UP'
          },
        ],
        userEmail: email,
        fullPrice: Number(costTopUp.toFixed(6)),
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

  const handleConvertMonyToCashout = () => {
    let config: PaymentConfig;
    if(starsTopUp) {
      config = {
        externalClientId: id,
        currency: 'EUR',
        items: [
          {
            itemId: 1,
            quantity: Number(starsTopUp),
            type: 'CASH_OUT'
          },
        ],
        userEmail: email,
        fullPrice: Number(costTopUp.toFixed(6)),
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

  return (
    <div className="account-balance-status">

      <div className="account-current-balance-box-2">
        <CurrentBalanceBox
          className="account-bal-box-component"
          starsLabel={t('billing.accountStatus.menu3.currentStars')}
        />
      </div>

      <div className="converter">
        <IonCardTitle>{t('billing.topUp.cardTitle')}</IonCardTitle>

        <IonLabel className="current-rate">{`1 star = ${conversionRate} EUR`}</IonLabel>

        <div className="line">
          <hr className="horizontal-row" />
        </div>

        <div className="stars-cost">
          <div className="stars-input">
            <InputWithIcon
              // className=""
              icon={starHollowWhite}
              inputLabel={t('billing.accountStatus.menu3.hashStars')}
              type="text"
              name={t('billing.accountStatus.menu3.hashStars')}
              value={starsTopUp}
              setValue={setStarsTopUp}
            />
          </div>
          <div className="stars-input">
            <InputWithCurrency
              // className=""
              currencyLabel={"EUR"}
              inputLabel={t('billing.accountStatus.menu3.cost')}
              type="text"
              name={t('billing.accountStatus.menu3.cost')}
              value={costTopUp.toString()}
              setValue={setCostTopUp}
              disabled={true}
            />
          </div>
          <div className="add-button">
            <IonButton
              onClick={() => handleConvertStarsToTopup()}
            >
              {t('billing.accountStatus.menu3.add')}
            </IonButton>
          </div>
        </div>


      </div>

      <div className="converter">
        <IonCardTitle>{`${t('billing.accountStatus.menu3.convertStars')} ${t('billing.accountStatus.menu3.cashOut')}`}</IonCardTitle>

        <IonLabel className="current-rate">{`1 star = ${conversionRate} EUR`}</IonLabel>

        <div className="line">
          <hr className="horizontal-row" />
        </div>

        <div className="stars-cost">
          <div className="stars-input">
            <InputWithIcon
              // className=""
              icon={starHollowWhite}
              inputLabel={t('billing.accountStatus.menu3.hashStars')}
              type="text"
              name={t('billing.accountStatus.menu3.hashStars')}
              value={starsCashOut}
              setValue={setStarsCashOut}
            />
          </div>
          <div className="stars-input">
            <InputWithCurrency
              // className=""
              currencyLabel={"EUR"}
              inputLabel={t('billing.accountStatus.menu3.value')}
              type="text"
              name={t('billing.accountStatus.menu3.value')}
              value={costCashOut.toString()}
              setValue={setCostCashOut}
              disabled={true}
            />
          </div>
          <div className="add-button">
            <IonButton
              onClick={() => handleConvertMonyToCashout()}
            >
              {t('billing.accountStatus.menu3.add')}
            </IonButton>
          </div>
        </div>
      </div>

      <div className="converter">
        <div className="line">
          <hr className="horizontal-row" />
        </div>
      </div>
    </div>
  )
}

export default AccountBalance

