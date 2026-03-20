import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import './styles.scss';
import {IonCard, IonCardHeader, IonCardTitle} from '@ionic/react';
import Layout from '../../components/Layout';
import PrivacyPolicyContent from '../../components/PrivacyPolicyContent';

const PrivacyPolicy: FC = () => {
  const {t} = useTranslation();

  return (
    <Layout className="center xl">
      <IonCard className="privacy-policy">
        <IonCardHeader>
          <IonCardTitle>{t('privacy.header')}</IonCardTitle>
        </IonCardHeader>
        <PrivacyPolicyContent/>
      </IonCard>
    </Layout>
  );
};

export default PrivacyPolicy;
