import BaseService from "./BaseService";
import { FavoritesResponse, UserDb, RecaptchaResponse } from "../shared/types";
import { isPlatform } from "@ionic/react";
import { appVersion } from "../shared/variables";
import { Profile } from "../redux/types";

export class UserManagementService extends BaseService {
  static addFavoriteChannel(channelId: number) {
    return this.postWithJwtToken("/user-management/add-favorite-channel", {
      channelId,
    });
  }

  static removeFavoriteChannel(channelId: number) {
    return this.postWithJwtToken("/user-management/remove-favorite-channel", {
      channelId,
    });
  }

  static addFavoriteStream(streamId: number) {
    return this.postWithJwtToken("/user-management/add-favorite-stream", {
      streamId,
    });
  }

  static removeFavoriteStream(streamId: number) {
    return this.postWithJwtToken("/user-management/remove-favorite-stream", {
      streamId,
    });
  }

  static getUserData() {
    return this.postWithJwtToken<{ status: string; result: UserDb }>(
      "/user-management/get-user-data"
    );
  }

  static getUsernameByPhoneNumber(phoneNumber: string) {
    return this.get<{ username: string | null }>(
      `/user-management/username?phoneNumber=${phoneNumber}`
    );
  }
  static removeProfile() {
    return this.deleteWithJwtToken("/user-management");
  }

  static updateAdvertisingId(advertisingId: string) {
    const android = "android";
    const ios = "ios";
    const os = isPlatform(android) ? android : isPlatform(ios) ? ios : null;
    if (!os) {
      throw new Error("Unsupported os");
    }

    return this.postWithJwtToken("/user-management/update-advertising-id", {
      advertisingId,
      os,
    });
  }

  static validatePhoneNumber(phoneNumber: string) {
    return this.post("/user-management/validate-phone-number", { phoneNumber });
  }

  static sendConfirmationCodeViaSms(
    phoneNumber: string,
    recaptchaToken: string,
    countryName: string,
    registration: boolean
  ) {
    return this.post<{
      status: string;
      confirmed?: { token: string; user: UserDb };
    }>("/user-management/send-confirmation-code-sms", {
      phoneNumber,
      recaptchaToken,
      countryName,
      registration,
    });
  }

  static sendConfirmationCodeViaCall(
    phoneNumber: string,
    recaptchaToken: string,
    registration: boolean
  ) {
    return this.post<{
      status: string;
      confirmed?: { token: string; user: UserDb };
    }>("/user-management/send-confirmation-code-call", {
      phoneNumber,
      recaptchaToken,
      registration,
    });
  }

  static getPhoneNumberData(phoneNumber: string) {
    return this.post<{ token: string; jwtToken: string }>(
      "/user-management/get-phone-number-data",
      { phoneNumber }
    );
  }

  static confirmCode(
    phoneNumber: string,
    validationCode: string,
    nickname: string
  ) {
    return this.post<{
      status: string;
      token?: string;
      user?: UserDb;
      message?: string;
      jwtToken?: string;
      isPasswordReset?: string;
    }>("/user-management/confirm-code", {
      phoneNumber,
      codeValue: validationCode,
      nickname: nickname, // Add nickname to the request body
    });
  }

  static forgotPassword(email: string) {
    return this.post<any>("/auth/forgot-password", { email });
  }

  static updatedUserManagement(data: Partial<Profile>) {
    return this.putWithJwtToken<{ status: string; result: UserDb }>(
      "/user-management",
      data
    );
  }

  static updateUserNickname(nickname: string) {
    return this.putWithJwtToken<{ status: string; result: UserDb }>(
      "/user-management-nickname",
      { nickname }
    );
  }

  static getFavorites(params?: string) {
    const os = isPlatform("android") ? "android" : "ios";
    let url = `/user-management/favorites?os=${os}&v=${appVersion}`;

    if (params) {
      url += `&${params}`;
    }

    return this.postWithJwtToken<FavoritesResponse>(url);
  }

  static getUserCountry() {
    return this.get<{ iso: string | null }>("/user-management/get-country");
  }

  static appLogin(phoneNumber: string, countryName: string, nickname: string) {
    return this.post<any>("/user-management/app-login", {
      phoneNumber,
      countryName,
      nickname,
    });
  }

  static verifyRecaptcha(data: { token: string }) {
    return this.post<RecaptchaResponse>("/recaptchas", data);
  }
}
