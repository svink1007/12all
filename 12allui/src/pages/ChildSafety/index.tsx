import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import './styles.scss';
import {IonCard, IonCardHeader, IonCardTitle} from '@ionic/react';
import Layout from '../../components/Layout';
import ChildSafetyDialog from '../../components/ChildSafetyDialog';

const ChildSafety: FC = () => {
  const {t} = useTranslation();

  return (
    <Layout className="center xl">
      <IonCard className="child-safety">
        <IonCardHeader>
          <IonCardTitle>{t('footer.safety')}</IonCardTitle>
        </IonCardHeader>
        <ChildSafetyDialog/>
      </IonCard>
    </Layout>
  );
};

export default ChildSafety;
