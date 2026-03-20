import {Redirect, Route, useLocation} from 'react-router-dom';
import {IonRouterOutlet} from "@ionic/react";
import Header from "./Header";
import Home from "../pages/Home";
import About from "../pages/About";
import {Routes} from "../shared/routes";
import DownloadsPage from "../pages/Downloads";
import News from "../pages/News";
import Stars from "../pages/Stars";
import Premium from "../pages/Premium";
import PremiumViewers from "../pages/Premium/PremiumViewers";
import PremiumHosts from "../pages/Premium/PremiumHosts";
import Support from "../pages/Support";
import InviteAndWin from "../pages/Stars/InviteAndWin";
import HowToWin from "../pages/Stars/HowToWin";
import Shop from "../pages/Stars/Shop";
import StarsStatusTable from "../pages/Stars/StarsStatusTable";
import StarsTransaction from "../pages/Stars/StarsTransaction";
import WatchPartyJoinMediator from "../pages/WatchParty/Join/WatchPartyJoinMediator";
import Login from "../pages/Login_v3";
import Skip from "../pages/Skip";
import Signup from "../pages/SignUp";
import NotificationsPage from "../pages/Notifications";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Terms from "../pages/Terms";
import HowToDeleteYourData from "../pages/HowToDeleteYourData";
import MyProfile from "../pages/MyProfile/indexNew";
import AccountStatus from "../pages/AccountStatus";
import ChannelBroadcast from "../pages/ChannelBroadcast";
import Article from "../pages/Article";
import Career from "../pages/Career";
import RoomPage from "../pages/Room";
import StreamTestPage from "../pages/StreamTest";
import ResetPasswordPage from "../pages/ResetPassword";
import ResetCode from "../pages/ResetCode";
import ChangePassword from "../pages/ChangePassword";
import FavoritesPage from "../pages/Favorites";
import RoomsPage from "../pages/Rooms";
import ChannelsPage from "../pages/Channels";
import SearchPage from "../pages/Search";
import GenrePage from "../pages/Genre";
import {Profile} from "../redux/shared/types";
import Footer from "./Footer";
import Header2 from "./Header2";
import ChildSafety from "../pages/ChildSafety";
import VoD from "../pages/VoD";
import Channel from "../pages/Channel";
import VideoOnDemand from "../pages/VideoOnDemand";
import VodSearch from "../pages/VodSearch";
import VodRoom from "../pages/VodRoom";
import VodRoomX from "../pages/VodRoomX";
import VodRoomChannel from 'src/pages/VodRoomChannel';

export const RouterComponent = ({ jwt, isAnonymous, handleJoinIdRender, handleJoinRender, handleWatchPartyStartRender, handleStreamIdRender, handleStreamIdRoomRender, handleStreamIdTvRender, handleStreamIdRoomTvRender }
                                : {jwt: string, isAnonymous: boolean|null, handleJoinIdRender: any, handleJoinRender: any, handleWatchPartyStartRender: any, handleStreamIdRender: any, handleStreamIdRoomRender: any, handleStreamIdTvRender: any, handleStreamIdRoomTvRender: any}) => {
    const location = useLocation();
    const pathName = location.pathname;

    const isHeaderHide = (pathName.startsWith('/watch-party') && pathName.endsWith('room'));

    const isStreamHeaderHide = (pathName.startsWith('/stream'));

    const isVodHeaderHide = (pathName.startsWith('/vod'));

    const isTvStreamHeaderHide = (pathName.startsWith('/tvStream'));

    const shouldHideHeader = isTvStreamHeaderHide || isStreamHeaderHide || isHeaderHide || isVodHeaderHide;

    return (
        <>
            {!shouldHideHeader ? <Header /> : ''}
            <IonRouterOutlet>
                <Route exact path={Routes.Home} component={Home}/>
                <Route exact path={Routes.About} component={About}/>
                <Route exact path={Routes.Downloads} component={DownloadsPage}/>
                <Route exact path={Routes.News} component={News}/>
                <Route
                    exact
                    path={Routes.VodRoomX}
                    render={
                        props => jwt && !isAnonymous ?
                            <VodRoom {...props} /> :
                            <Redirect exact from={Routes.VodRoom} to={Routes.Login} />
                    }
                />
                 <Route
                    exact
                    path={Routes.VodRoomChannel}
                    render={
                        props => jwt && !isAnonymous ?
                        <VodRoomChannel {...props} /> :
                        <Redirect exact from={Routes.VodRoomChannel} to={Routes.Login} />
                    }
                />

                <Route
                    exact
                    path={Routes.VodRoom}
                    render={
                        props => jwt && !isAnonymous ?
                            <VodRoomX {...props} /> :
                            <Redirect exact from={Routes.VodRoomX} to={Routes.Login} />
                    }
                />
                <Route
                    exact
                    path={Routes.MyVoD}
                    render={
                        props => jwt && !isAnonymous ?
                            <VoD /> :
                            <Redirect exact from={Routes.MyVoD} to={Routes.Login} />
                    }
                />
                <Route
                    exact
                    path={Routes.SearchVoD}
                    render={
                        props => jwt && !isAnonymous ?
                            <VodSearch /> :
                            <Redirect exact from={Routes.SearchVoD} to={Routes.Login} />
                    }
                />
                <Route
                    exact
                    path={Routes.MyChannel}
                    render={
                        props => jwt && !isAnonymous ?
                            <Channel /> :
                            <Redirect exact from={Routes.MyChannel} to={Routes.Login} />
                    }
                />
                {/* billing: */}
                <Route
                    exact
                    path={Routes.Stars}
                    render={
                        props => jwt && !isAnonymous ?
                            <Stars /> :
                            <Redirect exact from={Routes.Stars} to={Routes.Login} />
                    }
                />
                <Route
                    exact
                    path={Routes.Premium}
                    render={
                        props => jwt && !isAnonymous ?
                            <Premium /> :
                            <Redirect exact from={Routes.Premium} to={Routes.Login} />
                    }
                />
                <Route
                    exact
                    path={Routes.PremiumViewer}
                    render={
                        props => jwt && !isAnonymous ?
                            <PremiumViewers /> :
                            <Redirect exact from={Routes.PremiumViewer} to={Routes.Login} />
                    }
                />
                <Route
                    exact
                    path={Routes.PremiumHost}
                    render={
                        props => jwt && !isAnonymous ?
                            <PremiumHosts /> :
                            <Redirect exact from={Routes.PremiumHost} to={Routes.Login} />
                    }
                />
                <Route exact path={Routes.Support} component={Support} />
                <Route
                    exact
                    path={Routes.InviteAndWin}
                    render={
                        props => jwt && !isAnonymous ?
                            <InviteAndWin /> :
                            <Redirect exact from={Routes.InviteAndWin} to={Routes.Login} />
                    }
                />
                <Route
                    exact
                    path={Routes.howToWin} component={HowToWin}
                />
                <Route
                    exact
                    path={Routes.Shop}
                    render={
                        props => jwt && !isAnonymous ?
                            <Shop /> :
                            <Redirect exact from={Routes.Shop} to={Routes.Login} />
                    }
                />
                <Route
                    exact
                    path={Routes.StarsStatusTable}
                    render={
                        props => jwt && !isAnonymous ?
                            <StarsStatusTable /> :
                            <Redirect exact from={Routes.StarsStatusTable} to={Routes.Login} />
                    }
                />
                <Route
                    exact
                    path={Routes.StarsTransaction}
                    render={
                        props => jwt && !isAnonymous ?
                            <StarsTransaction /> :
                            <Redirect exact from={Routes.StarsTransaction} to={Routes.Login} />
                    }
                />
                {/* <Route
          exact
          path={Routes.TopUp}
          render={
            props => jwt && !isAnonymous ?
              <TopUp /> :
              <Redirect exact from={Routes.TopUp} to={Routes.Login} />
          }
        /> */}

                <Route exact path={Routes.WatchPartyRoomId} render={handleJoinIdRender}/>
                <Route exact path={Routes.WatchPartyRoomIdMediator} component={WatchPartyJoinMediator}/>
                <Route path={Routes.WatchPartyJoin} render={handleJoinRender}/>
                <Route path={Routes.WatchPartyStart} render={handleWatchPartyStartRender}/>
                <Redirect exact from={Routes.WatchParty} to={Routes.WatchPartyJoin}/>

                <Route exact path={Routes.Login} component={Login}/>
                <Route exact path={Routes.Skip} component={Skip}/>
                <Route exact path={Routes.SignUp} component={Signup}/>
                <Route exact path={Routes.Notifications} component={NotificationsPage}/>
                <Route exact path={Routes.PrivacyPolicy} component={PrivacyPolicy}/>
                <Route exact path={Routes.ChildSafety} component={ChildSafety}/>
                <Route exact path={Routes.TermsAndConditions} component={Terms}/>
                <Route exact path={Routes.HowToDeleteYourData} component={HowToDeleteYourData}/>
                <Route
                    exact
                    path={Routes.MyProfile}
                    render={
                        props => jwt && !isAnonymous ?
                            <MyProfile {...props}/> :
                            <Redirect exact from={Routes.MyProfile} to={Routes.Login}/>
                    }
                />
                {/* billing: */}
                <Route
                    exact
                    path={Routes.AccountStatus}
                    render={
                        props => jwt && !isAnonymous ?
                            <AccountStatus {...props}/> :
                            <Redirect exact from={Routes.AccountStatus} to={Routes.Login}/>
                    }
                />
                <Route exact path={Routes.SharedSites} component={ChannelBroadcast}/>
                <Route exact path={Routes.NewsId} component={Article}/>
                <Route exact path={Routes.Career} component={Career}/>
                <Route exact path={Routes.StreamId} render={handleStreamIdRender}/>
                <Route exact path={Routes.StreamIdRoom} render={handleStreamIdRoomRender}/>

                <Route exact path={Routes.StreamIdTv} render={handleStreamIdTvRender}/>
                <Route exact path={Routes.StreamIdRoomTv} render={handleStreamIdRoomTvRender}/>

                <Route path={Routes.Room} component={RoomPage}/>
                <Route
                    exact
                    path={Routes.StreamTest}
                    render={
                        props => jwt ?
                            <StreamTestPage {...props}/> :
                            <Redirect exact from={Routes.StreamTest} to={Routes.Login}/>
                    }
                />
                <Route path={Routes.ResetPassword} component={ResetPasswordPage}/>

                <Route
                    exact
                    path={Routes.resetCode}
                    render={
                        props => jwt && !isAnonymous ?
                            <ResetCode {...props} /> :
                            <Redirect exact from={Routes.resetCode} to={Routes.Login} />
                    }
                />
                <Route
                    exact
                    path={Routes.changePassword}
                    render={
                        props => jwt && !isAnonymous ?
                            <ChangePassword {...props} /> :
                            <Redirect exact from={Routes.changePassword} to={Routes.Login} />
                    }
                />

                <Route path={Routes.Favorites} component={FavoritesPage}/>
                <Route path={Routes.Rooms} component={RoomsPage}/>
                <Route path={Routes.Channels} component={ChannelsPage}/>
                <Route path={Routes.Vods} component={VideoOnDemand}/>
                <Route path={Routes.Search} component={SearchPage}/>
                <Route path={Routes.Genre} component={GenrePage} />

                <Redirect exact from="/" to={Routes.Home}/>
            </IonRouterOutlet>
            {!shouldHideHeader && <Footer/>}
        </>
    );
};

export default RouterComponent;
