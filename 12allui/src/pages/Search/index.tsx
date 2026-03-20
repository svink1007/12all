import React, { FC, useEffect, useState } from 'react';
import './styles.scss';
import Layout from '../../components/Layout';
import { SearchService } from '../../services';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from '../../redux/shared/types';
import NotingFound from '../Home/NotingFound';
import Stream from '../Home/Stream';
import { SharedStreamVlrs, Vlr, VlrUpcoming } from '../../shared/types';
import HeaderToolbar from '../Home/HeaderToolbar';
import UpcomingRoom from '../../components/UpcomingRoom';
import LiveRoom from '../../components/LiveRoom';
import { IonList, IonSpinner } from '@ionic/react';
import { setStreams } from '../../redux/actions/streamActions';
import { RouteComponentProps, useHistory } from 'react-router';
import { StreamService } from '../../services/StreamService';
import { parseStreamSnapshots } from '../../shared/helpers';
import {VodState} from "../../redux/reducers/vodReducers";
import {VodService} from "../../services/VodService";
import VodRoom from "../../components/VodRoom";

const SearchEmptyStream: FC<{ streams: SharedStreamVlrs[], isSearchEmpty: boolean }> = ({ streams, isSearchEmpty }) => {
  const history = useHistory()

  return (
    <div className='search-empty-stream'>
      {
        streams?.length > 0 && isSearchEmpty &&
        <>
          <HeaderToolbar title="search.channels" />
          <IonList className="streams">
            {streams.map(stream => <Stream key={stream.id} stream={stream} />)}
          </IonList>
        </>
      }
      <div className='see-all-channels' onClick={() => history.push("/channels")}>
        See all channels
      </div>
    </div>
  );
}

const Streams: FC<{ streams: SharedStreamVlrs[] }> = ({ streams }) => (
  <>
    {
      streams.length > 0 &&
      <>
        <HeaderToolbar title="search.channels" />
        <IonList className="streams">
          {streams.map(stream => <Stream key={stream.id} stream={stream} />)}
        </IonList>
      </>
    }
  </>
);

const Live: FC<{ live: Vlr[] }> = ({ live }) => (
  <>
    {
      live.length > 0 &&
      <>
        <HeaderToolbar title="search.live" />
        <IonList className="live">
          {live.map(room => <LiveRoom isHome={false} key={room.id} room={room} />)}
        </IonList>
      </>
    }
  </>
);

const Vod: FC<{ vod: VodState[] }> = ({ vod }) => (
    <>
      {
          vod.length > 0 &&
          <>
            <HeaderToolbar title="home.vods" />
            <IonList className="live">
              {vod.map(v => <VodRoom key={v.id} vod={v} />)}
            </IonList>
          </>
      }
    </>
);

const Upcoming: FC<{ upcoming: VlrUpcoming[] }> = ({ upcoming }) => (
  <>
    {
      upcoming.length > 0 &&
      <>
        <HeaderToolbar title="search.upcoming" />
        <IonList className="upcoming">
          {upcoming.map(room => <UpcomingRoom key={room.id} room={room} />)}
        </IonList>

      </>
    }
  </>
);

const SearchPage: FC<RouteComponentProps> = () => {
  const history = useHistory()
  const dispatch = useDispatch();
  const { streams } = useSelector(({ stream }: ReduxSelectors) => stream);
  const { type, query } = useSelector(({ search }: ReduxSelectors) => search);
  const [live, setLive] = useState<Vlr[]>([]);
  const [vod, setVod] = useState<VodState[]>([]);
  const [upcoming, setUpcoming] = useState<VlrUpcoming[]>([]);
  const [isSearchEmpty, setIsSearchEmpty] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (isSearchEmpty) {
      StreamService.getSharedStreams(`limit=24&start=0&snapshots=1&`).then(({ data: { data } }) => {
        setLoading(false)
        const getParsedData = parseStreamSnapshots(data);
        dispatch(setStreams(getParsedData))
      }).catch(() => setLoading(false))
    }
  }, [isSearchEmpty, dispatch]);

  useEffect(() => {
    if (history?.location?.pathname !== "/search") {
      setLoading(false)
      setIsSearchEmpty(false)
    }
    else if (query === "") {
      setLoading(true)
      setIsSearchEmpty(true)
    }
    else if (query) {
      setLoading(true)
      setIsSearchEmpty(false)
      if(type === 'vod'){
        VodService.searchVod(query).then(({ data }) => {
          setLoading(false)
          setVod(data)
          dispatch(setStreams([]));
          setLive([]);
          setUpcoming([]);
        }).catch(() => setLoading(false));
      }
      else if(type === 'all'){
        VodService.searchVod(query).then(({ data }) => {
          setLoading(false)
          setVod(data)
        }).catch(() => setLoading(false));
        SearchService.search(type, query).then(({ data: { streams, rooms: { live, upcoming } } }) => {
          setLoading(false)
          dispatch(setStreams(streams));
          setLive(live);
          setUpcoming(upcoming);
        }).catch(() => setLoading(false));
      }
      else{
        SearchService.search(type, query).then(({ data: { streams, rooms: { live, upcoming } } }) => {
          setLoading(false)
          dispatch(setStreams(streams));
          setLive(live);
          setUpcoming(upcoming);
          setVod([])
        }).catch(() => setLoading(false));
      }
    }


    return () => setIsSearchEmpty(false)
  }, [type, query, dispatch, history, setIsSearchEmpty]);

  return (
    <Layout className="search-page">
      {loading ? <IonSpinner /> : streams.length === 0 && live.length === 0 && upcoming.length === 0 && vod.length === 0
        ? <NotingFound />
        : <div style={{ maxHeight: '100vh', overflow: 'auto', paddingBottom: '5rem' }}>
          {
            isSearchEmpty
              ? <SearchEmptyStream streams={streams} isSearchEmpty={isSearchEmpty} />
              : <Streams streams={streams} />
          }
          <Live live={live} />
          <Upcoming upcoming={upcoming} />
          <Vod vod={vod} />
           <div className={"!h-[5rem]"}></div>
        </div>
      }
    </Layout>
  );
};

export default SearchPage;
