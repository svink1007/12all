import React, {useEffect, useState} from "react";

import {IonCol, IonRouterLink, IonRow} from "@ionic/react";
import "./styles.scss";

import {getCareerUrl} from "../../shared/helpers";

import {CareersService} from '../../services';

import {useTranslation} from 'react-i18next';

const Careers: React.FC = () => {
  const {t} = useTranslation();

  const [careers, setCareers] = useState(Array<any>());

  useEffect(() => {
    CareersService.getAll()
      .then(({data}) => {
        setCareers(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const content = (
    <>
      <IonRow className="careers-header">
        <IonCol sizeMd="3">{t('careers.titles.title')}</IonCol>
        <IonCol sizeMd="7">{t('careers.titles.description')}</IonCol>
        <IonCol sizeMd="2">{t('careers.titles.location')}</IonCol>
      </IonRow>
      {
        careers.map(x => {
          let careerDescription = x.description;

          if (careerDescription.length > 100) {
            careerDescription = x.description.substring(0, 100) + "...";
          }

          return (
            <IonRow key={x.id} className="careers-grid">
              <IonCol sizeMd="3" className="col">
                <IonRouterLink
                  routerLink={`/${getCareerUrl(x.id)}`}
                  href={`/${getCareerUrl(x.id)}`}
                  // routerDirection="back"
                  target="_blank"
                >

                  {x.title}
                </IonRouterLink>
              </IonCol>
              <IonCol sizeMd="7" className="col">{careerDescription}</IonCol>
              <IonCol sizeMd="2" className="col">{x.location}</IonCol>
            </IonRow>
          )
        })
      }
    </>
  )

  return (
    <>
      {content}
    </>
  );
};

export default Careers;
