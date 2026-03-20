import BaseService from './BaseService';
import {Promotion, Vlr} from '../shared/types';

type HomePageResponse = {
  channels: Vlr[];
  promotions: Promotion[];
};

export class HomeService extends BaseService {
  static getHomePage() {
    return this.get<HomePageResponse>('/home-page');
  }
}
