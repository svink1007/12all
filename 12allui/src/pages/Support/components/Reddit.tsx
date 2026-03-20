import React from "react";
import {Routes} from "../../../shared/routes";
import redditLogo from '../../../images/reddit.png';

import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonRouterLink} from "@ionic/react";
import "../styles.scss";

const Reddit: React.FC = () => {
  return (
    <IonCard className="ion-text-center media-card reddit">
      <IonCardHeader>
        <IonCardTitle>REDDIT POSTS</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonRouterLink href={Routes.RedditChannel} target="_blank">
          <IonImg src={redditLogo} className="media-icon"/>
        </IonRouterLink>
      </IonCardContent>
    </IonCard>
  );
};

export default Reddit;
