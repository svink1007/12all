import BaseService from './BaseService';
import {SharedSiteResponse} from '../shared/types';

export class SharedSitesService extends BaseService {
  static getSharedSites() {
    return this.get<SharedSiteResponse[]>('/shared-sites');
  }
}
