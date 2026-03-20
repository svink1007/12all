import React, {FC} from 'react';
import './styles.scss';
import {useTranslation} from 'react-i18next';
import {IonText} from '@ionic/react';

const NotingFound: FC = () => {
  const {t} = useTranslation();
  return <IonText className="nothing-found">{t('home.nothingFound')}</IonText>;
};

export default NotingFound;
