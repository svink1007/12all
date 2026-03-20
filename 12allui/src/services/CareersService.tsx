import BaseService from './BaseService';

export class CareersService extends BaseService {
  static getAll() {
    return this.getWithAuthIfApplicable<any>('/careers')
  }

  static getCareer(id: string) {
    return this.get(`/careers?id=${id}`);
  }
}
