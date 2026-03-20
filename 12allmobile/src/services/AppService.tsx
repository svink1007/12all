import { AppConfig } from "../redux/types";
import BaseService from "./BaseService";

export default class AppService extends BaseService {
  static getAppConfig() {
    return this.get<AppConfig>("/app-config");
  }
}
