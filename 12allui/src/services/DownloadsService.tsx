import BaseService from './BaseService';
import {DownloadsResponse} from '../pages/Downloads/types';

export class DownloadsService extends BaseService {
  static getDownloads() {
    return this.get<DownloadsResponse[]>('/downloads');
  }
}
