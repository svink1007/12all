import { IonContent, IonImg, IonPage } from "@ionic/react";
import { useSelector } from "react-redux";
import { FC, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { useTranslation } from "react-i18next";

import { ReduxSelectors } from "../../redux/types";
import { BillingServices } from "../../services/BillingServices";
import { Routes } from "../../shared/routes";

import "./styles.scss";
import Close from "../../images/settings/close.svg";
import Star from "../../images/profile-settings/star.svg";
import SafeAreaView from "../../components/SafeAreaView";
import { getHostUrl } from "../../shared/constants";
import { callCashoutMethod, callPaymentMethod } from "../../shared/helpers";

const AccountBalance: FC<RouteComponentProps> = ({ history }) => {
  const { t } = useTranslation();
  const { id, email, jwtToken } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );

  const [balance, setBalance] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [topUpStars, setTopUpStars] = useState(0);
  const [cashOutStars, setCashOutStars] = useState(0);
  const [cost, setCost] = useState(0);
  const [value, setValue] = useState(0);

  useEffect(() => {
    (async function () {
      const data = await BillingServices.billingStarBalance(id);
      const conversionData = await BillingServices.getConversionTopUp(1);
      if (data.data.status === "ok" && data.data.starsBalance > 0) {
        setBalance(data.data.starsBalance);
      }
      if (
        conversionData.data.status === "ok" &&
        conversionData.data.result.conversionRate > 0
      ) {
        setConversionRate(conversionData.data.result.conversionRate);
      }
    })();
  }, []);

  const onCloseClick = () => {
    history.push(Routes.Broadcasts);
  };

  const onTopUpChange = (e: any) => {
    setTopUpStars(e.target.value);
    setCost(parseFloat(e.target.value) * conversionRate);
  };

  const onCashOutChange = (e: any) => {
    if (parseFloat(e.target.value) > balance) {
      setCashOutStars(balance);
      setValue(balance * conversionRate);
    } else {
      setCashOutStars(e.target.value);
      setValue(parseFloat(e.target.value) * conversionRate);
    }
  };

  const handleAdd = () => {
    console.log("getHostUrl():", getHostUrl());
    let config;
    config = {
      externalClientId: id,
      currency: "EUR",
      items: [
        {
          itemId: 1,
          quantity: topUpStars,
          type: "TOP_UP",
        },
      ],
      userEmail: email,
      fullPrice: cost,
      authToken: jwtToken,
      withPromoCodes: false,
      redirectOptions: {
        text: "redirect text",
        successUrl: getHostUrl(),
        backUrl: `${getHostUrl()}${Routes.ProtectedAccountBalance}`,
      },
    };

    const payment = callPaymentMethod(config);

    console.log("payment", payment);
  };

  const handleConvert = () => {
    if (cashOutStars) {
      let config: any;
      config = {
        backUrl: `${getHostUrl()}${Routes.ProtectedAccountBalance}`,
        amount: value,
        externalClientId: id,
        currency: "EUR",
        stars: cashOutStars,
        authToken: jwtToken,
      };

      const payment = callCashoutMethod(config);

      console.log("payment", payment);
    }
  };

  return (
    <IonPage>
      <IonContent className="account-balance-page-container">
        <SafeAreaView>
          <div className="account-balance-container">
            <div className="account-balance-header">
              <IonImg
                src={Close}
                className="account-balance-close"
                onClick={onCloseClick}
              />
              <div className="account-balance-header-title">
                <p>{t("accountBalance.accountBalance")}</p>
                <p className="account-balance-header-meeting-link"></p>
              </div>
            </div>
            <div className="stars-balance-container">
              <div className="stars-balance-body">
                <p className="balance-text">
                  {t("accountBalance.currentBalance")}
                </p>
                <img className="star-avatar" src={Star} />
                <div className="stars-balance">
                  <p>
                    {t("accountBalance.total")}: {balance}{" "}
                    {t("accountBalance.stars")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="manual-top-up-container">
            <div className="top-up-information-container">
              <p className="top-up-title">
                {t("accountBalance.manualStarTopUp")}
              </p>
              <p className="top-up-info">
                1 {t("accountBalance.star")} = {conversionRate}{" "}
                {t("accountBalance.eur")}
              </p>
            </div>
            <div className="top-up-form-fields-container">
              <div className="top-up-stars-input-container">
                <p className="top-up-stars-input-label"># Stars</p>
                <div className="input-wrapper">
                  <img src={Star} className="input-icon"></img>
                  <input
                    className="top-up-stars-input input-field"
                    id="stars"
                    type="number"
                    onChange={onTopUpChange}
                    value={topUpStars}
                  ></input>
                </div>
              </div>
              <div className="top-up-cost-input-container">
                <p className="top-up-cost-input-label">Cost</p>
                <div className="input-wrapper">
                  <span className="input-icon">{t("accountBalance.eur")}</span>
                  <input
                    className="top-up-cost-input input-field"
                    id="stars"
                    type="number"
                    value={cost}
                    disabled
                  ></input>
                </div>
              </div>
            </div>
            <button className="top-up-add-button" onClick={handleAdd}>
              {t("accountBalance.add")}
            </button>
          </div>
          <div className="manual-cash-out-container">
            <div className="cash-out-information-container">
              <p className="cash-out-title">{t("accountBalance.cashOut")}</p>
              <p className="cash-out-info">
                1 {t("accountBalance.star")} = {conversionRate}{" "}
                {t("accountBalance.eur")}
              </p>
            </div>
            <div className="cash-out-form-fields-container">
              <div className="cash-out-stars-input-container">
                <p className="cash-out-stars-input-label"># Stars</p>
                <div className="input-wrapper">
                  <img src={Star} className="input-icon"></img>
                  <input
                    className="cash-out-stars-input input-field"
                    id="stars"
                    type="number"
                    value={cashOutStars}
                    onChange={onCashOutChange}
                  ></input>
                </div>
              </div>
              <div className="cash-out-cost-input-container">
                <p className="cash-out-cost-input-label">Value</p>
                <div className="input-wrapper">
                  <span className="input-icon">{t("accountBalance.eur")}</span>
                  <input
                    className="cash-out-cost-input input-field"
                    id="stars"
                    type="number"
                    value={value}
                    disabled
                  ></input>
                </div>
              </div>
            </div>
            <button className="cash-out-add-button" onClick={handleConvert}>
              {t("accountBalance.convert")}
            </button>
          </div>
        </SafeAreaView>
      </IonContent>
    </IonPage>
  );
};

export default AccountBalance;
