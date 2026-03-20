import BaseService from './BaseService';
import {Partner} from '../shared/types';

export class PartnerService extends BaseService {
  static getPartners() {
    return this.getWithAuth<Partner[]>('/partners');
  }
}
