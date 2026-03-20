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
  ConversionTopUp,
} from "../shared/types";

export class BillingServices extends BaseService {
  static billingStarBalance(userId: number) {
    return this.postWithJwtToken<{ status: string; starsBalance: number }>(
      "/billings/billing-stars-balance",
      { userId: userId }
    );
  }

  static billingStarsStatusTable(
    userId: number,
    page: number,
    pageSize: number
  ) {
    return this.postWithJwtToken<{
      status: string;
      userId: number;
      result: BillingStarsTable;
    }>("/billings/billing-stars-table", {
      userId: userId,
      page: page,
      pageSize: pageSize,
    });
  }

  static addReferral(referralList: ReferralItem[]) {
    return this.postWithAuth<{
      status: string;
      result: ReferralList[];
      errorMessage: string;
    }>("/referrals/add-referral", { referralList: referralList });
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

  static updateStarsBalance = (userId: number) => {
    const result = BillingServices.billingStarBalance(userId).then(
      ({ data }) => {
        return data;
      }
    );

    return result;
  };

  static addBillingInfo(billingInfo: BillingInfo) {
    return this.postWithJwtToken<{ status: string }>(
      "/billings/add-billing-info",
      {
        ...billingInfo,
      }
    );
  }

  static updateBillingInfo(billingInfo: BillingInfo) {
    return this.postWithJwtToken<{ status: string }>(
      "/billings/update-billing-info",
      { ...billingInfo }
    );
  }

  static getBillingInfo(userId: number) {
    return this.postWithJwtToken<{ status: string; result: BillingInfo }>(
      "/billings/get-billing-info",
      { userId }
    );
  }

  static getConversionTopUp = (stars: number) => {
    return this.postWithJwtToken<{
      status: string;
      result: ConversionTopUp;
    }>("/billings/get-conversion-top-up", { stars });
  };

  static getReferral(userId: number) {
    return this.getWithAuth<{
      status: string;
      result: ReferralItem[];
      errorMessage: string;
    }>(`/referrals/get-referral/${userId}`);
  }

  static getRoomPrice(roomId: string) {
    return this.postWithAuth<{
      status: string;
      result: { stars: number } | "";
    }>("/billings/get-room-price", { externalRoomId: roomId });
  }

  static payRoomPrice(id: number, roomId: string) {
    return this.postWithJwtToken<{
      status: string;
      result: { newUserBalance: number; status: string };
    }>("/billings/pay-room-price", {
      externalClientId: id,
      externalRoomId: roomId,
    });
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
}
