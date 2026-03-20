import React from "react";
import "./styles.scss";
import { IonImg, IonLabel } from "@ionic/react";
import { useTranslation } from "react-i18next";
import starIcon from "../../images/icons/star-sharp.svg"
import { ReduxSelectors } from "../../redux/shared/types";
import { useSelector } from "react-redux";

type Props = {
  className?: string;
  starsLabel: string;
}

const CurrentBalanceBox: React.FC<Props> = ({ className, starsLabel }) => {
  const { t } = useTranslation()
  const {starsBalance} = useSelector(({ billingRewards }: ReduxSelectors) => billingRewards)

  console.log("user stars bal", starsBalance)

  return (
    <div className={`current-balance-box ${className}`}>
      <div className="balance-info">
        <div className="balance-left">
          <IonImg src={starIcon} />
          <IonLabel>{starsLabel}</IonLabel>
        </div>

        <div className="balance-right">
          <IonLabel>{t('billing.starsStatus.total')}</IonLabel>
          <IonLabel>{starsBalance ?? 0}</IonLabel>
          <IonLabel>{t('billing.starsStatus.stars')}</IonLabel>
        </div>
      </div>
    </div>
  );
};

export default CurrentBalanceBox;
