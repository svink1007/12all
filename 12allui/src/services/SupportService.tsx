import BaseService from './BaseService';

export class SupportService extends BaseService {
  static getAll() {
    return this.getWithAuthIfApplicable('/questions');
  }

  static contactUs(from: string, subject: string, message: string) {
    return this.post('/contact-us', {from, subject, text:message});
  }
}
