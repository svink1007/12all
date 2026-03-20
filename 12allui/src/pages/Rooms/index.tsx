import React, {FC, useState} from 'react';
import './styles.scss';
import Layout from '../../components/Layout';
import FilterToolbar from '../../components/FilterToolbar';
import NotingFound from '../Home/NotingFound';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonRow,
  IonToggle,
  useIonViewWillEnter,
  useIonViewWillLeave
} from '@ionic/react';
import LiveRoom from '../../components/LiveRoom';
import RoomHeader from '../../components/RoomHeader';
import UpcomingRoom from '../../components/UpcomingRoom';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {setSearch} from '../../redux/actions/searchActions';
import {SearchType} from '../../redux/shared/enums';
import {ReduxSelectors} from '../../redux/shared/types';
import useRoomsSocket from '../../hooks/useRoomsSocket';

const RoomsPage: FC = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {query} = useSelector(({search}: ReduxSelectors) => search);
  const [showLiveRooms, setShowLiveRooms] = useState<boolean>(true);
  const [showUpcomingRooms, setShownUpcomingRooms] = useState<boolean>(true);

  const {liveRooms, upcomingRooms} = useRoomsSocket();

  useIonViewWillEnter(() => {
    dispatch(setSearch({type: SearchType.Room}));
  }, [dispatch]);

  useIonViewWillLeave(() => {
    !query && dispatch(setSearch({type: SearchType.All}));
  }, [query, dispatch]);

  return (
    <Layout className="rooms-page">
      <FilterToolbar title="home.rooms" addition={(
        <IonItemGroup className="manage-rooms">
          <IonItem className="row-item" lines="none">
            <IonLabel>{t('liveRoom.live')}</IonLabel>
            <IonToggle
              checked={showLiveRooms}
              slot="end"
              onIonChange={e => setShowLiveRooms(e.detail.checked)}/>
          </IonItem>
          <IonItem className="row-item" lines="none">
            <IonLabel>{t('upcomingRoom.upcoming')}</IonLabel>
            <IonToggle
              checked={showUpcomingRooms}
              slot="end"
              onIonChange={e => setShownUpcomingRooms(e.detail.checked)}/>
          </IonItem>
        </IonItemGroup>
      )}/>

      <IonGrid>
        <IonRow>
          <IonCol
            sizeXs="12"
            sizeSm="12"
            sizeMd="12"
            sizeLg={showUpcomingRooms ? '6' : '12'}
            sizeXl={showUpcomingRooms ? '6' : '12'}
            hidden={!showLiveRooms}
            className="live-rooms">
            <RoomHeader title="liveRoom.header"/>
            <IonContent>
              <IonRow>
                {
                  liveRooms.length === 0 ?
                    <NotingFound/>
                    :
                    liveRooms.map(room => <LiveRoom isHome={false} key={room.id} room={room}/>)
                }
              </IonRow>
            </IonContent>
          </IonCol>
          <IonCol
            sizeXs="12"
            sizeSm="12"
            sizeMd="12"
            sizeLg={showLiveRooms ? '6' : '12'}
            sizeXl={showLiveRooms ? '6' : '12'}
            hidden={!showUpcomingRooms}
            className="upcoming-rooms">
            <RoomHeader title="upcomingRoom.header"/>
            <IonContent>
              {
                upcomingRooms.length === 0 ?
                  <NotingFound/>
                  :
                  upcomingRooms.map(room => <UpcomingRoom key={room.id} room={room}/>)
              }
            </IonContent>
          </IonCol>
        </IonRow>
      </IonGrid>
    </Layout>
  );
};

export default RoomsPage;
