import BaseService from "./BaseService";
import {
  FreeVlrResponse,
  MapPublicId,
  PatchChannelMetaData,
  UpdateMetadata,
  Vlr,
  VlrBlockedIp,
  VlrResponse,
  VlrUpcoming,
} from "../shared/types";
import axios, { AxiosError } from "axios";
import { PUSH_NOTIFICATION_APP_NAME } from "../shared/constants";
import { VertoLayout } from "../verto/types";
import { FreeVlrListResponse } from "../redux/types";

export class VlrService extends BaseService {
  static updateMetadata(data: UpdateMetadata) {
    return this.postWithJwtToken("/vlr/update-meta-data", data);
  }

  static sendFinalPing(publicId: string, userId: number) {
    return this.post("/vlr-final-ping", { publicId, userId });
  }

  static patchMetadata(data: PatchChannelMetaData) {
    return this.patch("/vlr/update-meta-data", data);
  }

  static getFreeVlr() {
    return this.postWithJwtToken<FreeVlrResponse>("/vlr-free");
  }

  static getFreeVlrList() {
    return this.postWithJwtToken<FreeVlrListResponse>("/vlr-free-list");
  }

  static getBlockedIps(roomPublicId: string) {
    return this.getWithAuth<{ blocked_ips: VlrBlockedIp[] }>(
      `/vlr-blocked-ips-vlr/${roomPublicId}`
    );
  }

  static mapVlrPublicId(publicId: string) {
    return this.get<MapPublicId>(`/vlr/map-public-id?public_id=${publicId}`);
  }

  static createVlr() {
    return this.postWithJwtToken<VlrResponse>("/vlr-create-new");
  }

  static handleMapIdError(err: Error | AxiosError) {
    let message = "notifications.unexpectedError";
    if (
      axios.isAxiosError(err) &&
      (err.response?.data as any).message === "blocked_from_entering"
    ) {
      message = "userLivingRoom.blockedToEnterRoom";
    }
    return message;
  }

  static inviteAllToMyRoom(publicId: string) {
    return this.postWithJwtToken<{ status: string }>("/vlr-invite-all", {
      publicId,
      app: PUSH_NOTIFICATION_APP_NAME,
    });
  }

  static updateVlrLayout(layout: VertoLayout, roomId: string) {
    return this.post<{ status: string }>("/vlr-update-layout", {
      layout,
      roomId,
    });
  }

  static getLiveAndUpcoming(params?: string) {
    let url = "/vlr-live-upcoming";
    if (params) {
      url += `?${params}`;
    }
    return this.get<{ live: Vlr[]; upcoming: VlrUpcoming[] }>(url);
  }
}
