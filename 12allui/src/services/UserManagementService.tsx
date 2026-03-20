import BaseService from './BaseService';
import {Profile} from '../redux/shared/types';
import {Channel, SharedStream, UserData} from '../shared/types';

export class UserManagementService extends BaseService {
  static addFavoriteChannel(channelId: number) {
    return this.postWithAuth('/user-management/add-favorite-channel', {channelId});
  }

  static removeFavoriteChannel(channelId: number) {
    return this.postWithAuth('/user-management/remove-favorite-channel', {channelId});
  }

  static addFavoriteVoD(vodId: number) {
    return this.postWithAuth('/user-management/add-favorite-vod', {vodId});
  }

  static removeFavoriteVoD(vodId: number) {
    return this.postWithAuth('/user-management/remove-favorite-vod', {vodId});
  }
  


  static addFavoriteStream(streamId: number) {
    return this.postWithAuth('/user-management/add-favorite-stream', {streamId});
  }

  static removeFavoriteStream(streamId: number) {
    return this.postWithAuth('/user-management/remove-favorite-stream', {streamId});
  }

  static editProfile(data: Partial<Profile>) {
    return this.putWithAuth('/user-management', data);
  }

  static setDeviceId(id: string) {
    return this.putWithAuth('/user-management/set-device-id', {deviceId: id});
  }

  static removeProfile() {
    return this.deleteWithAuth('/user-management');
  }

  static sendConfirmationCode(phoneNumber: string, recaptchaToken: string, isResend: boolean = false, registration: boolean = false) {
    return this.postWithAuth('/user-management/send-confirmation-code', {phoneNumber, isResend, registration});
    // return this.postWithAuth('/user-management/send-confirmation-code', {phoneNumber, recaptchaToken, isResend, registration});
  }

  static sendConfirmationCodeViaCall(phoneNumber: string, recaptchaToken: string) {
    return this.post<{status: string, confirmed?: {token: string, user: UserData}}>('/user-management/send-confirmation-code-call', {phoneNumber, recaptchaToken});
  }

  static confirmCode(phoneNumber: string | number, validationCode: string) {
    return this.postWithAuth('/user-management/confirm-code', {phoneNumber, codeValue: validationCode});
  }

  static changePassword(currentPassword: string, newPassword: string) {
    return this.postWithAuth('/user-management/password-reset', {otpCode: currentPassword, newPassword: newPassword});
  }

  static validatePhoneNumber(phoneNumber: string) {
    return this.post('/user-management/validate-phone-number', {phoneNumber});
  }

  static getUserData() {
    return this.postWithAuth<{ status: string, result: UserData }>('/user-management/get-user-data');
  }

  static getUserFavorites(params?: string) {
    let url = '/user-management/favorites?os=web';
    if (params) {
      url += `&${params}`
    }
    return this.postWithAuth<{ favorite_channels: Channel[], favorite_streams: SharedStream[], pages: number }>(url);
  }

  static getAvatarList() {
    return this.getWithAuth<{ status: string, result: UserData }>('/avatar/list');
  }

  static accountUpdate(email: string, jwtToken: string, phoneNumber: string) {
    return this.post<{status:string, message: string}>('/user-management/account-update', {email, jwtToken, phoneNumber})
  }
}
