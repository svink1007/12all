import BaseService from "./BaseService";
import { SharedSiteResponse } from "../shared/types";
import { appVersion } from "../shared/variables";
import { isPlatform } from "@ionic/react";

export class SharedSitesService extends BaseService {
  static getSharedSites() {
    const os = isPlatform("android") ? "android" : "ios";
    return this.get<SharedSiteResponse[]>(
      `/shared-sites?os=${os}&v=${appVersion}`
    );
  }
}
