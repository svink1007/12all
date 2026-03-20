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
import {parseStreamSnapshots} from '../../shared/helpers';
import {setSearch} from '../../redux/actions/searchActions';
import {SearchType} from '../../redux/shared/enums';
import useStreamsSocket from '../../hooks/useStreamsSocket';
import {setStreams} from '../../redux/actions/streamActions';
import { setHomeFilter } from '../../redux/actions/homeFilterActions';
import {VodService} from "../../services/VodService";
import {findVods} from "../../redux/actions/vodActions";
import VodSlide from "../../components/VodRoom";
import AddRecordedVod from '../VoD/AddRecordedRoom';
import VodRoom from "../../components/VodRoom";

const STREAMS_PER_PAGE = 100;

const ChannelsPage: FC = () => {
  const dispatch = useDispatch();
  const {searchVODs} = useSelector(({vod}: ReduxSelectors) => vod);
  const {query} = useSelector(({search}: ReduxSelectors) => search);
  const {filterParams} = useSelector(({homeFilter}: ReduxSelectors) => homeFilter);
  const { currentStreamRoute } = useSelector(({ stream }: ReduxSelectors) => stream)
  const page = useRef<number>(0);
  const stopLoad = useRef<boolean>(false);

  const loadVideoDemand = useCallback(async () => {
    const { data } = await VodService.getAllVod(null);
    stopLoad.current = data.length < STREAMS_PER_PAGE;
    return data;
  }, [filterParams]);

  useEffect(() => {
    page.current = 0;
    loadVideoDemand().then((vod) => dispatch(findVods(vod)));
  }, [loadVideoDemand, dispatch]);

  useIonViewWillEnter(() => {
    dispatch(setSearch({type: SearchType.Vod}));
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
    loadVideoDemand().then((additionalStreams) => {
      dispatch(findVods([...searchVODs, ...additionalStreams]));
      e.target.complete();
    });
  };

  return (
    <Layout className="vods-page">
      <FilterToolbar title="home.vods"/>
      <IonContent className="infinity-content">
        {
          searchVODs.length === 0 ?
            <NotingFound/>
            :
            searchVODs.filter(vod=>vod.url.trim().length>2).map(vod => <VodRoom key={vod.id} vod={vod} redirectFrom="VOD_ROW" />)
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
