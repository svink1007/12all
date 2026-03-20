import React, { FC, useState } from "react";
import "./styles.scss";
import { RouteComponentProps } from "react-router";
import Layout from "../../components/Layout";
import LeftNavMenu from "./LeftNavMenu";
import RightAccountStatus from "./RightAccountStatus";
import { IonHeader, IonTitle } from "@ionic/react";
import { useTranslation } from "react-i18next";
import CurrentBalanceBox from "../../components/CurrentBalance";

const AccountStatus: FC<RouteComponentProps> = ({ history }: RouteComponentProps) => {
  const { t } = useTranslation()
  const [activeNav, setActiveNav] = useState<string>("active-nav-menu1")

  const setItemAsActive = (menuName: string) => {
    setActiveNav(`active-nav-${menuName}`);
  };

  return (
    <Layout className="account-status-layout">
      <div className="account-status-container">
        <div className="acount-status-header !pt-2">
          {/* <div className="account-status-left"> */}
            <IonHeader>
              <IonTitle>{t('billing.premium.header')}</IonTitle>
            </IonHeader>

          {/* </div> */}

          <div className="star-balance-box">
            <CurrentBalanceBox
              className="account-current-balance-box"
              starsLabel={t('billing.starsStatus.currentBal')}
            />
          </div>
        </div>

        <div className="main-container">
          <LeftNavMenu setItemAsActive={setItemAsActive} activeNav={activeNav} />
          <RightAccountStatus activeNav={activeNav} />
        </div>
      </div>
    </Layout>
  )
}

export default AccountStatus

