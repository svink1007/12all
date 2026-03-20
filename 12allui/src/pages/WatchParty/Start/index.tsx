import React, {FC} from 'react';
import {MAIN_CONTENT_ID} from '../../../shared/constants';
import {IonPage, IonRouterOutlet} from '@ionic/react';
import {Redirect, Route} from 'react-router-dom';
import {Routes} from '../../../shared/routes';
import {RouteComponentProps} from 'react-router';
import WatchPartyStart1 from './Step1';
import WatchPartyStart2 from './Step2';
import LivingRoom from '../LivingRoom';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../redux/shared/types';

const WatchPartyStart: FC<RouteComponentProps> = () => {
    const {share} = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);
    const {
        room: {publicId, roomId},
        channelName
    } = useSelector(({vlrTemplate}: ReduxSelectors) => vlrTemplate.selected);

    const renderWatchParty2 = (props: RouteComponentProps) => (
        publicId && roomId && channelName ?
            <WatchPartyStart2 {...props} /> :
            <Redirect
                exact
                from={Routes.WatchPartyStart2}
                to={Routes.WatchPartyStart1}
            />
    );

    const renderWatchPartyLivingRoom = (props: RouteComponentProps) => (
        share !== null ?
            <LivingRoom {...props} /> :
            <Redirect
                exact
                from={Routes.WatchPartyStartRoom}
                to={Routes.WatchPartyStart1}
            />
    );

    return (
        <IonPage id={MAIN_CONTENT_ID}>
            <IonRouterOutlet>
                <Route exact path={Routes.WatchPartyStart1} component={WatchPartyStart1}/>
                <Route exact path={Routes.WatchPartyStart2} render={renderWatchParty2}/>
                <Route exact path={Routes.WatchPartyStartRoom} render={renderWatchPartyLivingRoom}/>
                <Redirect exact from={Routes.WatchPartyStart} to={Routes.WatchPartyStart1}/>
            </IonRouterOutlet>
        </IonPage>
    );
};

export default WatchPartyStart;
