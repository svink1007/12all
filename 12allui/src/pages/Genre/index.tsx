import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";
import Layout from "../../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/shared/types";
import NotingFound from "../Home/NotingFound";
import Stream from "../Home/Stream";
import HeaderToolbar from "../Home/HeaderToolbar";
import LiveRoom from "../../components/LiveRoom";
import {
  IonButton,
  IonButtons,
  IonCol, IonContent,
  IonGrid,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLabel,
  IonList,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonViewWillLeave,
} from "@ionic/react";
import { RouteComponentProps, useLocation } from "react-router";
import useRoomsSocket from "../../hooks/useRoomsSocket";
import { SwiperSlide } from "swiper/react";
import { setHomeFilter } from "../../redux/actions/homeFilterActions";
import { StreamService } from "../../services/StreamService";
import {parseStreamSnapshots, splitLabel} from "../../shared/helpers";
import { Routes } from "../../shared/routes";
import { SharedStreamVlrs } from "../../shared/types";
import { arrowBack } from "ionicons/icons";
import useStreamsSocket from "../../hooks/useStreamsSocket";
import SelectLanguage from "../../components/SelectLanguage";
import SelectGenre from "../../components/SelectGenre";
import SelectCountry from "../../components/SelectCountry";
import { useTranslation } from "react-i18next";
import SelectOwner from "../../components/SelectOwner";
import { abort } from "process";
import { VodService } from "src/services/VodService";
import { VodState } from "src/redux/reducers/vodReducers";
import VodRoom from "src/components/VodRoom";
import { set } from "react-hook-form";

const STREAMS_PER_PAGE = 100;

const GenrePage: FC<RouteComponentProps> = () => {
  const router = useIonRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  // eslint-disable-next-line
  const { liveRooms, upcomingRooms } = useRoomsSocket();
  // const { streams } = useSelector(({ streamRow }: ReduxSelectors) => streamRow);
  const { filterParams } = useSelector(
    ({ homeFilter }: ReduxSelectors) => homeFilter
  );
  const page = useRef<number>(0);
  const stopLoad = useRef<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingVoD, setLoadingVoD] = useState<boolean>(true);
  const [filteredStreams, setFilteredStreams] = useState<SharedStreamVlrs[]>(
    []
  );
  const [filteredVods, setFilteredVods] = useState<VodState[]>([]);
  const {language, genre, country, owner} = useSelector(({homeFilter}: ReduxSelectors) => homeFilter);
  const [openLanguageModal, setOpenLanguageModal] = useState<boolean>(false);
  const [openGenreModal, setOpenGenreModal] = useState<boolean>(false);
  const [openCountryModal, setOpenCountryModal] = useState<boolean>(false);

  const handleFilterChange = (value: { [language: string]: string | null }) => {
    setLoading(true);
    setLoadingVoD(true);
    dispatch(setHomeFilter(value));
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  const abortVodControllerRef = useRef<AbortController | null>(null);

  const loadStreams = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal: AbortSignal = abortControllerRef.current.signal;
    try {
      let queryString = filterParams;
      const ownerParam = filterParams.split("&").find(p => p.startsWith('owner='));
      if (ownerParam) {
        const fullOwnerValue = ownerParam.split('=')[1]; // e.g., "1-Owner-of"
        const ownerPrefix = splitLabel(fullOwnerValue).prefix;  // e.g., "1"
        queryString = queryString.replace(ownerParam, `owner=${ownerPrefix}`);
      }
      const {
        data: { data },
      } = await StreamService.getSharedStreams(
        `limit=${STREAMS_PER_PAGE}&start=${
          page.current * STREAMS_PER_PAGE
        // }&snapshots=1&${filterParams}`, signal
        }&snapshots=1&${queryString}`, signal
      );
      stopLoad.current = data.length < STREAMS_PER_PAGE;
      if (data) {
        setLoading(false);
      }
      return parseStreamSnapshots(data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("Request aborted");
        } else {
          console.error("Fetch error:", error.message);
        }
      } else {
        console.error("Unexpected error", error);
      }
      return [];
    }
  }, [filterParams]);

  const loadVods=useCallback(async()=>{
    if (abortVodControllerRef.current) {
      abortVodControllerRef.current.abort();
    }
    abortVodControllerRef.current = new AbortController();
    const signal: AbortSignal = abortVodControllerRef.current.signal;
    try {
      let queryString = filterParams;
      const ownerParam = filterParams.split("&").find(p => p.startsWith('owner='));
      if (ownerParam) {
        const fullOwnerValue = ownerParam.split('=')[1]; // e.g., "1-Owner-of"
        const ownerPrefix = splitLabel(fullOwnerValue).prefix;  // e.g., "1"
        queryString=  `partnerId=${ownerPrefix}`;// we replace because actually we have implemented only this filter for vods, it will be updated later
      }else{
        return [];
      }
      const { data: vods } = await VodService.getFilteredVoD(
        `${queryString}`, signal
      );
      if (vods) {
        setLoadingVoD(false);
      }
      return vods;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("Request aborted");
        } else {
          console.error("Fetch error:", error.message);
        }
      } else {
        console.error("Unexpected error", error);
      }
      return [];
    }
  }, [filterParams]);

  useStreamsSocket(loadStreams);


  useEffect(() => {
    page.current = 0;
    loadStreams().then((streams) => setFilteredStreams(streams));
    loadVods().then((vods)=>setFilteredVods(vods));
  }, [loadStreams, filterParams, loadVods]);

  useEffect(() => {
    const cleanStr = location.search.substring(1);

    // Split the string into key-value pairs
    const pairs = cleanStr.split("&");

    // Convert the pairs into an object
    const result: { [key: string]: string } = {};
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key === "country_of_origin") {
        result["country"] = decodeURIComponent(value);
      } else {
        result[key] = value;
      }
    });
    setLoading(true);
    dispatch(setHomeFilter(result));
  }, [location.search, dispatch]);

  useIonViewWillLeave(() => {
    if (["/home"].includes(router.routeInfo.pathname)) {
      dispatch(setHomeFilter({ genre: "", language: "", country: "", owner: "" }));
      setFilteredStreams([]);
    }

    if (
      !["login", "stream"].includes(router.routeInfo.pathname.split("/")[1]) &&
      ["/home"].includes(router.routeInfo.pathname)
    ) {
      setTimeout(() => {
        router.push(Routes.Home);
      }, 500);
    }
  }, [router]);

  const [openOwnerModal, setOpenOwnerModal] = useState<boolean>(false);

  const handleLoadMore = (e: any) => {
    if (stopLoad.current) {
      e.target.complete();
      return;
    }
    page.current = page.current + 1;

    loadStreams().then((additionalStreams) => {
      setFilteredStreams([...filteredStreams, ...additionalStreams]);
      e.target.complete();
    });
  };

  return (
    <Layout className="genre-page">
      <IonContent fullscreen>
        <IonGrid className="actions">
          <IonRow>
            <IonCol
              sizeXs="12"
              sizeSm="12"
              sizeMd="12"
              sizeLg="6"
              sizeXl="6"
              className="genre-navbar-right"
            >
              <IonToolbar color="light">
                <IonButtons slot="start">
                  <IonButton
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(
                        setHomeFilter({ genre: "", language: "", country: "", owner: "" })
                      );
                      setFilteredStreams([]);
                      router.push(Routes.Home);
                    }}
                  >
                    <IonIcon icon={arrowBack} slot="icon-only" />
                  </IonButton>
                </IonButtons>
                <IonTitle style={{ padding: "0px" }}>HOME</IonTitle>
              </IonToolbar>

              <>
                <IonButtons className="home-filter">
                  <IonButton onClick={() => setOpenLanguageModal(true)}>
                    <IonLabel>
                      {t("home.language")}
                      {language && ` (${language})`}
                    </IonLabel>
                  </IonButton>
                  <IonButton onClick={() => setOpenOwnerModal(true)}>
                    <IonLabel>
                      {t("home.owner")}
                      {owner && ` (${splitLabel(owner).label})`}
                    </IonLabel>
                  </IonButton>
                  <IonButton onClick={() => setOpenGenreModal(true)}>
                    <IonLabel>
                      {t("home.genre")}
                      {genre && ` (${genre})`}
                    </IonLabel>
                  </IonButton>
                  <IonButton onClick={() => setOpenCountryModal(true)}>
                    <IonLabel>
                      {t("home.country")}
                      {country && ` (${country})`}
                    </IonLabel>
                  </IonButton>
                </IonButtons>
                <SelectOwner
                    owner={owner}
                    open={openOwnerModal}
                    onSelect={(owner) => handleFilterChange({owner})}
                    onClose={() => setOpenOwnerModal(false)}
                />
                <SelectLanguage
                  language={language}
                  open={openLanguageModal}
                  onSelect={(language) => handleFilterChange({ language })}
                  onClose={() => setOpenLanguageModal(false)}
                />
                <SelectGenre
                  genre={genre}
                  open={openGenreModal}
                  onSelect={(genre) => handleFilterChange({ genre })}
                  onClose={() => setOpenGenreModal(false)}
                />
                <SelectCountry
                  country={country}
                  open={openCountryModal}
                  onSelect={(country) => handleFilterChange({ country })}
                  onClose={() => setOpenCountryModal(false)}
                />
              </>
            </IonCol>
          </IonRow>
        </IonGrid>

        {
          // loading ? <IonSpinner /> :

          liveRooms.length > 0 && (
            <>
              <HeaderToolbar title="home.rooms" />
              <IonList className="streams">
                {liveRooms.length === 0 ? (
                  <NotingFound />
                ) : (
                  liveRooms?.map((room) => {
                    return (
                      <SwiperSlide key={`${room.id}_live`}>
                        <LiveRoom isHome={false} room={room} />
                      </SwiperSlide>
                    );
                  })
                )}
              </IonList>
            </>
          )
        }


        <HeaderToolbar title="search.channels" isGenreChannel={true} />
        {loading ? (
            <IonSpinner />
        ) : (
            <>
              {filteredStreams.length > 0 ? (
                  <IonList className="streams">
                    {filteredStreams.map((stream) => (
                        <Stream
                            key={stream.id}
                            stream={stream}
                            redirectFrom="GENRE"
                        />
                    ))}
                    <IonInfiniteScroll onIonInfinite={handleLoadMore}>
                      <IonInfiniteScrollContent />
                    </IonInfiniteScroll>
                  </IonList>
              ) : (
                  <NotingFound />
              )}
            </>
        )}

        {filterParams.includes('owner') && 
        (<>
          <HeaderToolbar title="home.vod" isGenreChannel={true} />
          {loadingVoD ? (
            <IonSpinner />
          ) : (
              <>
                {filteredVods.length > 0 ? (
                    <IonList className="streams">
                      {filteredVods.map((vod) => (
                          <VodRoom
                              key={vod.id}
                              vod={vod}
                              redirectFrom="GENRE"
                          />
                      ))}
                      
                      <IonInfiniteScroll onIonInfinite={handleLoadMore}>
                        <IonInfiniteScrollContent />
                      </IonInfiniteScroll>
                    </IonList>
                ) : (
                    <NotingFound />
                )}
              </>
          )}
        </>)
        }
      <div className=" mb-12 "></div>

      </IonContent>
    </Layout>
  );
};

export default GenrePage;
