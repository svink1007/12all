import {
  SET_BILLING_AVATAR_REWARD,
  SET_BILLING_REWARD,
  SET_ENABLE_POPUP,
  SET_BILLING_TIME_EVENTS,
  SET_FIRST_FAVORITE_AWARD,
  SET_OPEN_CHANNEL_DIRECT_STREAM,
  SET_TOTAL_STAR_BALANCE,
  SET_SUBSCRIPTION_TYPE,
} from '../shared/constants';
import { BillingEvents, RewardInfo, RewardPopup, SubscriptionTypes } from '../../shared/types';

export function setEnableRewardPopup(value: Partial<RewardPopup>) {
  return {
    type: SET_ENABLE_POPUP,
    payload: { ...value }
  };
}

export function setDailyVisitReward(value: Partial<RewardInfo>) {
  return {
    type: SET_BILLING_REWARD,
    payload: { ...value }
  };
}

export function setBillingAvatarReward(value: Partial<RewardInfo>) {
  return {
    type: SET_BILLING_AVATAR_REWARD,
    payload: { ...value }
  };
}

export function setFirstFavoriteReward(value: Partial<RewardInfo>) {
  return {
    type: SET_FIRST_FAVORITE_AWARD,
    payload: { ...value }
  };
}

export function setTotalStarBalance(value: Partial<RewardInfo>) {
  return {
    type: SET_TOTAL_STAR_BALANCE,
    payload: { ...value }
  };
}

export function setOpenChannelDirectStream(value: Partial<RewardInfo>) {
  return {
    type: SET_OPEN_CHANNEL_DIRECT_STREAM,
    payload: { ...value }
  };
}

export function setBillingTimeEvents(value: BillingEvents[]) {
  return {
    type: SET_BILLING_TIME_EVENTS,
    payload: value
  };
}

export function setSubscriptionTypes(value: SubscriptionTypes[]) {
  return {
    type: SET_SUBSCRIPTION_TYPE,
    payload: value
  };
}