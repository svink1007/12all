import BaseService from './BaseService';
import {Channel} from '../shared/types';

export class ChannelsService extends BaseService {
  static getVlrs(params?: string) {
    const path = !params
      ? '/channels'
      : `/channels?${params}`;

    return this.getWithAuthIfApplicable<{ data: Channel[], pages: number }>(path);
  }
}
