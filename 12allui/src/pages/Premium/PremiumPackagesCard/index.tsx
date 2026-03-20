import React from "react";
import "./styles.scss";
import { IonButton, IonCardHeader, IonCardTitle, IonImg, IonLabel, useIonRouter } from "@ionic/react";
import { SubscriptionTypes } from "../../../shared/types";

type CardProp = {
  card: {
    icon: string,
    cardTitle: string,
    cardDescription: string,
    cardButton: string,
    routePath: string,
    subsTypes: Array<SubscriptionTypes>
  }
}

const PremiumPackagesCard: React.FC<CardProp> = ({ card }) => {
  const router = useIonRouter()

  return (
    <div className="premium-card-layout">
      <div className="premium-card">
        <IonImg src={card.icon} />
        <IonCardHeader className="premium-card-header">
          <IonCardTitle>{card.cardTitle}</IonCardTitle>
        </IonCardHeader>
        <IonLabel>{card.cardDescription}</IonLabel>
        <IonButton 
          className="go-button" 
          onClick={() => router.push(card.routePath)}
          disabled={card.subsTypes.length === 0}
        >
          {card.cardButton}
        </IonButton>
      </div>
    </div>
  );
};

export default PremiumPackagesCard;
