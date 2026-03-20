import React from "react";
import {Routes} from "../../../shared/routes";
import youTubeLogo from '../../../images/youtube.png';

import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonRouterLink} from "@ionic/react";
import "../styles.scss";

const YouTube: React.FC = () => {
  return (
    <IonCard className="ion-text-center media-card">
      <IonCardHeader>
        <IonCardTitle>YOUTUBE TUTORIALS</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonRouterLink href={Routes.YouTubeChannel} target="_blank">
          <IonImg src={youTubeLogo} className="media-icon"/>
        </IonRouterLink>
      </IonCardContent>
    </IonCard>
  );
};

export default YouTube;
