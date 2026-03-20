import BaseService from './BaseService';
import {Server} from '../shared/types';

export class ServerService extends BaseService {
  static getServers() {
    return this.getWithAuth<Server[]>('/servers');
  }
}
