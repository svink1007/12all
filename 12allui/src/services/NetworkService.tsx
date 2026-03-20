import {NetworkConfig} from '../redux/shared/types';
import BaseService from './BaseService';

export default class NetworkService extends BaseService {
  static getNetworkConfig() {
    return this.get<NetworkConfig>('/network-configs');
  }
}
