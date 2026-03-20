import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import './styles.scss';
import {IonCard, IonCardHeader, IonCardTitle} from '@ionic/react';
import Layout from '../../components/Layout';
import TermsContent from '../../components/TermsContent';

const Terms: FC = () => {
  const {t} = useTranslation();

  return (
    <Layout className={"terms-page"}>
      <IonCard className="term-page">
        <IonCardHeader>
          <IonCardTitle>{t('terms.header')}</IonCardTitle>
        </IonCardHeader>
        <TermsContent/>
      </IonCard>
    </Layout>
  )
};

export default Terms;
