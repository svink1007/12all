import { BillingEvents, RewardInfo, RewardPopup, SubscriptionTypes } from "../../shared/types";
import {
  SET_BILLING_AVATAR_REWARD,
  SET_BILLING_REWARD,
  SET_ENABLE_POPUP,
  SET_FIRST_FAVORITE_AWARD,
  SET_TOTAL_STAR_BALANCE,
  SET_OPEN_CHANNEL_DIRECT_STREAM,
  SET_BILLING_TIME_EVENTS,
  SET_SUBSCRIPTION_TYPE,
} from "../shared/constants";
import { Action } from "../shared/types";

const INITIAL: RewardInfo = {
  enablePopup: {
    signupReward: false,
    dailyVisitReward: false,
    isFirstAvatarUploaded: false,
    firstFavoriteAward: false,
    openChannelDirectStream: false,
    openPaidStreamAnon: false,
    openRoomAnon: false
  },
  responseDate: "",
  billingReward: {
    externalClientId: 0,
    creditedStars: 0,
  },
  billingResponse: {
    message: "",
    code: "",
  },
  status: "",
  starsBalance: 0,
  channelCostDescription: {
    channelCost: "",
    streamId: 0,
  },
  billingInfo: {
    userId: 0,
    type: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    vatNumber: "",
    address1: "",
    address2: "",
    postCode: "",
    city: "",
  },
  billingTimeEvents: [],
  subscriptionTypes: []
};

export default function reducer(state = INITIAL, { type, payload }: Action<RewardInfo | RewardPopup | BillingEvents[] | SubscriptionTypes[]>): RewardInfo {
  switch (type) {
    case SET_ENABLE_POPUP:
      return {
        ...state,
        enablePopup: { ...state.enablePopup, ...(payload as RewardPopup) },
      };

    case SET_BILLING_REWARD:
      return {
        ...state,
        ...(payload as RewardInfo),
      };

    case SET_BILLING_AVATAR_REWARD:
      return {
        ...state,
        ...(payload as RewardInfo),
      };

    case SET_FIRST_FAVORITE_AWARD:
      return {
        ...state,
        ...(payload as RewardInfo),
      };

    case SET_TOTAL_STAR_BALANCE:
      return {
        ...state,
        ...(payload as RewardInfo),
      };

    case SET_OPEN_CHANNEL_DIRECT_STREAM:
      return {
        ...state,
        ...(payload as RewardInfo),
      };

    case SET_BILLING_TIME_EVENTS:
      return {
        ...state,
        billingTimeEvents: payload as BillingEvents[],
      };

    case SET_SUBSCRIPTION_TYPE:
      return {
        ...state,
        subscriptionTypes: payload as SubscriptionTypes[],
      };

    default:
      return state;
  }
}
