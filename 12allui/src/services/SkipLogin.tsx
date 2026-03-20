import BaseService from './BaseService';



export class SkipLogin extends BaseService {
  
  private static getOrCreateSkipLoginToken(): string {
    let skipLoginToken = localStorage.getItem('skipLoginToken');
    if (!skipLoginToken) {
      skipLoginToken = crypto.randomUUID();
      localStorage.setItem('skipLoginToken', skipLoginToken);
    }
    return skipLoginToken;
  }

  static getLogin(name: string = '') {
    const skipLoginToken = this.getOrCreateSkipLoginToken();
    return this.get(`/skip-login-web?uniqueToken=${skipLoginToken}&nickname=${name}`);
  }
}

