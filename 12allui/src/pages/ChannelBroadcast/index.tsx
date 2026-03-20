import React, {FC} from 'react';
import './styles.scss';
import {RouteComponentProps} from 'react-router';
import Layout from '../../components/Layout';
import Iframe from 'react-iframe';
import {IonBackButton, IonButtons, IonTitle, IonToolbar, useIonViewWillEnter} from '@ionic/react';
import {Routes} from '../../shared/routes';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';

const ChannelBroadcast: FC<RouteComponentProps> = ({history}) => {
  const {url, name} = useSelector(({sharedSite}: ReduxSelectors) => sharedSite);

  useIonViewWillEnter(() => {
    if (!url) {
      history.replace(Routes.Home);
    }
  }, [url, history]);

  return (
    <Layout>
      <div className="channel-broadcast-page">
        <IonToolbar color="light">
          <IonButtons slot="start">
            <IonBackButton defaultHref={Routes.Home}/>
          </IonButtons>
          <IonTitle slot="end">{name}</IonTitle>
        </IonToolbar>

        <Iframe
          url={url}
          allowFullScreen
        />
      </div>
    </Layout>
  );
};

export default ChannelBroadcast;
