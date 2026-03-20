import BaseService from './BaseService';
import {Genre} from '../shared/types';

export class GenreService extends BaseService {
  static getGenres() {
    return this.get<Genre[]>('/genres');
  }
}
