import BaseService from "./BaseService";
import { EpgEntry, SharedStream, SharedStreamVlrs } from "../shared/types";
import { appVersion } from "../shared/variables";
import { isPlatform } from "@ionic/react";
import axios from "axios";

export class StreamService extends BaseService {
  static countryOfResidence: string | null = null;

  static getStreams(params?: string) {
    const os = isPlatform("android") ? "android" : "ios";
    let url = `/shared-streams?v=${appVersion}&os=${os}`;

    if (params) {
      url += `&${params}`;
    }

    if (this.countryOfResidence) {
      url += `&residence=${this.countryOfResidence}`;
    }

    return this.getWithAuth<{ data: SharedStream[]; pages: number }>(url);
  }

  static saveStream(data: FormData) {
    // if we use 'this', error is thrown
    return BaseService.postWithAuthForm<SharedStream>("/shared-streams", data);
  }

  static editStream(data: FormData, streamId: number) {
    // if we use 'this', error is thrown
    return BaseService.putWithAuthForm<SharedStream>(
      `/shared-streams/${streamId}`,
      data
    );
  }

  static deleteStream(streamId: number) {
    // if we use 'this', error is thrown
    return BaseService.deleteWithJwtToken(`/shared-streams/${streamId}`);
  }

  static getStream(streamId: string) {
    return this.getWithAuth<SharedStreamVlrs>(`/shared-streams/${streamId}`);
  }

  static getStreamConstrains() {
    return this.get<{ width: number; height: number }>(
      "/shared-streams/stream-constrains"
    );
  }

  static updateLastActive(streamId: number) {
    return this.postWithJwtToken<SharedStream>("/shared-streams/last-active", {
      id: streamId,
    });
  }

  static openStream(streamUrl: string) {
    return axios.get(
      `https://wp.12all.tv:443/WebConf/astraControl?url=${streamUrl}`
    );
  }

  static requestAstraStreamOpening(streamUrl: string) {
    return this.postWithJwtToken("/shared-streams/astra-control", {
      url: streamUrl,
    });
  }

  static getEpgEntries(epgChannelId: number) {
    return this.get<EpgEntry[]>(`/shared-streams-epg-entries/${epgChannelId}`);
  }
}
