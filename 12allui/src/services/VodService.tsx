import BaseService from './BaseService';
import {CreateChannelData, EditChannelData, EpgEntry, InitChannelBillingData, SharedStream, SharedStreamTestResponse, SharedStreamVlrs, SharedVodVlrs} from '../shared/types';
import {VodChannelItem, VodState} from "../redux/reducers/vodReducers";
import {API_URL, VOD_FILE_HOST} from "../shared/constants";

export class VodService extends BaseService {

  static getAllVodChannel() {
    return this.getWithAuth<VodChannelItem[]>('/shared-streams/user-vod-channels');
  }

  static getAllVod(scope: string | null = "own") {
    return this.getWithAuth<VodState[]>('/shared-vod?type=' + (scope !== null ?  scope : "all"));
  }

   static getFilteredVoD(params: string, signal?: AbortSignal) {
    const vodUrl = `/shared-vod?${params}`;
    return  this.getWithAuthIfApplicable<VodState[]>(vodUrl, signal);
  }

  
  static searchVod(query: string | null) {
    return this.getWithAuth<VodState[]>('/shared-vod?name=' + query);
  }

  static saveVod(data: FormData) {
    return this.postWithAuth('/shared-vod', data);
  }

  static saveChannel(data: CreateChannelData) {
    return this.postWithAuth('/shared-streams/create-vod-stream', data);
  }

  static editChannel(data: EditChannelData, id: number) {
    return this.putWithAuth<VodState>(`/shared-streams/${id}`, data);
  }

   static addBillingToChannel(sharingMode: string, rewardAmount: number, channelId: number | string) {
    const initBillingData: InitChannelBillingData= {
        eventType: "entry.create",
        modelName: "vlr",
        entryObj: {
            price: sharingMode === 'paid'? rewardAmount : 0, // (0 if free)
            isChannel: true,
            room_id: channelId
        }
    }
    return this.postWithAuth('/billings/event-hooks', initBillingData);
  }


  static getFile() {
    return this.postWithAuth('/shared-vod-file-upload', {});
  }

  static getRecordedVideoFile(recordId: string){
    return this.get(`/vlr/recording?recordingId=${recordId}`)
  }

  static uploadFile(fileId: string | undefined, data: FormData) {
    return this.postBaseWithAuth(`${VOD_FILE_HOST}/api/file?urlBackend=${API_URL}/&name=` + fileId, data);
  }

  static editVod(data: FormData, id: number) {
    return this.putWithAuth<VodState>(`/shared-vod/${id}`, data);
  }

  static deleteVod(vodId: number) {
    return this.deleteWithAuth<{ status: string, message: string }>(`/shared-vod/${vodId}`);
  }

  static getVod(vodId: number) {
    return this.getWithAuth<VodState>(`/shared-vod/${vodId}`);
  }

  static getVideoOnDemand(vodId: number) {
    return this.getWithAuth<SharedVodVlrs>(`/shared-vod/${vodId}`);
  }


}
