import { API_URL } from "../shared/constants";
import axios, { AxiosRequestConfig } from "axios";

export default class BaseService {
  private static jwt = "";

  static setJwt(jwt: string) {
    this.jwt = jwt;
  }

  protected static get<T = any>(path: string) {
    return axios.get<T>(`${API_URL}${path}`);
  }

  protected static getWithAuth<T = any>(path: string) {
    return axios.get<T>(`${API_URL}${path}`, this.useBearer());
  }

  protected static getWithAuthIfApplicable<T = any>(
    path: string,
    signal?: AbortSignal
  ) {
    // const config: AxiosRequestConfig = !!this.jwt ? this.useBearer() : {};
    // if(signal) {
    //   config.signal = signal;
    // }
    const config: AxiosRequestConfig = {
      ...this.useBearer(),
      signal,
    };
    return axios.get<T>(`${API_URL}${path}`, config);
  }

  protected static post<T = any>(path: string, data: any = null) {
    return axios.post<T>(`${API_URL}${path}`, data);
  }

  protected static postWithAuth<T = any>(path: string, data: any = null) {
    return axios.post<T>(`${API_URL}${path}`, data, this.useBearer());
  }

  protected static putWithAuth<T = any>(path: string, data: any = null) {
    return axios.put<T>(`${API_URL}${path}`, data, this.useBearer());
  }

  protected static deleteWithAuth<T = any>(path: string) {
    return axios.delete<T>(`${API_URL}${path}`, this.useBearer());
  }

  protected static patch<T = any>(path: string, data: any = null) {
    return axios.patch<T>(`${API_URL}${path}`, data);
  }

  // private static appendAuthToData(data: any = null) {
  //   return {...data, token: this.token, phoneNumber: this.phoneNumber};
  // }

  static postBaseWithAuth<T = any>(path: string, data: any = null) {
    return axios.post<T>(`${path}`, data, this.useBearer());
  }

  private static useBearer() {
    if (this.jwt) {
      return {
        headers: {
          Authorization: `Bearer ${this.jwt}`,
        },
      };
    }
  }
}
