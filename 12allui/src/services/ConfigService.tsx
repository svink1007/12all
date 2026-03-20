import BaseService from './BaseService';
import {WebConfig} from '../redux/shared/types';

export class ConfigService extends BaseService {
  static getWebConfig() {
    return this.get<WebConfig>('/web-config');
  }
}
