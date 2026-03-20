import { VertoLayout } from "../verto/types";
import { Gender, InAppCodeType } from "./enums";
import { VodState } from "../redux/reducers/vodReducers";

export type Epg = {
  id: number;
  external_id: number;
  icon: string;
  display_name: string;
};

export type EpgEntry = {
  id: number;
  title: string;
  genre: string;
  countryOfOrigin: string;
  description: string;
  short_description: string;
  language: string;
  start_date: string;
  stop_date: string;
};

export interface Channel {
  id: number;
  external_id: string;
  name: string;
  epg_channel: null | Epg;
  preview_high: string;
  preview_hq: string;
  https_preview: string;
  https_preview_high: string | null;
  logo: string;
  https_logo: string;
  channel_deep_link: string;
  genre: string;
  language: string;
  country_of_origin: string;
  description: string;
  is_favorite: boolean;
  is_adult_content: boolean | null;
  stream_id: number | null;
  stream_camera: boolean | null;
  is_vlr: boolean;
}

export interface SharedStream {
  id: number;
  name: string;
  url: string;
  genre: string;
  country: string;
  language: string;
  logo: string | null;
  logo_image?: DbImage;
  premium_status: boolean;
  is_adult_content: boolean | null;
  is_favorite?: boolean;
  is_owner?: boolean | null;
  is_approved: boolean | null;
  owner?: number | null;
  duration: number | null;
  httpsPreviewHigh: string | null;
  stream_snapshot?: string | null;
  epg_channel: EpgChannel | null;
}

export type Vlr = {
  channel: Channel;
  created_at: string;
  created_by: string | null;
  id: number;
  is_private: boolean;
  last_ping: string | null;
  public_id: string;
  published_at: string;
  room_id: string;
  updated_at: string;
  updated_by: string | null;
  stream: SharedStream;
  active_connections_count: number | null;
  fs_url: string | null;
  is_active: boolean;
  host: string | null;
  up_speed_url: string | null;
  host_name?: string;
  is_my_room?: boolean;
  started_at: string;
  ended_at: string | null;
  room_layout?: RoomLayout;
  participants: VlrParticipant[];
};

export type VlrUpcoming = {
  id: number;
  start_at: string;
  participants: string[] | null;
  name: string;
  logo: string | null;
  host: {
    nickname: string;
    avatar: DbImage | null;
  };
};

export type VlrParticipant = {
  id: number;
  nickname: string;
  call_id: string;
  user: number | null;
  avatar: string | null;
  color: string;
  is_my_room: boolean;
  role: "host" | "co-host" | null;
};

export type VlrResponse = {
  fs_url: string;
  moderator_password: string;
  moderator_username: string;
  public_id: string;
  room_id: string;
  status: string;
  up_speed_url: string;
  vlrCollection: Vlr[];
};

export type FreeVlrResponse = {
  id: number;
  fs_url: string;
  moderator_password: string;
  moderator_username: string;
  public_id: string;
  room_id: string;
  up_speed_url: string;
};

export interface ChannelEpg extends Channel {
  epg_channel_entries: EpgEntry[];
}

export type MapPublicId = {
  channelIsActive: boolean;
  status: string;
  mappedId: string;
  fsUrl: string;
  vlr: Vlr;
};

export type Stream = {
  id: number;
  url: string;
  name: string;
  genre: string;
  country: string;
  language: string;
  logo_url: string | null;
};

export interface SharedStreamVlrs extends SharedStream {
  vlr?: Vlr[];
  isSelected?: Boolean;
  starsAmount?: string;
}

export type SaveSharedStream = {
  id?: number;
  name: string;
  url: string;
  genre?: string | null;
  country?: string | null;
  language?: string | null;
  logo_image?: File | null;
};

export interface SharedSite {
  url: string;
  name: string;
  logo: string;
  logo_image: { url: string } | null;
}

export interface SharedSiteResponse extends SharedSite {
  id: number;
}

export interface FavoritesResponse extends SharedSite {
  favorite_channels: Channel[];
  favorite_streams: SharedStream[];
  pages: number;
}

export type UpdateMetadata = {
  roomId: string;
  streamCamera: boolean;
  streamId: number | null;
  streamUrl: string | null;
  isPrivate: boolean;
  channelLogo: string | null;
  channelName: string;
  channelGenre: string | null;
  channelDescription: string | null;
  channelLanguage: string | null;
  userId?: number | null;
  isHost?: boolean;
};

export type GenreDb = {
  id: number;
  name: string;
};

export type FacingMode = "user" | "environment";

export type RoomLayout = {
  id: number;
  name: string;
  layout: VertoLayout;
  key: string;
};

export type EpgChannel = {
  display_name: string;
  external_id: string;
  id: number;
  entries: EpgEntry[];
};

export type IceServer = {
  urls: string | string[];
  username?: string;
  password?: string;
};

export type UserDeviceInfo = {
  model: string;
  os: string;
  osVersion: string;
  webViewVersion: string;
};

export type CountryResponse = {
  id: number;
  name: string;
  iso_code: string;
  dial_code: number;
};

export type UserDb = {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  nickname: string;
  phone_number: string;
  country_of_residence: string;
  preferred_language: string;
  preferred_genre: string;
  gender: Gender;
  premium_status: boolean;
  has_confirmed_is_over_eighteen: boolean;
  moderator_username: string | null;
  moderator_password: string | null;
  avatar_image: DbImage | null;
  show_debug_info: boolean | null;
  has_confirmed_phone_number: boolean;
  first_name: string | null;
  last_name: string | null;
  about_me: string | null;
  birthday: string | null;
  location: string | null;
  is_private: boolean;
  auth_tokens: any;
};

export type InAppRegistryDb = {
  id: number;
  product_id: string;
  code_type: InAppCodeType;
};

export type StorageData = {
  token: string;
  phoneNumber: string;
};

export type PatchChannelMetaData = {
  publicId: string;
  channelName?: string;
  streamId?: number;
  isPrivate?: boolean;
  logo?: string | null;
  newHostCallId?: string;
};

export type DbImage = {
  id: number;
  url: string;
  formats?: {
    thumbnail?: {
      url: string;
    };
  };
};

export interface HTMLVideoStreamElement extends HTMLVideoElement {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
}

export interface HtmlCanvasStreamEl extends HTMLCanvasElement {
  captureStream: (frameRate?: number) => MediaStream;
  mozCaptureStream: (frameRate?: number) => MediaStream;
}

export type SendWsRequest = {
  method: string;
  params: any;
  onSuccess: (data: any) => void;
  onError: (err?: any) => void;
};

export type StreamSnapshot = {
  id: number;
  snapshot: string;
};

export interface VlrTemplateBase {
  channel_name: string;
  description: string | null;
  genre: string | null;
  language: string | null;
  use_media: boolean | null;
  mode: LivingRoomMode;
  custom_stream_url: string | null;
  show_custom_stream: boolean | null;
  share: ShareStreamOption | null;
  room_resolution: number | null;
}

export interface VlrTemplate extends VlrTemplateBase {
  id: number;
  template_name: string;
  logo: DbImage | null;
  vlr: Vlr;
  stream: SharedStream | null;
  selected: boolean;
}

export type SelectedVlrTemplate = {
  id: number;
  channelName: string;
  description: string | null;
  genre: string | null;
  language: string | null;
  useMedia: boolean;
  mode: LivingRoomMode;
  customStreamUrl: string | null;
  showCustomStream: boolean;
  share: ShareStreamOption | null;
  logo: DbImage | null;
  logoUrl: string | null;
  logoFile?: File | null;
  streamId: number | null;
  roomResolution: number | null;
  room: Room;
};

export type Room = {
  id: number;
  publicId: string;
  roomId: string;
};

export enum ShareStreamOption {
  Stream = "stream",
  File = "file",
  Camera = "camera",
  Screen = "screen",
  Hls = "hls",
}

export enum LivingRoomMode {
  Public = "public",
  Private = "private",
  Paid = "paid",
}

export interface VlrBlockedIp {
  id: number;
  ip: string;
}

export type RecaptchaResponse = {
  result: {
    success: boolean;
  };
};

export type TransactionStarsTable = {
  id: number;
  date: string;
  description: string;
  type: string;
  amount: number;
  cashAmount: number;
  externalClientId: number;
};

export type RewardPopup = {
  signupReward?: boolean;
  dailyVisitReward?: boolean;
  isFirstAvatarUploaded?: boolean;
  firstFavoriteAward?: boolean;
  openChannelDirectStream?: boolean;
  openPaidStreamAnon?: boolean;
  openRoomAnon?: boolean;
};

export type BillingReward = {
  externalClientId: number;
  creditedStars: number;
};

export type ChannelCostDescription = {
  channelCost: string;
  streamId: number;
};

export interface BillingEvents {
  minutePeriod: number;
  type: string;
}

export type BillingInfo = {
  userId: number;
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  vatNumber: string;
  address1: string;
  address2: string;
  postCode: string;
  city: string;
};

export interface SubscriptionTypes {
  id: number;
  period: string;
  type: string;
  price: number;
  starPrice: number;
}

export type RewardInfo = {
  enablePopup: RewardPopup;
  responseDate: string;
  billingReward: BillingReward;
  billingResponse: {
    message: string;
    code: string;
  };
  status: string;
  starsBalance: number;
  channelCostDescription: ChannelCostDescription;
  billingInfo: BillingInfo;
  billingTimeEvents: BillingEvents[];
  subscriptionTypes: SubscriptionTypes[];
};

export type BillingStarsTable = {
  transactions: TransactionStarsTable[];
  count: number;
};

export type ConversionTopUp = {
  stars: number | null;
  money: number | null;
  conversionRate: number;
};

export type ReferralItem = {
  phoneNumber: string;
  userId: number;
  claimed: boolean;
  status: string;
  countryCode: string;
  remindCount: number;
  referralId: number;
  showOnUI: boolean;
};

export type ReferralList = [ReferralItem];

export type ReferralResult = {
  id: number;
  phoneNumber: string;
  clientId: number;
  claimed: boolean;
};

export type ReferralRemind = {
  phoneNumber: string;
  message: string;
  isReminded: true;
};

export type ConversionTopUpAndCashOut = {
  stars: number;
  money: number;
  conversionRate: number;
};

export interface StarPackages {
  id: number;
  name: string;
  price: number;
  stars: number;
}

export type SubscriptionStar = {
  starPrice: number;
};

export type SubscribeWithStars = {
  client: number;
  endDate: string;
  expiredFor: number;
  id: number;
  startDate: string;
  status: string;
  type: string;
};

export type Partner = {
  id: number;
  name: string;
};
export const ADD_CHANNEL = 'ADD_CHANNEL';
export type Action<T> = {
  type: string,
  payload: T
};
export const ADD_VOD = 'ADD_VOD';
export const ALL_VOD_CHANNEL = 'ALL_VOD_CHANNEL';
export const ALL_VODS = 'ALL_VODS';
export type ChannelRedux = {
  liveRooms: Channel[],
  upcomingRooms: Channel[],
  favLiveRooms: Channel[],
  favUpcomingRooms: Channel[]
};
export const SEARCH_VODS = 'SEARCH_VODS';
export const LOAD_VODS = 'LOAD_VODS';
export const ADD_RECORDED_VOD = 'ADD_RECORDED_VOD';
export const ADD_RECORDED_VOD_INFO = 'ADD_RECORDED_VOD_INFO';
export const CLEAR_RECORDED_VOD_INFO = 'CLEAR_RECORDED_VOD_INFO';

export const EDIT_VOD = 'EDIT_VOD';
export const DELETE_VOD = 'DELETE_VOD';

export const LOAD_CHANNELS = 'LOAD_CHANNELS';
export const EDIT_CHANNEL = 'EDIT_CHANNEL';
export const DELETE_CHANNEL = 'DELETE_CHANNEL';
export const TOGGLE_VOD_FAVORITE='TOGGLE_VOD_FAVORITE';
export const SET_FAVORITE_VOD='SET_FAVORITE_VOD';
export const ADD_FAVORITE_VOD= 'ADD_FAVORITE_VOD';
export const REMOVE_FAVORITE_VOD= 'REMOVE_FAVORITE_VOD';

export interface SharedVodVlrs extends VodState {
  vlr?: Vlr[];
}

