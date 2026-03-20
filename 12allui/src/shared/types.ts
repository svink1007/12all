import { VertoLayout } from '../verto/types';
import { LivingRoomMode, ShareStreamOption } from '../pages/WatchParty/enums';
import {VodState} from "../redux/reducers/vodReducers";

export type Channel = {
  id: number;
  name: string;
  https_preview_high: string | null;
  logo: string;
  channel_deep_link: string;
  is_adult_content: boolean;
  is_favorite: boolean;
  premium_status: boolean | null;
  preview_loaded: boolean;
  country_of_origin: string;
  language: string;
  genre: string;
  description: string;
  stream_id: number | null;
  stream_camera: boolean | null;
  is_vlr: boolean | null;
  user: {
    avatar: DbImage | null;
    nickname: string | null;
  };
  participants: VlrParticipant[];
};

export type Promotion = {
  image: { url: string };
  link: string;
};

export type MapPublicId = {
  channelIsActive: boolean;
  status: string;
  mappedId: string;
  fsUrl: string;
  vlr: Vlr;
  myRoom?: {
    moderatorUsername: string;
    moderatorPassword: string;
  };
};

export type UserData = {
  id: number,
  first_name: string,
  last_name: string,
  phone_number: string,
  email: string,
  preferred_genre: string,
  preferred_language: string,
  nickname: string,
  username: string,
  has_confirmed_is_over_eighteen: boolean,
  has_confirmed_phone_number: boolean,
  show_debug_info: boolean | null,
  avatar_image?: DbImage,
  avatar: string | null,
  country_of_residence?: string | null,
  birthday?: string,
  location?: string | null,
  gender?: string,
  about_me?: string | null,
  is_private?: boolean,
  isAnonymous: boolean | null
};
export type Vlr = {
  channel: Channel;
  id: number;
  is_private: boolean;
  last_ping: string | null;
  public_id: string;
  room_id: string;
  stream: SharedStream;
  active_connections_count: number | null;
  fs_url: string | null;
  up_speed_url: string | null;
  host_name?: string;
  is_my_room?: boolean;
  started_at: string;
  ended_at: string | null;
  room_layout?: RoomLayout;
  participants: VlrParticipant[];
  vod?: vod | null
};

export type vod = {
  id: number
  title: string
  description: string
  url: string
  logo: string
  genre: string
  country: any
  language: string
  is_approved: boolean
  owner_id: number
  last_active: any
  is_adult_content: boolean
  show_till_android_version: any
  duration: number
  last_watch_date: any
  country_of_origin: any
  audioOnly: any
  starsAmount: number
  isPrivate: boolean
  restrictions: string
  created_by: any
  updated_by: any
  created_at: string
  updated_at: string
}

export type VlrResponse = {
  fs_url: string;
  moderator_password: string;
  moderator_username: string;
  public_id: string;
  room_id: string;
  status: string;
  vlrCollection: Vlr[];
  up_speed_url: string;
};

export type FreeVlrListResponse = {
  fs_url: string;
  moderator_password: string;
  moderator_username: string;
  up_speed_url: string;
  vlr_collection: Vlr[];
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

export interface SharedStream {
  id: number;
  name: string;
  url: string;
  genre: string;
  country: string;
  language: string;
  logo: string;
  logo_image?: DbImage;
  is_owner: boolean;
  is_adult_content: boolean | null;
  is_favorite?: boolean;
  stream_snapshot: string | null;
  epg_channel: EpgChannel | null;
  snapshot?: string;
  source?: string;
  audioOnly: boolean;
  starsAmount: string;
}

export interface SharedStreamVlrs extends SharedStream {
  vlr?: Vlr[];
  vod_owner?: any
}

export interface SharedVodVlrs extends VodState {
  vlr?: Vlr[];
}

export interface SharedStreamTestResponse extends SharedStream {
  last_active: string;
  played_successfully: boolean | null;
}

export interface SharedStreamTest extends SharedStreamTestResponse {
  last_active_local: string;
  last_active_local_ms: number;
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
  logo_image: DbImage | null;
}

export interface SharedSiteResponse extends SharedSite {
  id: number;
}

export type Server = {
  id: number;
  name: string;
};

export type IceServer = {
  urls: string | string[];
  username?: string;
  password?: string;
};

export type RoomLayout = {
  id: number;
  name: string;
  layout: VertoLayout;
  key: string;
  default: boolean;
};

export type Genre = {
  id: number;
  name: string;
};

export type RecordedVideo = {
  id: string;
  fileName: string;
  duration: number;
  startDate: string;
};

export type Partner = {
  id: number;
  name: string;
};

type EpgChannel = {
  display_name: string;
  external_id: string;
  id: number;
  entries: EpgEntry[];
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

export type StreamSnapshot = {
  id: number;
  snapshot: string;
};

export type FsResolution = {
  id: number;
  name: string;
  resolution: number;
}

export interface VlrBlockedIp {
  id: number;
  ip: string;
}

export type PatchChannelMetaData = {
  publicId: string;
  channelName?: string;
  streamId?: number;
  isPrivate?: boolean;
  logo?: string | null;
  newHostCallId?: string;
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
  show_schedule: boolean | null;
  schedule_date: string | null;
  schedule_participants: string | null;
  schedule_duration: number;
}

export interface VlrTemplate extends VlrTemplateBase {
  id: number;
  template_name: string;
  logo: DbImage | null;
  vlr: Vlr;
  stream: SharedStream | null;
  selected: boolean;
}

export interface CreateVlrTemplate extends VlrTemplateBase {
  template_name: string;
  vlr: number;
  stream: number | null;
  logo?: number | null;
}

export interface UpdateVlrTemplate extends VlrTemplateBase {
  vlr: number;
  stream: number | null;
  logo?: number | null;
}

export type Room = {
  id: number;
  publicId: string;
  roomId: string;
};

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
  streamUrl: string | null;
  roomResolution: number | null;
  room: Room;
  schedule: VlrTemplateSchedule;
};

export type DbImage = {
  id: number;
  url: string;
  formats?: {
    thumbnail?: {
      url: string;
    }
  }
};

export type LoginResponse = {
  jwt: string,
  user: UserData
}

export type RecaptchaResponse = {
  result: {
    success: boolean
  }
}

export type CreateVlrSchedule = {
  vlrId: number;
  startAt: string;
  name: string;
  genre?: string | null;
  language?: string | null;
  description?: string | null;
  logo?: string | null;
  participants?: string;
  useUserMedia: boolean;
  shareType: ShareStreamOption | null;
  mode: LivingRoomMode;
  invitationUrl: string;
  customStreamUrl: string | null;
  streamId: number | null;
  duration: number;
  roomResolution: number | null;
  timeZone?: string;
};

export type VlrScheduleDTO = {
  id: number;
  start_at: string;
  name: string;
  genre?: string | null;
  language?: string | null;
  description?: string | null;
  logo?: string | null;
  participants?: string;
  use_user_media: boolean;
  share_type: ShareStreamOption | null;
  mode: LivingRoomMode;
  vlr: Vlr;
  invitation_url: string;
  custom_stream_url: string | null;
  stream: SharedStream | null;
  duration: number;
  room_resolution: number | null;
}
export type CreateChannelData = {
  title:string,
  logo: string,
  description: string,
  genre: string,
  language: string,
  is_adult_content: boolean,
  starsAmount: string,
  isPrivate: boolean,
  restrictions: string,
  shared_vods: number[]
};
export type EditChannelData = {
  name: string;
  url: string;
  logo: string;
  description: string;
  genre: string;
  language: string;
  is_adult_content: boolean;
  starsAmount: string;
  isPrivate: boolean;
  restrictions: string;
  shared_vods: number[]
};

export type InitChannelBillingData = {
  eventType: string,
  modelName: string,
  entryObj: {
    price: number,
    isChannel: boolean,
    room_id: number | string
  }
}

export type VlrTemplateSchedule = {
  show: boolean;
  date: string | null;
  participants: string[];
  duration: number;
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
  role: 'host' | 'co-host' | null
}

export type VlrScheduleDuration = {
  id: number;
  label: string;
  duration: number;
}

export type BillingInfo = {
  userId: number,
  type: string,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  country: string,
  vatNumber: string,
  address1: string,
  address2: string,
  postCode: string,
  city: string,
}

export type RewardPopup = {
  signupReward?: boolean,
  dailyVisitReward?: boolean,
  isFirstAvatarUploaded?: boolean,
  firstFavoriteAward?: boolean,
  openChannelDirectStream?: boolean,
  openPaidStreamAnon?: boolean,
  openRoomAnon?: boolean,
  openPaidStreamGuest?: boolean
}

export type BillingReward = {
  externalClientId: number,
  creditedStars: number
}

export type ChannelCostDescription = {
  channelCost: string,
  streamId: number
  vodId?: number
}

export interface BillingEvents {
  minutePeriod: number,
  type: string
}

export interface SubscriptionTypes {
  id: number;
  period: string;
  type: string;
  price: number;
  starPrice: number;
}

export interface StarPackages {
  id: number;
  name: string;
  price: number;
  stars: number;
}

export type SubscriptionStar = {
  starPrice: number;
}

export type SubscribeWithStars = {
  client: number;
  endDate: string;
  expiredFor: number;
  id: number;
  startDate: string;
  status: string
  type: string
}

export type RewardInfo = {
  enablePopup: RewardPopup,
  responseDate: string,
  billingReward: BillingReward,
  billingResponse: {
    message: string,
    code: string
  },
  status: string,
  starsBalance: number,
  channelCostDescription: ChannelCostDescription,
  billingInfo: BillingInfo,
  billingTimeEvents: BillingEvents[],
  subscriptionTypes: SubscriptionTypes[]
}

export type TransactionStarsTable = {
    id: number,
    date: string,
    description: string,
    type: string,
    amount: number,
    externalClientId: number
  }


export type BillingStarsTable = {
  transactions: TransactionStarsTable[],
  count: number
}

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

export type ReferralList = [ReferralItem]

export type ReferralResult = {
  id: number,
  phoneNumber: string,
  clientId: number,
  claimed: boolean,
}

export type ReferralRemind = {
  phoneNumber: string,
  message: string,
  isReminded: true
}

export type ConversionTopUpAndCashOut = {
  stars: number,
  money: number,
  conversionRate: number
}

export interface PaymentItems {
  itemId: number,
  quantity: number,
  type: string
}

export type PaymentConfig = {
  backendUrl?: string,
  externalClientId: number,
  currency: string,
  items: PaymentItems[],
  userEmail: string,
  fullPrice: number,
  logoUrl?: string,
  itemImgUrl?: string,
  cssUrl?: string,
  authToken: string,
  withPromoCodes: boolean
  redirectOptions: {
    text: string,
    successUrl: string,
    backUrl: string
  }
}

export type CashOutConfig = {
  backendUrl?: string;
  externalClientId: number;
  currency: string;
  amount: number;
  stars: number;
  logoUrl?: string;
  itemImgUrl?: string;
  backUrl: string;
  authToken?: string;
}

export type GameChoicesObj = {
  type: string;
  value: string;
};

export type BetGameObj = { 
  id: number | null;
  roomId: number | null;
  hostId: number | null;
  createdByName: string;  
  content: string;
  betAmount: string; 
  lockIn: string; 
  multipleChoice: boolean;
  betsValue: boolean;
  choices: string[];
  valueDescription: string;
  createdAt: Date;
  end: Date; 
  //joinedUsers: number[],
  participants: number[],
  status: BetStatusType,
  winner: {
    choice: string;
    value: string;
  },
  // selected: boolean
};

export type BetStatusType = 'ACTIVE' | 'ABORTED' | 'ENDED' | 'LOCKED' | null;

export const CHAT_MESSAGE_ADD_GAME = 1;
export const CHAT_MESSAGE_JOIN_GAME = 2;
export const CHAT_MESSAGE_GAME_ADD_WINNER = 3;
/**
 * Chat messages types
 * null - common messages
 * 1 - Add bets game
 * 2 - Join to bets game
 * 3 - Finished game and added winner
 */
export type messageType = typeof CHAT_MESSAGE_ADD_GAME | typeof CHAT_MESSAGE_JOIN_GAME  | typeof CHAT_MESSAGE_GAME_ADD_WINNER | null;