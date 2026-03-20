import BaseService from "./BaseService";
import { UserDeviceInfo } from "../shared/types";

export default class DeviceService extends BaseService {
  static sendDeviceInfo(data: UserDeviceInfo) {
    return this.postWithJwtToken<{ status: string }>("/device-infos", data);
  }
}
