import BaseService from "./BaseService";
import { PUSH_NOTIFICATION_APP_NAME } from "../shared/constants";

export default class PushNotificationsService extends BaseService {
  static addToken(registrationToken: string) {
    return this.postWithJwtToken<{ status: string }>(
      "/push-notification-tokens",
      { registrationToken, app: PUSH_NOTIFICATION_APP_NAME }
    );
  }
}
