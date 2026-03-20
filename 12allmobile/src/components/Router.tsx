import { FC, useEffect, useRef } from "react";
import { Redirect, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";

import LoginPage from "../pages/Login";
import ConfirmCodePage from "../pages/ConfirmCode";
import ProfilePage from "../pages/Profile";
import BroadcastsPage from "../pages/Broadcasts";
import PrivacyPolicyPage from "../pages/PrivacyPolicy";
import TermsPage from "../pages/Terms";
import AboutPage from "../pages/About";
import CreateRoomPage from "../pages/CreateRoom";
import RoomSettings from "../pages/RoomSettings";
import SettingsPage from "../pages/Settings";
import SharedStreamPage from "../pages/SharedStream";
import JoinWatchPartyPage from "../pages/WatchParty/JoinWatchPartyPage";
import RoomWatchPartyPage from "../pages/WatchParty/RoomWatchPartyPage";
import SharedSitePage from "../pages/SharedSite";
import ConfirmCodeProviderPage from "../pages/ConfirmCodeProvider";
import Users from "../pages/Users";
import StarsTransactions from "../pages/StarsTransactions";
import AccountBalance from "../pages/AccountBalance";
import ShowContact from "../pages/Contacts";
import PremiumPage from "../pages/Premium";
import VodRoomPage from "../pages/VodRoom";
import AppMenu from "./AppMenu";

import { Routes } from "../shared/routes";
import { ReduxSelectors } from "../redux/types";
import AppPushNotifications from "./AppPushNotifications";
import { MOBILE_VIEW } from "../shared/constants";
import AppUrlListener from "./AppUrlListener";
import appStorage, { StorageKey } from "../shared/appStorage";
import BaseService from "../services/BaseService";
import { UserManagementService } from "../services";
import DeleteProfile from "../pages/DeleteProfile";
import BillingHistory from "../pages/BillingHistory";
import TopUp from "../pages/TopUp";
import CashOut from "../pages/CashOut";
import InviteAndWin from "../pages/InviteAndWin";
import BillingInfo from "../pages/BillingInfo";
import Skip from "../pages/Skip";
import setPrevRoute from "../redux/actions/routeActions";

const Router: FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    (async function () {
      const storageData = await appStorage.getObject(StorageKey.Login);

      if (storageData) {
        // Set JWT for stored authentication data
        // The App.tsx component will handle clearing skip login users
        BaseService.setJwt(storageData.jwtToken);
      }
    })();
  }, [dispatch]);

  return (
    <IonReactRouter>
      {/* <AppUrlListener /> */}
      {MOBILE_VIEW && <AppPushNotifications />}
      <IonRouterOutlet>
        <Route exact path={Routes.Login} component={LoginPage} />
        <Route exact path={Routes.SKIP} component={Skip} />
        <Route
          exact
          path={Routes.CodeProvider}
          component={ConfirmCodeProviderPage}
        />
        <Route exact path={Routes.Code} component={ConfirmCodePage} />
        <Route exact path={Routes.Profile} component={ProfilePage} />
        <Route exact path={Routes.ProtectedSettings} component={SettingsPage} />
        <Route exact path={Routes.Broadcasts} component={BroadcastsPage} />
        <Route
          exact
          path={Routes.WatchPartyJoin}
          component={JoinWatchPartyPage}
        />

        <Route
          exact
          path={Routes.ProtectedStreamId}
          component={SharedStreamPage}
        />
        <Route
          exact
          path={Routes.ProtectedStreamIdRoom}
          component={SharedStreamPage}
        />
        <Route exact path={Routes.VodChannelId} component={VodRoomPage} />
        <Route
          exact
          path={Routes.ProtectedWatchPartyJoin}
          component={JoinWatchPartyPage}
        />
        <Route
          exact
          path={Routes.ProtectedWatchPartyJoinId}
          component={JoinWatchPartyPage}
        />
        <Route
          exact
          path={Routes.ProtectedWatchPartyRoomId}
          component={RoomWatchPartyPage}
        />
        <Route
          exact
          path={Routes.ProtectedSharedSites}
          component={SharedSitePage}
        />

        <Route
          exact
          path={Routes.ProtectedCreateRoom}
          component={CreateRoomPage}
        />
        <Route
          exact
          path={Routes.ProtectedRoomSettings}
          component={RoomSettings}
        />
        <Route
          exact
          path={Routes.ProtectedStarsTransactions}
          component={StarsTransactions}
        />
        <Route
          exact
          path={Routes.ProtectedBillingHistory}
          component={BillingHistory}
        />

        <Route
          exact
          path={Routes.ProtectedAccountBalance}
          component={AccountBalance}
        />

        <Route exact path={Routes.ProtectedTopUp} component={TopUp} />
        <Route exact path={Routes.ProtectedCashOut} component={CashOut} />
        <Route
          exact
          path={Routes.ProtectedInviteAndWin}
          component={InviteAndWin}
        />
        <Route
          exact
          path={Routes.ProtectedBillingInfo}
          component={BillingInfo}
        />

        <Route exact path={Routes.Privacy} component={PrivacyPolicyPage} />
        <Route exact path={Routes.Terms} component={TermsPage} />
        <Route exact path={Routes.About} component={AboutPage} />
        <Route exact path={Routes.ShowContacts} component={ShowContact} />
        <Route exact path={Routes.Premium} component={PremiumPage} />
        <Route exact path={Routes.Users} component={Users} />
        <Route
          exact
          path={Routes.ProtectedDeleteProfile}
          component={DeleteProfile}
        />
        <Redirect exact from="/" to={Routes.Broadcasts} />
        <Redirect exact from="/home" to={Routes.Broadcasts} />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export default Router;
