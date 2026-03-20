import BaseService from "./BaseService";
import { Channel } from "../shared/types";
import { isPlatform } from "@ionic/react";
import { appVersion } from "../shared/variables";

export class ChannelService extends BaseService {
  static getAllVlrs(params?: string) {
    const os = isPlatform("android") ? "android" : "ios";
    let url = `/channels?os=${os}&v=${appVersion}`;
    if (params) {
      url += `&${params}`;
    }

    return this.getWithAuth<{ data: Channel[]; pages: number }>(url);
  }

  static getChannelByDeepLink(publicId: string) {
    return this.get<Channel>(`/channels/deep-link/${publicId}`);
  }
}
