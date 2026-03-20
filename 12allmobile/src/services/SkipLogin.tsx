import BaseService from "./BaseService";

export class SkipLogin extends BaseService {
  static getLogin(uniqueToken?: string, nickname?: string) {
    let url = "/skip-login-web";
    const params = new URLSearchParams();
    
    if (uniqueToken) {
      params.append("uniqueToken", uniqueToken);
    }
    
    if (nickname) {
      params.append("nickname", nickname);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.get(url);
  }
}
