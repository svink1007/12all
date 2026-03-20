import React from "react";
import "./styles.scss";
import {IonCol, IonGrid, IonRow} from "@ionic/react";
import Layout from "../../components/Layout";
import HotNow from '../../components/HotNow';
import Articles from './components/Articles';
import CreateRoom from "../../components/CreateRoom";
import ConfirmPhone from "../../components/ConfirmPhone";
import {AdSenseFormat, AdSenseSlot} from '../../components/AdSense';
import AdSenseCard from '../../components/AdSense/AdSenseCard';

const News: React.FC = () => {
  return (
    <Layout className="articles-page">
      <IonGrid>
        <IonRow className="row-articles">
          <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="2" sizeXl="2">
            <CreateRoom/>
            <ConfirmPhone/>
            <AdSenseCard slot={AdSenseSlot.Left} format={AdSenseFormat.Rectangle}/>
          </IonCol>

          <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="8" sizeXl="8" className="articles-col">
            <Articles colSize={"4"}/>
          </IonCol>

          <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="2" sizeXl="2">
            <HotNow/>
            <AdSenseCard slot={AdSenseSlot.Right} format={AdSenseFormat.Rectangle}/>
          </IonCol>
        </IonRow>
      </IonGrid>
    </Layout>
  );
};

export default News;
