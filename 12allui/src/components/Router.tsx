import {FC, useEffect, useState} from 'react';
import AxiosInterceptor from './AxiosInterceptor';
import Header from './Header';
import {IonRouterOutlet} from '@ionic/react';
import {Redirect, Route} from 'react-router-dom';
import {Routes} from '../shared/routes';
import Home from '../pages/Home';
import About from '../pages/About';
import DownloadsPage from '../pages/Downloads';
import News from '../pages/News';
import Support from '../pages/Support';
// import Login from '../pages/Login_v2';
// import Login from '../pages/Login';
import Login from '../pages/Login_v3';
import Signup from '../pages/SignUp';
import NotificationsPage from '../pages/Notifications';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Terms from '../pages/Terms';
import HowToDeleteYourData from '../pages/HowToDeleteYourData';
import MyProfile from '../pages/MyProfile/indexNew';
import ChannelBroadcast from '../pages/ChannelBroadcast';
import Article from '../pages/Article';
import Career from '../pages/Career';
import SharedStreamPage from '../pages/SharedStream';
import SharedStreamTvPage from '../pages/SharedStream/tvStream';
import Footer from './Footer';
import {IonReactRouter} from '@ionic/react-router';
import appStorage, {StorageKey} from '../shared/appStorage';
import {useDispatch, useSelector} from 'react-redux';
import {Profile, ReduxSelectors} from '../redux/shared/types';
import {setLogin} from '../redux/actions/profileActions';
import RoomPage from '../pages/Room';
import {RouteComponentProps, useHistory, useLocation} from 'react-router';
import DownloadApp, {showDownloadApp} from './DownloadApp';
import StreamTestPage from '../pages/StreamTest';
import LocationState from '../models/LocationState';
import {BillingServices, UserManagementService} from '../services';
import ResetPasswordPage from '../pages/ResetPassword';
import BaseService from '../services/BaseService';
import WatchPartyJoinMediator from '../pages/WatchParty/Join/WatchPartyJoinMediator';
import {setInfoToast} from '../redux/actions/toastActions';
import WatchPartyJoinHome from '../pages/WatchParty/Join/JoinHome';
import WatchPartyJoin from '../pages/WatchParty/Join';
import WatchPartyStart from '../pages/WatchParty/Start';
import ChannelsPage from '../pages/Channels';
import FavoritesPage from '../pages/Favorites';
import RoomsPage from '../pages/Rooms';
import SearchPage from '../pages/Search';
import GenrePage from '../pages/Genre';
import { setBillingTimeEvents, setDailyVisitReward, setEnableRewardPopup, setTotalStarBalance } from '../redux/actions/billingRewardActions';
import Premium from '../pages/Premium';
import Stars from '../pages/Stars';
// import InviteAndWin from '../pages/Stars/InviteAndWin';
// import Shop from '../pages/Stars/Shop';
// import StarsStatusTable from '../pages/Stars/StarsStatusTable';
// import TopUp from '../pages/Stars/TopUp';
// // import CashOut from '../pages/Stars/CashOut';
import PremiumViewers from '../pages/Premium/PremiumViewers';
import PremiumHosts from '../pages/Premium/PremiumHosts';
import AccountStatus from '../pages/AccountStatus';
import InviteAndWin from '../pages/Stars/InviteAndWin';
import Shop from '../pages/Stars/Shop';
import StarsStatusTable from '../pages/Stars/StarsStatusTable';
import StarsTransaction from '../pages/Stars/StarsTransaction';
import ChangePasswordPage from "../pages/ChangePassword";
import ResetCode from "../pages/ResetCode";
import ResetCodePage from "../pages/ResetCode";
import ChangePassword from "../pages/ChangePassword";
import RouterComponent from "./MainRouter";
// import TopUp from '../pages/Stars/TopUp';
// import TopupAndCashout from '../pages/Stars/TopupAndCashout';

const Router: FC = () => {
  const dispatch = useDispatch();
  const pathName = window?.location?.pathname?.split('/')
  const [isTvStreamPage,setIsTvStreamPage] = useState(false)

  useEffect(()=> {
    const validPaths = ['watch-party', 'stream', 'tvStream'];
    const pathName = window?.location.pathname.split('/');
    setIsTvStreamPage(pathName.length > 1 && validPaths.includes(pathName[1]));
  },[pathName])

  const {jwt, hasConfirmedPhoneNumber, isAnonymous} = useSelector(({profile}: ReduxSelectors) => profile);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storageData = appStorage.getObject(StorageKey.Login);
    if (storageData) {

      // billing:
      const currClientDate = new Date().toJSON();
      const eventType = "site.opened"

      BaseService.setJwt(storageData.jwt);
      UserManagementService.getUserData()
          .then(({data: {result}}) => {

            const profileData: Profile = {
              jwt: storageData.jwt,
              id: result.id,
              email: (!!result?.email && result.email.includes('@skiplogin.com')) ? "" : result.email,
              nickname: result.nickname || result.username,
              firstName: result.first_name,
              lastName: result.last_name,
              preferredLanguage: result.preferred_language,
              preferredGenre: result.preferred_genre,
              isOverEighteen: result.has_confirmed_is_over_eighteen || false,
              hasConfirmedPhoneNumber: result.has_confirmed_phone_number || false,
              phoneNumber: result.phone_number,
              showDebugInfo: result.show_debug_info || false,
              avatar: result.avatar,
              isAnonymous: !!(!!result?.email && result.email.includes('@skiplogin.com'))
            };

            dispatch(setLogin(profileData));

            // billing:
            if(result && !profileData.isAnonymous) {
              BillingServices.billingEvent(currClientDate, profileData.id, eventType).then(({data: {result}}) => {
                dispatch(setDailyVisitReward(result))
                if(result.billingReward.creditedStars) {
                  dispatch(setEnableRewardPopup({dailyVisitReward: true}))
                }
              })

              BillingServices.billingStarBalance(profileData.id).then(({data}) => {
                // console.log("result", data)
                if(data)(
                    dispatch(setTotalStarBalance(data))
                )
                return;
              })

              BillingServices.getBillingEvents().then(({data: {result}}) => {
                // console.log("events", result)
                dispatch(setBillingTimeEvents(result))
              })
            }
          })
          .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  const handleStreamIdRender = (props: RouteComponentProps) => {
    const splittedPath = props.location.pathname.split("/")

    if (!isAnonymous && (props.location.pathname === Routes.Login)) {
      return;
    }

    if(props.history.action === "POP" && splittedPath[1] === "stream") {
      return <Redirect
          to={{pathname: Routes.Home}}
      />
    }

    if (jwt) {
      return showDownloadApp(props.location, Routes.Stream) ?
          <DownloadApp {...props}/> :
          <SharedStreamPage {...props}/>;
    } else {
      return (
          <Redirect
              to={{
                pathname: Routes.Login,
                state: new LocationState({redirectTo: props.location.pathname})
              }}
          />
      );
    }
  };

  const handleStreamIdRoomRender = (props: RouteComponentProps) => (
      showDownloadApp(props.location, Routes.Stream) ?
          <DownloadApp {...props}/> :
          <SharedStreamPage {...props}/>
  );

  const handleStreamIdTvRender = (props: RouteComponentProps) => {
    if (props.location.pathname === Routes.Login) {
      return <SharedStreamTvPage {...props}/>;
    } else {
      return (
          <Redirect
              to={{
                pathname: Routes.Login,
                state: new LocationState({redirectTo: props.location.pathname})
              }}
          />
      );
    }
  };

  const handleStreamIdRoomTvRender = (props: RouteComponentProps) => (
      <SharedStreamTvPage {...props}/>
  );


  const showInfoToast = (message: string) => {
    // delay message show
    setTimeout(() => {
      dispatch(setInfoToast(message));
    }, 500);
  };

  const handleJoinIdRender = (props: RouteComponentProps) => (
      showDownloadApp(props.location, Routes.WatchParty) ?
          <DownloadApp {...props}/> :
          <WatchPartyJoinHome {...props}/>
  );

  const handleJoinRender = (props: RouteComponentProps) => (
      showDownloadApp(props.location, Routes.WatchParty) ?
          <DownloadApp {...props}/> :
          <WatchPartyJoin {...props}/>
  );

  const handleWatchPartyStartRender = (props: RouteComponentProps) => {
    if (!jwt) {
      showInfoToast('login.loginFirst');

      return (
          <Redirect
              exact
              from={Routes.WatchPartyStart}
              to={{
                pathname: Routes.Login,
                state: new LocationState({redirectTo: Routes.WatchPartyStart})
              }}
          />
      );
    }

    if (!hasConfirmedPhoneNumber) {
      showInfoToast('notifications.confirmNumberFirst');

      return <Redirect
          exact
          from={Routes.WatchPartyStart}
          to={Routes.MyProfile}
      />;
    }

    return <WatchPartyStart {...props}/>;
  };

  if (loading) {
    return null;
  }


  return (
      <IonReactRouter>
        {!isTvStreamPage ?<AxiosInterceptor/>:null}

        <RouterComponent jwt={jwt} isAnonymous={isAnonymous} handleJoinIdRender={handleJoinIdRender} handleJoinRender={handleJoinRender}
                         handleWatchPartyStartRender={handleWatchPartyStartRender} handleStreamIdRender={handleStreamIdRender} handleStreamIdRoomRender={handleStreamIdRoomRender}
                         handleStreamIdTvRender={handleStreamIdTvRender} handleStreamIdRoomTvRender={handleStreamIdRoomTvRender}  />

      </IonReactRouter>
  );
};

export default Router;
 