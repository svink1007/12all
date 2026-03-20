import {
  Channel,
  ChannelEpg,
  FacingMode,
  HTMLVideoStreamElement,
  LivingRoomMode,
  RewardInfo,
  RoomLayout,
  SelectedVlrTemplate,
  SharedStream,
  SharedStreamVlrs,
  Vlr,
  VlrTemplate,
} from "../../shared/types";
import { BroadcastOptions } from "../reducers/broadcastReducers";
import { Gender, ShareStreamOption } from "../../shared/enums";
import { VertoLayout } from "../../verto/types";
import { DeviceInfo } from "@capacitor/device";
import { IAPProduct } from "@ionic-native/in-app-purchase-2";
import VertoSession from "../../verto/VertoSession";
import { FileStreamSource, MyStreamSource } from "../../pages/WatchParty/types";

export type LivingRoomState = {
  share: ShareStreamOption | null;
  myStream: MyStreamSource | MyStreamSource[] | null;
  files: FileStreamSource[] | null;
  joinCamMic: boolean;
  cam: string;
  mic: string;
  channel: {
    logo: string | null;
    name?: string;
  };
  roomId: string;
  publicRoomId: string;
  moderatorUsername: string;
  moderatorPassword: string;
  fsUrl: string;
  nickname: string;
  streamName: string | null;
  isHost: boolean;
  singleConnection: boolean;
  joinRoomWithCoHost: boolean;
  roomResolution: number | null;
  vlrId: number;
  upSpeedUrl: string | null;
  mode: LivingRoomMode;
  epgId?: number | null;
  joinedFromJoinScreen: boolean;
  roomLayout: RoomLayout | null;
  streamUrl: string;
  channelIsActive: boolean;
  mappedRoomId: string;
  channelLogo: string;
};

export type UserMedia = {
  facingMode: FacingMode;
  audioTrack?: MediaStreamTrack;
};

export type Toast = {
  i18nKey: string;
  show: boolean;
  type?: string;
  duration?: number;
};

export enum ReceiveCodeVia {
  Sms = "sms",
  Call = "call",
}

export type Profile = {
  id: number;
  nickname: string;
  username: string;
  token: string;
  avatar: string | null;
  phoneNumber: string;
  countryOfResidence: string;
  preferredLanguage: string | null;
  gender: Gender;
  preferredGenre: string;
  premium: boolean;
  isOverEighteen: boolean;
  isAuthenticated: boolean;
  codeProvider: ReceiveCodeVia;
  showDebugInfo: boolean;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  birthday: string | null;
  about_me: string | null;
  account?: boolean;
  location: string | null;
  is_private: boolean;
  jwtToken: string;
  recaptchaToken?: string;
  isAnonymous?: boolean;
};

export type UnreadMessages = {
  initial: number;
  accumulator: number;
};

export type Action<T> = {
  type: string;
  payload: T;
};

export type Broadcast = {
  selectedOption: BroadcastOptions;
  shared: Channel[];
  vlrs: Vlr[];
  epg: ChannelEpg[];
  streams: SharedStreamVlrs[];
  favoriteStreams: SharedStream[];
  sharedVod: SharedStreamVlrs[];
};

export type AppConfig = {
  adInterval: number;
  adPublisherIdAndroid: string;
  adPublisherIdIOS: string;
  adShowInTheBeginning: boolean;
  roomInactiveTimeout: number;
  userCameraMaxWidth: number;
  streamMaxReconnectAttempts: number;
  streamReconnectInterval: number;
  streamPlayTimeout: number;
  phoneNumbers: string[];
  previewClip: string;
  updateStreamSnapshotsInterval: number;
  androidWebViewToUseCaptureStream: string;
  inAppProrotaionMode: string;
  sdpVideoCodecRegex: string;
  astraUrl: string;
};

export type ReduxSelectors = {
  livingRoom: LivingRoomState;
  unreadMessages: UnreadMessages;
  userCamera: UserMedia;
  toast: Toast;
  profile: Profile;
  broadcast: Broadcast;
  appConfig: AppConfig;
  channelsSearch: ChannelsSearch;
  sharedSite: SharedSitesRedux;
  roomLayout: VertoLayout;
  stream: StreamRedux;
  deviceInfo: DeviceInfo;
  networkConfig: NetworkConfig;
  networkData: NetworkData;
  inAppProduct: InAppProduct;
  streamDebug: StreamDebugRedux;
  route: RouteRedux;
  vlrTemplate: VlrTemplateRedux;
  sidebar: SidebarRedux;
  billingRewards: RewardInfo;
};

export type FreeVlrListResponse = {
  fs_url: string;
  moderator_password: string;
  moderator_username: string;
  up_speed_url: string;
  vlr_collection: Vlr[];
};

export type VlrTemplateRedux = {
  templates: VlrTemplate[];
  selected: SelectedVlrTemplate;
};

export type StreamRedux = {
  loading: boolean;
  reconnecting: boolean;
};

export type UpdateChannelAction = {
  id: number;
  key: "preview_loaded" | "logo_loaded" | "preview";
};

export type UpdateStreamAction = {
  id: number;
  key: "logo" | "preview";
};

export type ToastPayload = {
  i18nKey: string;
  prefixText: string;
  duration?: number;
};

export type ChannelsSearch = {
  searchText: string;
};

export type SharedSitesRedux = {
  url: string;
};

export type NetworkConfig = {
  streamWidthConstrainLow: number;
  streamWidthConstrainMedium: number;
  streamWidthConstrainHigh: number;
  uplinkSpeedInMbpsMedium: number;
  uplinkSpeedInMbpsHigh: number;
  uplinkSpeedCheckIntervalSec: number;
  screenShareResolution: number;
  fsMbpsLow: number;
  fsMbpsMedium: number;
  fsMbpsHigh: number;
  fsResolutionLow: number;
  fsResolutionMedium: number;
  fsResolutionHigh: number;
  fileSizeInBytesUp: number;
};

export type NetworkData = {
  uplinkSpeed: number;
  streamWidth: number;
};

export type InAppProduct = {
  products: IAPProduct[];
  ownedProduct: IAPProduct | null;
};

interface StreamDebugBase {
  sentStream: MediaStream | null;
  receivedStream: MediaStream | null;
  videoElement: HTMLVideoStreamElement | null;
  vertoSession: VertoSession | null;
}

export interface StreamDebugRedux extends StreamDebugBase {
  hlsErrors: { date: string; message: string }[];
}

export interface StreamDebugActions extends StreamDebugBase {
  hlsError: string;
}

export type RouteRedux = {
  prevUrl: string;
};

export type SidebarRedux = {
  isOpen: boolean;
};
