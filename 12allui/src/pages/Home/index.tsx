import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import './styles.scss';
import { IonButton, IonButtons, IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonRow, useIonViewWillEnter } from '@ionic/react';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { RouteComponentProps, useHistory } from 'react-router';
import NewsRow from './NewsRow';
import { useTranslation } from 'react-i18next';
import {
  addOutline,
  globeOutline,
  gridOutline,
  heartOutline,
  playBackOutline, playOutline,
  playSkipForwardOutline,
  tvOutline
} from 'ionicons/icons';
import { Routes } from '../../shared/routes';
import FavoritesRow, { FAVORITES_ROW_ID } from './FavoritesRow';
import RoomsRow, { ROOMS_ROW_ID } from './RoomsRow';
import ChannelsRow, { CHANNELS_ROW_ID } from './ChannelsRow';
import SharedSitesRow, { SHARED_SITES_ROW_ID } from './SharedSitesRow';
import HomeFilter from './HomeFilter';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from '../../redux/shared/types';
import { ChannelsService } from '../../services/ChannelsService';
import { setChannels } from '../../redux/actions/channelActions';
import arrowIcon from "../../images/icons/arrow-icon.svg"
import PopoverComponent from '../../components/PopOver';
import { getSnapshotOnInterval, updateStarsBalance } from '../../shared/helpers';
import { setFavoriteStreams } from '../../redux/actions/streamActions';
import {
  SharedStream,
  SharedStreamVlrs
} from '../../shared/types';
import { setStreamsRow } from '../../redux/actions/streamRowActions';
import { setHomeFilter } from '../../redux/actions/homeFilterActions';
import BillingPopup from '../../components/Billing/BillingCommonPopup';
import { setDailyVisitReward, setEnableRewardPopup, setTotalStarBalance } from '../../redux/actions/billingRewardActions';
import { BillingServices } from '../../services';
import BillingNotifyPopup from '../../components/Billing/BillingNotifyPopup';
import VodsRow, {VODS_ROW_ID} from "../../pages/Home/VodsRow";
import { VodRedux } from 'src/redux/reducers/vodReducers';
import AddRecordedVod from '../VoD/AddRecordedRoom';

// import GdprConsent from '../../components/GdprConsent';
// import ChannelsRowNew from './ChannelsRow/newIndex';

const Home: FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory()
  // const { liveRooms } = useRoomsSocket();
  const { jwt, isAnonymous, id } = useSelector(({ profile }: ReduxSelectors) => profile);
  const { filterParams } = useSelector(({ homeFilter }: ReduxSelectors) => homeFilter);


  
  // const { streams } = useSelector(({ stream }: ReduxSelectors) => stream);
  const streamsRow = useSelector(({ streamRow }: ReduxSelectors) => streamRow);
  const { favoriteStreams } = useSelector(({ stream }: ReduxSelectors) => stream);
  const billingRewards = useSelector(({ billingRewards }: ReduxSelectors) => billingRewards)
  const contentRef = useRef<HTMLIonGridElement>(null);
  const [hasFavorites, setHasFavorites] = useState<boolean>(false);
  const [hasRooms, setHasRooms] = useState<boolean>(false);
  const [hasStreams, setHasStreams] = useState<boolean>(false);
  const [showPopover, setShowPopover] = useState<boolean>(false);
  // billing:
  const [showRewardPopup, setShowRewardPopup] = useState<boolean>(false)
  const [isDailyVisitAfterRegis, setIsDailyVisitAfterRegis] = useState<boolean>(false)

  const targetRef = useRef<HTMLDivElement>(null);
  const inLoadingProcess = useRef({ channels: false });
  const page = useRef<number>(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const handleScrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPartyChannels = () => {
    const urlFilters = `limit=${12}&start=${page.current * 12}${filterParams ? '&' + filterParams : ''}`;
    if (inLoadingProcess.current.channels) {
      return;
    }

    inLoadingProcess.current.channels = true;
    ChannelsService.getVlrs(urlFilters)
      .then(({ data: { data, pages } }) => {
        dispatch(setChannels(data));
      })
      .finally(() => {
        inLoadingProcess.current.channels = false;
      });
    setShowPopover(false)
  };

  const openPopover = (event: React.MouseEvent<HTMLIonButtonElement>) => {
    setShowPopover(true)
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (targetRef.current && !targetRef.current.contains(event.target as Node)) {
      showPopover && targetRef.current?.click();
      setShowPopover(false)
    }
  }, [showPopover])

  const handleRoomRoute = () => {
    if (isAnonymous || !jwt) {
      // billing:
      dispatch(setEnableRewardPopup({ openRoomAnon: true }))
      return

      // billing: comment below line
      // return history.push(Routes.Login, { from: "anonymousCreateRoom" })
    } else {
      return history.push(Routes.WatchPartyStart1)
    }
  }

  useIonViewWillEnter(() => {
    dispatch(setHomeFilter({ genre: "", language: "", country: "" }))
  }, [])

  // Live room snapshot update

  // const updatedLiveRoomSnapshotFunc = useCallback((getSnapshot: SharedStreamVlrs[]) => {
  //   const getLiveRoomSnapshot = liveRooms?.map((channel: Vlr) => {
  //     const matchingSnapshot = getSnapshot.find((streamChannel: SharedStreamVlrs) =>
  //       (channel?.channel?.stream_id === streamChannel.id) && channel.channel.logo !== streamChannel.snapshot)

  //     if (matchingSnapshot?.snapshot) {
  //       return { ...channel, channel: { ...channel.channel, logo: matchingSnapshot.snapshot } }
  //     }
  //     return channel
  //   })
  //   return getLiveRoomSnapshot
  // }, [liveRooms])

  const updateFavoriteSnapshot = useCallback((getSnapshot: SharedStreamVlrs[]) => {
    const getFavSnapshot = favoriteStreams.map((channel: SharedStream) => {
      const matchingSnapshot = getSnapshot.find((streamsChannel: SharedStreamVlrs) => channel.id === streamsChannel.id && channel.snapshot !== streamsChannel.snapshot)
      if (matchingSnapshot?.snapshot) {
        return { ...channel, snapshot: matchingSnapshot.snapshot };
      }
      return channel
    })
    return getFavSnapshot
  }, [favoriteStreams])

  const callUpdateStreamsSnapshot = useCallback(async (channelsId: number[]) => {
    const getSnapshot = await getSnapshotOnInterval(channelsId, streamsRow?.streams)
    if (getSnapshot?.length > 0) {
      if (streamsRow?.streams?.length > 0) {
        dispatch(setStreamsRow(getSnapshot))
        // dispatch(setStreams(getSnapshot));
      }
      if (favoriteStreams?.length > 0) {
        const getUpdatedFavoriteStreams = updateFavoriteSnapshot(getSnapshot)
        if (getUpdatedFavoriteStreams?.length > 0) {
          dispatch(setFavoriteStreams(getUpdatedFavoriteStreams))
        }
      }
      // if (liveRooms?.length > 0) {
      //   const getUpdatedLiveRoomSnapshot = updatedLiveRoomSnapshotFunc(getSnapshot)
      //   setUpdatedLiveRoomSnapshot(getUpdatedLiveRoomSnapshot)
      // }

    }
  }, [dispatch, favoriteStreams, streamsRow, updateFavoriteSnapshot])

  useEffect(() => {
    document.addEventListener("mousedown", (event: MouseEvent) => handleClickOutside(event));
    return () => {
      document.removeEventListener("mousedown", (event: MouseEvent) => handleClickOutside(event));
    };
  }, [handleClickOutside]);

  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      if (streamsRow?.streams?.length > 0 && history.location?.pathname === "/home") {
        const channelsId = streamsRow.streams.map(channels => channels.id)
        callUpdateStreamsSnapshot(channelsId)
      }
      // if (streams?.length > 0 && history.location?.pathname === "/home") {
      //   const channelsId = streams.map(channels => channels.id)
      //   callUpdateStreamsSnapshot(channelsId)
      // }
    }, 5000)

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [streamsRow, callUpdateStreamsSnapshot, history, favoriteStreams])

  // Stop listening snapshot api on route changes when the component unmounts.
  useEffect(() => {
    const unlisten = history.listen(() => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
    );

    return () => {
      unlisten();
    };
  }, [history, intervalIdRef]);

  // useEffect(() => {
  //   // // console.log("prevKeyRef", prevKeyRef.current)
  //   // if (prevKeyRef.current !== null && prevKeyRef.current !== history.location.key) {
  //   //   // console.log('Location has changed');
  //   // }
  //   // prevKeyRef.current = history.location.key || null;

  //   if (currLocationKey === history.location.key && prevKeyRef.current !== null && prevKeyRef.current === history.location.key) {
  //     window.location.reload()
  //   }

  //   console.log("currLocationKey", currLocationKey)
  // }, [history.location.key]);

  // console.log("history", history.location)


  // billing:
  const callDaiyVisitAward = useCallback(() => {
    const currClientDate = new Date().toJSON();
    const eventType = "site.opened"

    if (!isAnonymous && jwt) {
      BillingServices.billingEvent(currClientDate, id, eventType).then(async ({ data: { result } }) => {
        dispatch(setDailyVisitReward(result))
        if (result.billingReward.creditedStars) {
          const starsBalance = await updateStarsBalance(id)
          dispatch(setTotalStarBalance(starsBalance))
          setTimeout(() => {
            dispatch(setEnableRewardPopup({ dailyVisitReward: true }))
          }, 2000);
          setIsDailyVisitAfterRegis(false)
        }
      })
    }
  }, [id, dispatch, jwt, isAnonymous])

  const closeRewardModal = useCallback(() => {
    const { signupReward, dailyVisitReward, firstFavoriteAward, openChannelDirectStream, openPaidStreamAnon } = billingRewards.enablePopup
    if (signupReward || dailyVisitReward ||
      firstFavoriteAward || openChannelDirectStream ||
      openPaidStreamAnon
    ) {
      if (isMounted.current) {
        setTimeout(function () {
          dispatch(setEnableRewardPopup({
            signupReward: false,
            dailyVisitReward: false,
            firstFavoriteAward: false,
            openChannelDirectStream: false
          }))
        }, 100)
      }
      setTimeout(() => {
        setShowRewardPopup(false)
        if (!isDailyVisitAfterRegis) {
          setIsDailyVisitAfterRegis(true)
          callDaiyVisitAward()
        }
      }, 2000);
    }
  }, [billingRewards.enablePopup, isDailyVisitAfterRegis, dispatch, callDaiyVisitAward])

  const closeNotifyModal = useCallback(() => {
    const { openPaidStreamAnon, openRoomAnon } = billingRewards.enablePopup
    if (openPaidStreamAnon || openRoomAnon) {
      dispatch(setEnableRewardPopup({ openPaidStreamAnon: false, openRoomAnon: false }))
      setShowRewardPopup(false)
    }
  }, [billingRewards.enablePopup, dispatch])

  useEffect(() => {
    const anyRewardEnabled = Object.values(billingRewards.enablePopup).some(reward => reward);
    setShowRewardPopup(anyRewardEnabled);
  }, [billingRewards]);

  // for test
  // useEffect(() => {
    // const currClientDate = "2025-05-16T12:49:10.928Z";
    // const eventType = "site.opened"
    // BillingServices.billingEvent(currClientDate, id, eventType).then(async ({ data: { result } }) => {
    //   dispatch(setDailyVisitReward(result))
    // })
    // console.log("Test Reward Popup")
    // dispatch(setDailyVisitReward(
    //     {
    //       enablePopup: {
    //         dailyVisitReward: true
    //       },
    //       responseDate: "2025-05-15T12:49:10.928Z",
    //       billingReward: {
    //         externalClientId: 23886,
    //         creditedStars: 500
    //       },
    //       billingResponse: {
    //         message: "ok",
    //         code: "200"
    //       },
    //       status: "ok",
    //       starsBalance: 700,
    //       channelCostDescription:  {
    //         channelCost: "400",
    //         streamId: 12344
    //       },
    //       billingTimeEvents: [],
    //       subscriptionTypes: []
    //     }
    // ))
    // dispatch(setEnableRewardPopup( {isFirstAvatarUploaded: true}))
  // }, [dispatch, billingRewards])

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <>
      <div className={`${jwt ? 'popover-div' : ''}`}>
        <PopoverComponent
          showPopover={showPopover}
          targetRef={targetRef}
          loadPartyChannels={loadPartyChannels}
        />
      </div>
      {/* {showGdpr && <GdprConsent setShowGdpr={setShowGdpr}/>} */}
      <Layout className="home-page">
        <a href="https://sites.google.com/view/bitcoincasinos/bitcoin-roulette" hidden>Btc roulette</a>
        <IonGrid className="actions">
          <IonRow >
            <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="12" sizeXl="5" className="home-navbar-left">
              <IonButtons className="nav-buttons">
                {
                  jwt && !isAnonymous &&
                  <IonButton
                    disabled={!hasFavorites && !filterParams}
                    onClick={() => handleScrollToSection(FAVORITES_ROW_ID)}>
                    <IonIcon icon={heartOutline} slot="start" />
                    <IonLabel>{t('home.favorites')}</IonLabel>
                  </IonButton>
                }
                <IonButton
                  disabled={!hasRooms && !filterParams}
                  onClick={() => handleScrollToSection(ROOMS_ROW_ID)}>
                  <IonIcon icon={gridOutline} slot="start" />
                  <IonLabel>{t('home.rooms')}</IonLabel>
                </IonButton>
                <IonButton
                  disabled={!hasStreams && !filterParams}
                  onClick={() => handleScrollToSection(CHANNELS_ROW_ID)}>
                  <IonIcon icon={tvOutline} slot="start" />
                  <IonLabel>{t('home.channels')}</IonLabel>
                </IonButton>
                <IonButton onClick={() => handleScrollToSection(SHARED_SITES_ROW_ID)}>
                  <IonIcon icon={globeOutline} slot="start" />
                  <IonLabel>{t('home.sharedSites')}</IonLabel>
                </IonButton>
                <IonButton onClick={() => handleScrollToSection(VODS_ROW_ID)}>
                  <IonIcon icon={playOutline} slot="start" />
                  <IonLabel>{t('home.vod')}</IonLabel>
                </IonButton>
              </IonButtons>
            </IonCol>
            <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="12" sizeXl="7" className="home-navbar-right">
              <HomeFilter />

              <IonItem
                  onClick={(e: any) => openPopover(e)}
                  // routerLink={isAnonymous ? Routes.Login : Routes.WatchPartyStart1}
                  lines="none"
                  color="light"
                  className="join-room ms-5 cursor-pointer ">
                <div className="join-room-icon pt-1.5">
                  <IonIcon className='arrow-icon' icon={arrowIcon} slot="start" size={"large"} />
                </div>
                <IonLabel className={'ps-3.5'}>{t('home.joinTheParty')}</IonLabel>
              </IonItem>

              <IonItem
                  onClick={() => handleRoomRoute()}
                  // routerLink={isAnonymous ? Routes.Login : Routes.WatchPartyStart1}
                  lines="none"
                  color="light"
                  className="create-room">
                <div className="create-room-icon pt-1.5">
                  <IonIcon icon={addOutline} size="large" />
                </div>
                <IonLabel className={'ps-3.5'}>{t('home.createRoom')}</IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid ref={contentRef} className="content">
          <NewsRow />
          <RoomsRow onHasRooms={setHasRooms} onHasFavourites={setHasFavorites} />
          <ChannelsRow onHasChannels={setHasStreams} />
          <VodsRow onHasRooms={setHasRooms} />
          <SharedSitesRow />
        </IonGrid>
      </Layout>

      {/* billing: */}
      {/*{showRewardPopup && (isAnonymous || !jwt) && <BillingNotifyPopup closeNotifyModal={closeNotifyModal} />}*/}
      {/*{showRewardPopup && jwt && !isAnonymous && <BillingPopup closeRewardModal={closeRewardModal} />}*/}

      {showRewardPopup && (
          <>
            {(isAnonymous || !jwt) ? (
                <BillingNotifyPopup key="anon-popup" closeNotifyModal={closeNotifyModal} />
            ) : (
                <BillingPopup key="auth-popup" closeRewardModal={closeRewardModal} />
            )}
          </>
      )}

      
      <AddRecordedVod/>
    
    </>
  );
};

export default Home;
