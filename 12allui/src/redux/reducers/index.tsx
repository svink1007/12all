import {combineReducers} from 'redux';

import livingRoom from './livingRoomReducers';
import unreadMessages from './unreadMessagesReducers';
import userMedia from './userMediaReducers';
import toast from './toastReducers';
import profile from './profileReducers';
import joinLivingRoom from './joinLivingRoomReducers';
import channelsFilter from './channelFilterReducer';
import sharedStreamLivingRoom from './sharedStreamLivingRoomReducers';
import language from './languageReducers';
import channel from './channelReducers';
import vod from './vodReducers';
import verto from './vertoReducers';
import roomTest from './roomTestReducers';
import signUp from './signUpReducers';
import stream from './streamReducers';
import streamRow from './streamRowReducers';
import sharedSite from './sharedSiteReducers';
import adSense from './adSenseReducers';
import webConfig from './webConfigReducers';
import streamLoading from './streamLoadingReducers';
import inRoom from './inRoomReducers';
import roomLayout from './roomLayoutReducers';
import networkData from './networkDataReducers';
import networkConfig from './networkConfigReducers';
import vlrTemplate from './vlrTemplateReducers';
import streamDebug from './streamDebugReducers';
import homeFilter from './homeFilterReducers';
import search from './searchReducers';
import billingRewards from './billingRewardReducers';
import betGames from './gamesReducers'

export default combineReducers({
  livingRoom,
  vod,
  verto,
  unreadMessages,
  userMedia,
  toast,
  profile,
  joinLivingRoom,
  channelsFilter,
  sharedStreamLivingRoom,
  language,
  channel,
  roomTest,
  signUp,
  stream,
  streamRow,
  sharedSite,
  adSense,
  webConfig,
  streamLoading,
  inRoom,
  roomLayout,
  networkData,
  networkConfig,
  vlrTemplate,
  streamDebug,
  homeFilter,
  search,
  billingRewards,
  betGames
});
