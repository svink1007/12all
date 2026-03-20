import BaseService from './BaseService';
import {RoomLayout} from '../shared/types';

export class RoomLayoutService extends BaseService {
  static getLayouts() {
    return this.get<RoomLayout[]>('/room-layouts?_sort=default:DESC');
  }

  static getDefaultLayout() {
    return this.get<RoomLayout>('/default-room-layout');
  }
}
