import React, {FC, useCallback, useEffect, useRef} from 'react';
import './styles.scss';
import Layout from '../../components/Layout';
import FilterToolbar from '../../components/FilterToolbar';
import {StreamService} from '../../services/StreamService';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import NotingFound from '../Home/NotingFound';
import Stream from '../Home/Stream';
import {IonContent} from '@ionic/react';
import {parseStreamSnapshots} from '../../shared/helpers';
import {UserManagementService} from '../../services';
import {setFavoriteStreams} from '../../redux/actions/streamActions';
import AddRecordedVod from '../VoD/AddRecordedRoom';

const STREAMS_PER_PAGE = 100;

const FavoritesPage: FC = () => {
  const dispatch = useDispatch();
  const {favoriteStreams} = useSelector(({stream}: ReduxSelectors) => stream);
  const {filterParams} = useSelector(({homeFilter}: ReduxSelectors) => homeFilter);
  const page = useRef<number>(0);
  const stopLoad = useRef<boolean>(false);

  const loadStreams = useCallback(async () => {
    const {data: {data}} = await StreamService.getSharedStreams(`limit=${STREAMS_PER_PAGE}&start=${page.current * STREAMS_PER_PAGE}&snapshots=1&${filterParams}`);
    stopLoad.current = data.length < STREAMS_PER_PAGE;
    return parseStreamSnapshots(data);
  }, [filterParams]);

  useEffect(() => {
    UserManagementService.getUserFavorites(filterParams)
      .then(({data: {favorite_streams}}) => {
        dispatch(setFavoriteStreams(favorite_streams));
      });
  }, [loadStreams, filterParams, dispatch]);

  return (
    <Layout className="favorites-page">
      <FilterToolbar title="home.favorites"/>
      <IonContent className="content">
        {
          favoriteStreams.length === 0 ?
            <NotingFound/>
            :
            favoriteStreams.map(stream => <Stream stream={stream}/>)
        }
      </IonContent>
      <AddRecordedVod/>
    </Layout>
  );
};

export default FavoritesPage;
