import React from 'react';
import {IonContent, IonPage} from '@ionic/react';
import './styles.scss';
import {MAIN_CONTENT_ID} from '../../shared/constants';

type Props = {
  className?: string;
  children: React.ReactNode;
};

const Layout: React.FC<Props> = ({className, children}: Props) => {

  const layoutClass = className ? `${className} layout-content` : 'layout-content';

  return (
    <IonPage id={MAIN_CONTENT_ID}>
      <IonContent className={layoutClass}>
        {children}
      </IonContent>
    </IonPage>
  );
};

export default Layout;
