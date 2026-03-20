import BaseService from "./BaseService";
import {
  RewardInfo,
  BillingStarsTable,
  ReferralItem,
  ReferralList,
  ReferralRemind,
  BillingInfo,
  ConversionTopUpAndCashOut,
  BillingEvents,
  SubscriptionTypes,
  SubscriptionStar,
  SubscribeWithStars,
  StarPackages,
} from "../shared/types";

export class BillingServices extends BaseService {
  static billingEvent(
    currClientDate: string,
    userId: number,
    eventType: string
  ) {
    return this.postWithAuth<{ status: string; result: RewardInfo }>(
      "/billings/billing-event-reward",
      { currClientDate: currClientDate, userId: userId, eventType: eventType }
    );
  }

  static billingAvatarReward(
    userId: number,
    eventType: string,
    hasUploadedAvatar: boolean
  ) {
    return this.postWithAuth<{ status: string; result: RewardInfo }>(
      "/billings/billing-avatar-reward",
      {
        userId: userId,
        eventType: eventType,
        hasUploadedAvatar: hasUploadedAvatar,
      }
    );
  }

  static billingFavorite(userId: number, eventType: string) {
    return this.postWithAuth<{ status: string; result: RewardInfo }>(
      "/billings/billing-favourite-reward",
      { userId: userId, eventType: eventType }
    );
  }

  static billingStarsStatusTable(
    userId: number,
    page: number,
    pageSize: number
  ) {
    return this.postWithAuth<{
      status: string;
      userId: number;
      result: BillingStarsTable;
    }>("/billings/billing-stars-table", {
      userId: userId,
      page: page,
      pageSize: pageSize,
    });
  }

  static billingStarBalance(userId: number) {
    return this.postWithAuth<{ status: string; starsBalance: number }>(
      "/billings/billing-stars-balance",
      { userId: userId }
    );
  }

  static addReferral(referralList: ReferralItem[]) {
    return this.postWithAuth<{
      status: string;
      result: ReferralList[];
      errorMessage: string;
    }>("/referrals/add-referral", { referralList: referralList });
  }

  static getReferral(userId: number) {
    return this.getWithAuth<{
      status: string;
      result: ReferralItem[];
      errorMessage: string;
    }>(`/referrals/get-referral/${userId}`);
  }

  static remindReferral(referralId: number) {
    return this.postWithAuth<{ status: string; result: ReferralRemind }>(
      "/referrals/remind-referral",
      { referralId: referralId }
    );
  }

  static updateReferral(referralId: number) {
    return this.putWithAuth<{ status: string; result: boolean }>(
      "/referrals/update-referral",
      { referralId: referralId }
    );
  }

  static addBillingInfo(billingInfo: BillingInfo) {
    return this.postWithAuth<{ status: string }>("/billings/add-billing-info", {
      ...billingInfo,
    });
  }

  static updateBillingInfo(billingInfo: BillingInfo) {
    return this.postWithAuth<{ status: string }>(
      "/billings/update-billing-info",
      { ...billingInfo }
    );
  }

  static getBillingInfo(userId: number) {
    return this.postWithAuth<{ status: string; result: BillingInfo }>(
      "/billings/get-billing-info",
      { userId }
    );
  }

  static getConversionRateTopUp(stars: number) {
    return this.postWithAuth<{
      status: string;
      result: ConversionTopUpAndCashOut;
    }>("/billings/get-conversion-top-up", { stars });
  }

  static getConversionRateTopUp2(stars: number) {
    return this.postWithAuth<{
      status: string;
      result: ConversionTopUpAndCashOut;
    }>("/billings/get-conversion-cash-out", { stars });
  }

  static getConversionRateCashOut(stars: number) {
    return this.postWithAuth<{
      status: string;
      result: ConversionTopUpAndCashOut;
    }>("/billings/get-conversion-cash-out", { stars });
  }

  static getBillingEvents() {
    return this.postWithAuth<{ status: string; result: Array<BillingEvents> }>(
      "/billings/billing-event-time"
    );
  }

  static getSubscriptionType() {
    return this.postWithAuth<{
      status: string;
      result: Array<SubscriptionTypes>;
    }>("/billings/get-subscription-type");
  }

  static subscribe() {
    return this.postWithAuth<{
      status: string;
      result: { starPrice: SubscriptionStar };
    }>("/billings/subscribe");
  }

  static subscribeStars(subscriptionTypeId: number, id: string) {
    return this.postWithAuth<{ status: string; result: SubscribeWithStars }>(
      "/billings/subscribe-stars",
      { subscriptionTypeId, id }
    );
  }

  static getStarPackages() {
    return this.postWithAuth<{ status: string; result: StarPackages[] }>(
      "/billings/get-star-packages"
    );
  }

  static getRoomPrice(roomId: string) {
    return this.postWithAuth<{
      status: string;
      result: { stars: number } | "";
    }>("/billings/get-room-price", { externalRoomId: roomId });
  }

  static payRoomPrice(id: number, roomId: string) {
    return this.postWithAuth<{ status: string; result: { newUserBalance: number, status: string } }>(
      "/billings/pay-room-price",
      { externalClientId: id, externalRoomId: roomId }
    );
  }

  static addRoomPrice(publicId: string, roomPrice: number) {
    return this.postWithAuth<{ status: string; result: { stars: number } }>(
      "/billings/add-room-price",
      { publicId, roomPrice }
    );
  }

  static isRoomPaid(id: number, roomId: string) {
    return this.post<{ status: string; result: { paid: boolean } }>(
      "/billings/is-room-paid",
      { externalClientId: id, externalRoomId: roomId }
    );
  }
  static giftUsers(payerExternalId: number, receiverExternalIds: number, amount: number) {
    return this.postWithAuth<{status: string; result: any}>(
      "/billings/gift-stars",
      {
        amount:amount,
        payerExternalId:payerExternalId,
        receiverExternalIds:[receiverExternalIds]
      }
    )
  }

  
}
