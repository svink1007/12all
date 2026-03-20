import {
  BillingEvents,
  RewardInfo,
  RewardPopup,
  SubscriptionTypes,
} from "../../shared/types";
import { Action } from "../types";
import { SET_TOTAL_STAR_BALANCE } from "../types/types";

const INITIAL: RewardInfo = {
  enablePopup: {
    signupReward: false,
    dailyVisitReward: false,
    isFirstAvatarUploaded: false,
    firstFavoriteAward: false,
    openChannelDirectStream: false,
    openPaidStreamAnon: false,
    openRoomAnon: false,
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
  subscriptionTypes: [],
};

export default function reducer(
  state = INITIAL,
  {
    type,
    payload,
  }: Action<RewardInfo | RewardPopup | BillingEvents[] | SubscriptionTypes[]>
): RewardInfo {
  switch (type) {
    case SET_TOTAL_STAR_BALANCE:
      return {
        ...state,
        ...(payload as RewardInfo),
      };
    default:
      return state;
  }
}
