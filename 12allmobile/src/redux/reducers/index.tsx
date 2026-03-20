import { combineReducers } from "redux";

import livingRoom from "./livingRoomReducers";
import unreadMessages from "./unreadMessagesReducers";
import userCamera from "./userMediaReducers";
import toast from "./toastReducers";
import profile from "./profileReducers";
import broadcast from "./broadcastReducers";
import appConfig from "./appConfigReducers";
import channelsSearch from "./channelsSearchReducers";
import sharedSite from "./sharedSiteReducers";
import roomLayout from "./roomLayoutReducers";
import stream from "./streamReducers";
import deviceInfo from "./deviceInfoReducers";
import networkConfig from "./networkConfigReducers";
import networkData from "./networkDataReducers";
import inAppProduct from "./inAppProductReducers";
import streamDebug from "./streamDebugReducers";
import route from "./routeReducers";
import vlrTemplate from "./vlrTemplateReducers";
import sidebar from "./sidebarReducers";
import billingRewards from "./billingRewardReducers";

export default combineReducers({
  livingRoom,
  unreadMessages,
  userCamera,
  toast,
  profile,
  broadcast,
  appConfig,
  channelsSearch,
  sharedSite,
  roomLayout,
  stream,
  deviceInfo,
  networkConfig,
  networkData,
  inAppProduct,
  streamDebug,
  route,
  vlrTemplate,
  sidebar,
  billingRewards,
});
