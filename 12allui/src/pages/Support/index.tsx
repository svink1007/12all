import React, {useEffect, useState} from "react";
import YouTube from './components/YouTube';
import Reddit from "./components/Reddit";
import Faq from "./components/Faq";
import ContactUs from "./components/ContactUs";

import {SupportService} from '../../services';

import {IonCol, IonGrid, IonRow, IonSpinner,} from "@ionic/react";

import "./styles.scss";
import PerfectScrollbar from 'react-perfect-scrollbar';
import Layout from "../../components/Layout";
import AdSenseDownRow from "../../components/AdSense/AdSenseDownRow";
import AdSenseLeftCol from "../../components/AdSense/AdSenseLeftCol";
import AdSenseRightCol from "../../components/AdSense/AdSenseRightCol";

const Support: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    SupportService.getAll()
      .then(({data}) => {
        setQuestions(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const spinner = (
    <IonSpinner className="center-spinner" name="lines"/>
  );

  const content = (
    <PerfectScrollbar>
      <IonGrid>
        <IonRow>
          <AdSenseLeftCol/>

          <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="8" sizeXl="8">
            <Faq data={questions}/>
            <div className="second-row">
              <div className="external-media">
                <YouTube/>
                <Reddit/>
              </div>
              <ContactUs/>
            </div>
          </IonCol>

          <AdSenseRightCol/>
        </IonRow>

        <IonRow className="mobile-v">
          <IonCol size="12">
            <YouTube/>
          </IonCol>
          <IonCol sizeXs="12">
            <Reddit/>
          </IonCol>
          <IonCol size="12">
            <ContactUs/>
          </IonCol>
        </IonRow>

        <AdSenseDownRow/>
      </IonGrid>
    </PerfectScrollbar>
  );

  return (
    <Layout className="support-page">
      {!isLoading ? content : spinner}
    </Layout>
  );
};

export default Support;
