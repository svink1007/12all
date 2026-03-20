import BaseService from './BaseService';
import {EpgEntry, SharedStream, SharedStreamTestResponse, SharedStreamVlrs} from '../shared/types';

export class StreamService extends BaseService {
  static async getSharedStreams(params?: string, signal?: AbortSignal) {
    const streamsUrl = !params
      ? '/shared-streams?os=web'
      : `/shared-streams?os=web&${params}`;
    return await this.getWithAuthIfApplicable<{ data: SharedStreamVlrs[], pages: number }>(streamsUrl, signal);
  }

  static getAll() {
    return this.getWithAuth<SharedStreamTestResponse[]>('/shared-streams/all');
  }

  static saveStream(data: FormData) {
    return this.postWithAuth('/shared-streams', data);
  }

  static sendAdTracking(data: any) {
    return this.postWithAuth('/ad-tracking', data);
  }

  static editStream(data: FormData, id: number) {
    return this.putWithAuth<SharedStream>(`/shared-streams/${id}`, data);
  }

  static deleteStream(streamId: number) {
    return this.deleteWithAuth<SharedStream>(`/shared-streams/${streamId}`);
  }

  static getStream(streamId: number) {
    return this.getWithAuth<SharedStreamVlrs>(`/shared-streams/${streamId}`);
  }

  static updatePlayedSuccessfully(streamId: number, playedSuccessfully: boolean) {
    return this.postWithAuth<SharedStreamTestResponse>('/shared-streams/played-successfully', {
      id: streamId,
      playedSuccessfully
    });
  }

  static requestAstraStreamOpening(streamUrl: string) {
    return this.postWithAuth('/shared-streams/astra-control', {url: streamUrl});
  }

  static getEpgEntries(epgChannelId: number) {
    return this.get<EpgEntry[]>(`/shared-streams-epg-entries/${epgChannelId}`);
  }
}
