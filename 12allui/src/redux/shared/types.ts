import {LivingRoomMode, ShareStreamOption} from '../../pages/WatchParty/enums';
import {FileStreamSource, HTMLVideoStreamElement, MyStreamSource} from '../../pages/WatchParty/types';
import {
  RewardInfo,
  Channel,
  // DbImage,
  RoomLayout,
  SelectedVlrTemplate,
  SharedStreamVlrs,
  Vlr,
  VlrTemplate,
  VlrUpcoming,
  BetGameObj
} from '../../shared/types';
import {ILanguage} from '../../shared/Language';
import {VertoLayout} from '../../verto/types';
import {SearchType, ToastTextFormat} from './enums';
import VertoSession from '../../verto/VertoSession';
import {VlrScheduledRoom} from '../../pages/WatchParty/Start/ScheduledRooms';
import {VodRedux, VodState} from "../reducers/vodReducers";
import {VertoRedux} from "../reducers/vertoReducers";

export type LivingRoomState = {
  share: ShareStreamOption | null,
  myStream: MyStreamSource | MyStreamSource[] | null,
  files: FileStreamSource[] | null,
  vod?: VodState | null,
  joinCamMic: boolean,
  cam: string,
  mic: string,
  channel: {
    logo: string | null,
    name?: string,
  },
  roomId: string,
  publicRoomId: string,
  moderatorUsername: string,
  moderatorPassword: string,
  fsUrl: string,
  nickname: string,
  streamName: string | null,
  isHost: boolean,
  singleConnection: boolean,
  joinRoomWithCoHost: boolean,
  roomResolution: number | null,
  vlrId: number,
  upSpeedUrl: string | null,
  mode: LivingRoomMode,
  epgId?: number | null,
  joinedFromJoinScreen: boolean,
  roomLayout: RoomLayout | null,
  scheduledRooms: VlrScheduledRoom[],
  invitationUrl: string
};

export type SharedStreamLivingRoom = {
  fsUrl: string,
  mappedRoomId: string,
  isPremium: boolean,
  publicRoomId: string,
  moderatorUsername: string,
  moderatorPassword: string,
  streamUrl: string,
  channelIsActive: boolean
};

export type LivingRoomInfo = {
  name: string,
  logo: string | null,
  language: string | null,
  genre: string | null,
  description: string | null,
  mode: LivingRoomMode
};

export type JoinLivingRoom = {
  username: string,
  mic: string,
  cam: string,
  channelLogo: string | null,
  fsUrl: string,
  publicRoomId: string,
  mappedRoomId: string,
};

export type RoomTest = {
  streamName?: string,
  streamUrl?: string,
  roomId: string,
  publicId: string,
  fsUrl: string,
  moderatorUsername?: string,
  moderatorPassword?: string,
  numberOfParticipants: number,
};

export type UserMedia = {
  cam: string,
  mic: string
};

export type Toast = {
  text: string,
  show: boolean,
  type?: string,
  duration?: number,
  textFormat?: ToastTextFormat,
};

export type ToastPayload = {
  text: string,
  textFormat: ToastTextFormat,
};

export type Profile = {
  id: number,
  jwt: string,
  email: string,
  username?: string | null,
  nickname: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  preferredLanguage: string | null,
  isOverEighteen: boolean,
  hasConfirmedPhoneNumber: boolean,
  preferredGenre: string | null,
  showDebugInfo: boolean,
  avatar?: string | null,
  isAnonymous: boolean | null,
  countryOfResidence?: string | null,
  birthday?: string,
  location?: string | null,
  gender?: string,
  about_me?: string | null,
  is_private?: boolean,
};

export type UnreadMessages = {
  initial: number,
  accumulator: number
};

export type Action<T> = {
  type: string,
  payload: T
};

export type ChannelsFilter = {
  language: string | null,
  origin: string | null,
  genre: string | null,
  search: string | null
};

export type HomeFilterRedux = {
  language: string | null,
  country: string | null,
  genre: string | null,
  owner: string | null,
  filterParams: string
};

export type ChannelRedux = {
  liveRooms: Channel[],
  upcomingRooms: Channel[],
  favLiveRooms: Channel[],
  favUpcomingRooms: Channel[]
};

export type StreamRedux = {
  streams: SharedStreamVlrs[],
  favoriteStreams: SharedStreamVlrs[],
  currentStreamRoute?: string
};

export type SignUpRedux = {
  nickname: string,
  password: string,
  email?: string,
  phoneNumber: string,
  has_confirmed_is_over_eighteen: boolean,
};

export type SignupDataUsingPhone = {
  nickname: string,
  phoneNumber: string,
  countryName: string,
  has_confirmed_is_over_eighteen?: boolean,
  isCallFrom?: string
}

export type SharedSitesRedux = {
  url: string,
  name: string,
};


export type AdSenseRedux = {
  allowAds: boolean,
};

export type GamesRedux = {
  games: BetGameObj[],
  joinedGames: (number | null)[],
};

export type ReduxSelectors = {
  livingRoom: LivingRoomState,
  livingRoomInfo: LivingRoomInfo,
  unreadMessages: UnreadMessages,
  userMedia: UserMedia,
  toast: Toast,
  profile: Profile,
  joinLivingRoom: JoinLivingRoom,
  channelsFilter: ChannelsFilter,
  loginFirst: boolean,
  channel: ChannelRedux,
  vod: VodRedux,
  verto: VertoRedux,
  sharedStreamLivingRoom: SharedStreamLivingRoom,
  language: ILanguage,
  roomTest: RoomTest,
  signUp: SignUpRedux,
  stream: StreamRedux,
  streamRow: StreamRedux,
  sharedSite: SharedSitesRedux,
  adSense: AdSenseRedux,
  webConfig: WebConfig,
  streamLoading: StreamLoading,
  inRoom: InRoom,
  roomLayout: RoomLayoutRedux,
  networkData: NetworkData,
  networkConfig: NetworkConfig,
  vlrTemplate: VlrTemplateRedux,
  streamDebug: StreamDebugRedux,
  homeFilter: HomeFilterRedux,
  search: SearchRedux,
  billingRewards: RewardInfo,
  betGames: GamesRedux,
};

export type StreamLoading = {
  loading: boolean,
};

export type WebConfig = {
  previewClip: string,
  streamMaxReconnectAttempts: number,
  streamReconnectInterval: number,
  streamPlayTimeout: number,
  unableCamTimeout: number,
  hostLeftRoomTimeout: number,
  streamWidthConstrain: number,
  astraUrl: string,
  updateStreamSnapshotsInterval: number,
  maxHotItems: number,
  sdpVideoCodecRegex: string,
  roomSoonOnAirThreshold: number
};

export type NetworkConfig = {
  streamWidthConstrainLow: number,
  streamWidthConstrainMedium: number,
  streamWidthConstrainHigh: number,
  uplinkSpeedInMbpsMedium: number,
  uplinkSpeedInMbpsHigh: number,
  uplinkSpeedCheckIntervalSec: number,
  screenShareResolution: number,
  fsMbpsLow: number,
  fsMbpsMedium: number,
  fsMbpsHigh: number,
  fsResolutionLow: number,
  fsResolutionMedium: number,
  fsResolutionHigh: number,
  fileSizeInBytesUp: number,
};

export type InRoom = {
  isCoHost: boolean,
  loadingStream: boolean,
  sharingInProgress: boolean
}

export type RoomLayoutRedux = {
  selected: VertoLayout
};

export type NetworkData = {
  uplinkSpeed: number,
  streamWidth: number
};

export type VlrTemplateRedux = {
  templates: VlrTemplate[],
  selected: SelectedVlrTemplate
};

interface StreamDebugBase {
  sentStream: MediaStream | null,
  receivedStream: MediaStream | null,
  videoElement: HTMLVideoStreamElement | null,
  vertoSession: VertoSession | null
}

export interface StreamDebugRedux extends StreamDebugBase {
  hlsErrors: { date: string, message: string }[];
}

export interface StreamDebugActions extends StreamDebugBase {
  hlsError: string;
}

export type SearchRedux = {
  type: SearchType,
  query: string
};

export type SearchDTO = {
  streams: SharedStreamVlrs[],
  rooms: {
    live: Vlr[],
    upcoming: VlrUpcoming[],
  }
};
export const SEARCH_VODS = 'SEARCH_VODS';
export const ALL_VOD_CHANNEL = 'ALL_VOD_CHANNEL';
export const ALL_VODS = 'ALL_VODS';
export const LOAD_VODS = 'LOAD_VODS';
export const ADD_VOD = 'ADD_VOD';
export const ADD_RECORDED_VOD = 'ADD_RECORDED_VOD';
export const ADD_RECORDED_VOD_INFO = 'ADD_RECORDED_VOD_INFO';
export const CLEAR_RECORDED_VOD_INFO = 'CLEAR_RECORDED_VOD_INFO';

export const EDIT_VOD = 'EDIT_VOD';
export const DELETE_VOD = 'DELETE_VOD';

export const LOAD_CHANNELS = 'LOAD_CHANNELS';
export const ADD_CHANNEL = 'ADD_CHANNEL';
export const EDIT_CHANNEL = 'EDIT_CHANNEL';
export const DELETE_CHANNEL = 'DELETE_CHANNEL';
export const TOGGLE_VOD_FAVORITE='TOGGLE_VOD_FAVORITE';
export const SET_FAVORITE_VOD='SET_FAVORITE_VOD';
export const ADD_FAVORITE_VOD= 'ADD_FAVORITE_VOD';
export const REMOVE_FAVORITE_VOD= 'REMOVE_FAVORITE_VOD'


