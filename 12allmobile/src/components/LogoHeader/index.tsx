import React, { FC } from "react";
import "./styles.scss";
import { IonImg, IonTitle } from "@ionic/react";
import logoPremium from "../../images/one-2-all-logo-black-&-white-premium-purple.png";
import logo from "../../images/12all-logo-dark.svg";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/types";

const LogoHeader: FC = () => {
  const { ownedProduct } = useSelector(
    ({ inAppProduct }: ReduxSelectors) => inAppProduct
  );
  const { premium } = useSelector(({ profile }: ReduxSelectors) => profile);

  return (
    <IonTitle className="logo-header">
      <IonImg
        src={!!ownedProduct || premium ? logoPremium : logo}
        className="logo h-10 w-auto"
      />
    </IonTitle>
  );
};

export default LogoHeader;
