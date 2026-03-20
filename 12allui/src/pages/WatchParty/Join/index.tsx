import React, {FC} from 'react';
import {MAIN_CONTENT_ID} from '../../../shared/constants';
import {IonPage, IonRouterOutlet} from '@ionic/react';
import {RouteComponentProps} from 'react-router';
import {Redirect, Route} from 'react-router-dom';
import {Routes} from '../../../shared/routes';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../redux/shared/types';
import WatchPartyJoinHome from './JoinHome';
import LivingRoom from '../LivingRoom';

const WatchPartyJoin: FC<RouteComponentProps> = () => {
  const {roomId} = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);

  return (
    <IonPage id={MAIN_CONTENT_ID}>
      <IonRouterOutlet>
        <Route exact path={Routes.WatchPartyJoin} component={WatchPartyJoinHome}/>
        <Route
          exact
          path={Routes.WatchPartyJoinRoom}
          render={props => roomId ?
            <LivingRoom {...props} /> :
            <Redirect exact from={Routes.WatchPartyJoinRoom} to={Routes.WatchPartyJoin}/>
          }
        />
      </IonRouterOutlet>
    </IonPage>
  );
};

export default WatchPartyJoin;
