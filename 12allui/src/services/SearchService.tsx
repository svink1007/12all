import BaseService from './BaseService';
import {SearchType} from '../redux/shared/enums';
import {SearchDTO} from '../redux/shared/types';

export class SearchService extends BaseService {
  static search(type: SearchType, query: string) {
    return this.getWithAuthIfApplicable<SearchDTO>(`/search?os=web&type=${type}&query=${query}`);
  }
}
