import React, { FC } from "react";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import { IonTitle } from "@ionic/react";
import BillingInfoComponent from "../subComponents/BillingInfo";
// import PaymentMethod from "../subComponents/PaymentMethod";
// import AccountBalance from "../subComponents/AccountBalance";
import BillingHistory from "../subComponents/BillingHistory";
import StarTransactions from "../subComponents/StarsTransactions";
// import DeleteAccount from "../subComponents/DeleteAccount";

type Props = {
  activeNav: string
}

const RightAccountStatus: FC<Props> = ({ activeNav }) => {
  const { t } = useTranslation()

  const getAccountTitle = (activeMenu: string) => {

    switch (activeMenu) {
      case "active-nav-menu1":
        return t('billing.accountStatus.leftNavMenu.menu1')
      // case "active-nav-menu2":
      //   return t('billing.accountStatus.leftNavMenu.menu2')
      // case "active-nav-menu3":
      //   return t('billing.accountStatus.leftNavMenu.menu3')
      case "active-nav-menu4":
        return t('billing.accountStatus.leftNavMenu.menu4')
      case "active-nav-menu5":
        return t('billing.accountStatus.leftNavMenu.menu5')
      // case "active-nav-menu6":
      //   return t('billing.accountStatus.leftNavMenu.menu6')

      default: return ""
    }
  }

  return (
    <div className="right-account-status-container">
      {/* <IonContent className="container"> */}
      <div className={`right-container ${["active-nav-menu4", "active-nav-menu5"].includes(activeNav) ? "billing-history-active" : ""}`}>
        <IonTitle>{getAccountTitle(activeNav)}</IonTitle>

        {activeNav === "active-nav-menu1" && <BillingInfoComponent />}
        {/* {activeNav === "active-nav-menu2" && <PaymentMethod />} */}
        {/* {activeNav === "active-nav-menu3" && <AccountBalance />} */}
        {activeNav === "active-nav-menu4" && <BillingHistory />}
        {activeNav === "active-nav-menu5" && <StarTransactions />}
        {/* {activeNav === "active-nav-menu6" && <DeleteAccount />} */}

      </div>
      {/* </IonContent> */}
    </div>
  )
}

export default RightAccountStatus

