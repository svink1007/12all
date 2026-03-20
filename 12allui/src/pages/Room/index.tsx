import React, {FC} from 'react';
import {IonPage, IonRouterOutlet} from '@ionic/react';
import {Redirect, Route} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import {Routes} from '../../shared/routes';
import RoomHomePage from './RoomHome';
import RoomTestPage from './RoomTest';

const RoomPage: FC = () => {
  const {jwt} = useSelector(({profile}: ReduxSelectors) => profile);

  return (
    <IonPage>
      <IonRouterOutlet>
        <Route
          exact
          path={Routes.RoomHome}
          render={
            props => jwt ?
              <RoomHomePage {...props}/> :
              <Redirect exact from={Routes.RoomHome} to={Routes.Login}/>
          }
        />
        <Route
          exact
          path={Routes.RoomTest}
          render={
            props => jwt ?
              <RoomTestPage {...props}/> :
              <Redirect exact from={Routes.RoomTest} to={Routes.Login}/>
          }
        />
        <Redirect exact from={Routes.Room} to={Routes.RoomHome}/>
      </IonRouterOutlet>
    </IonPage>
  );
};

export default RoomPage;
