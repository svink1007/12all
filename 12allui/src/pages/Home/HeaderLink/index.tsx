import React, {FC} from 'react';
import './styles.scss';
import {IonIcon, IonItem} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {Routes} from '../../../shared/routes';
import {chevronForward} from 'ionicons/icons';

type Props = {
  title: string;
  link: Routes;
};

const HeaderLink: FC<Props> = ({title, link}) => {
  const {t} = useTranslation();
  return (
    <IonItem
      routerLink={link}
      lines="none"
      className="home-header-link"
      title={t('home.exploreAll')}
      detail={false}>
      {t(title)} <IonIcon icon={chevronForward}/>
    </IonItem>
  );
};

export default HeaderLink;
