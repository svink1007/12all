import React, {useEffect} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle,} from "@ionic/react";
import "../styles.scss";
import FaqAccordion from "./FaqAccordion";
import PerfectScrollbar from 'react-perfect-scrollbar';

type FaqProps = {
  data: Array<any>;
}

const Faq: React.FC<FaqProps> = ({data}) => {
  useEffect(() => {

  }, []);

  return (
    <IonCard className="faq-container">
      <IonCardHeader>
        <IonCardTitle>FAQ</IonCardTitle>
      </IonCardHeader>
      <PerfectScrollbar>
        <IonCardContent className="accordion-content">
          <FaqAccordion questions={data}/>
        </IonCardContent>
      </PerfectScrollbar>
    </IonCard>
  );
};

export default Faq;
