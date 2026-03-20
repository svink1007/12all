import BaseService from './BaseService';
import {FsResolution} from '../shared/types';

export class FsRoomResolutionService extends BaseService {
  static getResolutions() {
    return this.get<FsResolution[]>('/fs-room-resolutions?_sort=resolution:desc');
  }
}
