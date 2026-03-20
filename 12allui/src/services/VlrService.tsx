import BaseService from './BaseService';
import {
  DbImage,
  FreeVlrListResponse,
  FreeVlrResponse,
  MapPublicId,
  PatchChannelMetaData,
  RoomLayout,
  VlrBlockedIp,
  Vlr,
  VlrResponse,
  VlrTemplate,
  VlrUpcoming
} from '../shared/types';
import axios, {AxiosError} from 'axios';
import {VertoLayout} from '../verto/types';

export type UpdateMetadata = {
  roomId: string,
  streamCamera: boolean,
  streamId?: number | string | null,
  vodId?: number | string | null,
  streamUrl: string | null,
  isPrivate: boolean,
  channelLogo: string | null,
  channelName: string | null,
  channelGenre: string | null,
  channelDescription: string | null,
  channelLanguage: string | null,
  isVlr?: boolean,
  isHost?: boolean,
  userId?: number
}

export class VlrService extends BaseService {
  static updateMetadata(data: UpdateMetadata) {
    return this.postWithAuth<{fs_url: string, moderator_username: string, moderator_password: string, up_speed_url: string}>('/vlr/update-meta-data', data);
  }

  static patchMetadata(data: PatchChannelMetaData) {
    return this.patch('/vlr/update-meta-data', data);
  }

  static updateMetaDataTv(data: any) {
    return this.post<string>('/vlr/update-meta-data', data);
  }

  static sendFinalPing(publicId: string, userId: number) {
    return this.post('/vlr-final-ping', {publicId, userId});
  }

  static getFreeVlrList() {
    return this.postWithAuth<FreeVlrListResponse>('/vlr-free-list');
  }

  static getFreeVlr() {
    return this.postWithAuth<FreeVlrResponse>('/vlr-free');
  }

  static getFreeVlrTv(data: {token: string, phoneNumber: string}) {
    return this.post<FreeVlrResponse>('/vlr-free', data);
  }

  static createVlr() {
    return this.postWithAuth<VlrResponse>('/vlr-create-new');
  }

  static mapVlrPublicId(publicId: string) {
    return this.getWithAuth<MapPublicId>(`/vlr/map-public-id?public_id=${publicId}`);
  }

  static changeHost({participantId, roomId}: { participantId: string, roomId: string }) {
    return this.post<{ status: string }>('/vlr/change-host', {hostId: participantId, roomId});
  }

  static checkIfVlrIsFree(roomId: string) {
    return this.postWithAuth<{ status: 'free' | { room_id: string, public_id: string, room_layout?: RoomLayout } }>('/vlr/check-if-free', {roomId});
  }

  static getAllCoHosts(roomId: string) {
    return this.post<{ coHosts: string }>('/vlr/all-co-hosts', {roomId});
  }

  static addCoHost(roomId: string, participantId: string) {
    return this.post<{ status: string }>('/vlr/add-co-host', {roomId, coHostId: participantId});
  }

  static removeCoHost(roomId: string, participantId: string) {
    return this.post<{ status: string }>('/vlr/remove-co-host', {roomId, coHostId: participantId});
  }

  static removeAllHosts(roomId: string, userId: number, publicRoomId: string) {
    return this.post<{ status: string }>('/vlr/remove-all-hosts', {roomId, userId, publicRoomId});
  }

  static blockIp(callId: string) {
    return this.postWithAuth<{ status: string }>('/vlr-blocked-ips', {uuid: callId});
  }

  static blockDevice(vlrId: string, deviceId: string) {
     return this.postWithAuth<{ status: string }>('/vlr-blocked-device-ids', {vlrId, deviceId});
  }

  static reportUser(data: { message: string, callId: string, reportedUserId?: number }) {
    return this.postWithAuth<{ status: string }>('/vlr-report-user', data);
  }

  static getBlockedIps(roomPublicId: string) {
    return this.getWithAuth<{ blocked_ips: VlrBlockedIp[] }>(`/vlr-blocked-ips-vlr/${roomPublicId}`);
  }

  static removeBlockedIps(publicRoomId: string, ips: string[]) {
    return this.postWithAuth<{ blocked_ips: VlrBlockedIp[] }>(`/remove-vlr-blocked-ips`, {publicRoomId, ips});
  }

  static getTemplates() {
    return this.getWithAuth<VlrTemplate[]>('/vlr-templates');
  }

  static createTemplate(template: FormData) {
    return this.postWithAuth<VlrTemplate>('/vlr-templates', template);
  }

  static updateTemplate(template: FormData, id: number) {
    return this.putWithAuth<VlrTemplate>(`/vlr-templates/${id}`, template);
  }

  static deleteTemplate(id: number) {
    return this.deleteWithAuth<VlrTemplate>(`/vlr-templates/${id}`);
  }

  static changeSelectedTemplate(id?: number) {
    return this.postWithAuth<VlrTemplate>('/vlr-templates-select', {id});
  }

  static addLogo(data: FormData) {
    return this.postWithAuth<{logo: DbImage}>('/vlr-logos', data);
  }

  static inviteAllToMyRoom(publicId: string) {
    return this.postWithAuth<{status: string}>('/vlr-invite-all', {publicId});
  }

  static updateVlrLayout(layout: VertoLayout, roomId: string) {
    return this.post<{ status: string }>('/vlr-update-layout', {layout, roomId});
  }

  static getLiveAndUpcoming(params?: string) {
    let url = '/vlr-live-upcoming';
    if (params) {
      url += `?${params}`;
    }
    return this.get<{ live: Vlr[], upcoming: VlrUpcoming[] }>(url);
  }

  static handleMapIdError(err: Error | AxiosError) {
    let message = 'common.unexpectedError';
    if (axios.isAxiosError(err) && (err.response?.data as any).message === 'blocked_from_entering') {
      message = 'notifications.blockedToEnterRoom';
    }
    return message;
  }
}
