import React, {FC, useCallback, useEffect, useRef} from 'react';
import './styles.scss';
import Layout from '../../components/Layout';
import FilterToolbar from '../../components/FilterToolbar';
import {StreamService} from '../../services/StreamService';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import NotingFound from '../Home/NotingFound';
import Stream from '../Home/Stream';
import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonViewWillEnter,
  useIonViewWillLeave
} from '@ionic/react';
import {parseStreamSnapshots, splitLabel} from '../../shared/helpers';
import {setSearch} from '../../redux/actions/searchActions';
import {SearchType} from '../../redux/shared/enums';
import useStreamsSocket from '../../hooks/useStreamsSocket';
import {setStreams} from '../../redux/actions/streamActions';
import { setHomeFilter } from '../../redux/actions/homeFilterActions';
import AddRecordedVod from '../VoD/AddRecordedRoom';

const STREAMS_PER_PAGE = 100;

const ChannelsPage: FC = () => {
  const dispatch = useDispatch();
  const {streams} = useSelector(({stream}: ReduxSelectors) => stream);
  const {query} = useSelector(({search}: ReduxSelectors) => search);
  const {filterParams} = useSelector(({homeFilter}: ReduxSelectors) => homeFilter);
  const { currentStreamRoute } = useSelector(({ stream }: ReduxSelectors) => stream)
  const page = useRef<number>(0);
  const stopLoad = useRef<boolean>(false);

  const loadStreams = useCallback(async () => {
    let queryString = filterParams;
    const ownerParam = filterParams.split("&").find(p => p.startsWith('owner='));
    if (ownerParam) {
      const fullOwnerValue = ownerParam.split('=')[1]; // e.g., "1-Owner-of"
      const ownerPrefix = splitLabel(fullOwnerValue).prefix;  // e.g., "1"
      queryString = queryString.replace(ownerParam, `owner=${ownerPrefix}`);
    }
    const {data: {data}} = await StreamService.getSharedStreams(`limit=${STREAMS_PER_PAGE}&start=${page.current * STREAMS_PER_PAGE}&snapshots=1&${queryString}`);
    stopLoad.current = data.length < STREAMS_PER_PAGE;
    return parseStreamSnapshots(data);
  }, [filterParams]);

  useStreamsSocket(loadStreams);

  useEffect(() => {
    page.current = 0;
    loadStreams().then((streams) => dispatch(setStreams(streams)));
  }, [loadStreams, dispatch]);

  useIonViewWillEnter(() => {
    dispatch(setSearch({type: SearchType.Channel}));
  }, []);

  useIonViewWillLeave(() => {
    if(currentStreamRoute === "FROM_HOME") {
      dispatch(setHomeFilter({ genre: "", language: "", country: "", owner: "" }))
      !query && dispatch(setSearch({type: SearchType.All}));
    }
  }, [query, dispatch]);

  const handleLoadMore = (e: any) => {
    if (stopLoad.current) {
      e.target.complete();
      return;
    }
    page.current = page.current + 1;
    loadStreams().then((additionalStreams) => {
      dispatch(setStreams([...streams, ...additionalStreams]));
      e.target.complete();
    });
  };

  return (
    <Layout className="channels-page">
      <FilterToolbar title="home.channels"/>
      <IonContent className="infinity-content">
        {
          streams.length === 0 ?
            <NotingFound/>
            :
            streams.map(stream => <Stream key={stream.id} stream={stream} redirectFrom="CHANNELS_ROW" />)
        }
        <IonInfiniteScroll onIonInfinite={handleLoadMore}>
          <IonInfiniteScrollContent/>
        </IonInfiniteScroll>
      </IonContent>
      <AddRecordedVod/>
    </Layout>
  );
};

export default ChannelsPage;
