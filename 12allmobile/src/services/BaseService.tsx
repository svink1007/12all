import { API_URL } from "../shared/constants";
import axios from "axios";

export default class BaseService {
  private static token = "";
  private static phoneNumber = "";
  private static jwtToken = "";

  static setJwt(jwt: string) {
    this.jwtToken = jwt;
  }

  static getJwtToken(): string {
    return this.jwtToken;
  }

  static parseJwt(token: string) {
    if (!token) {
      return;
    }
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(window.atob(base64));
  }

  static isExpired(token: string | undefined) {
    const now = new Date().getTime();
    if (!token) {
      return true;
    }
    return this.parseJwt(token)?.exp * 1000 < now ? true : false;
  }

  static setAuth({
    token,
    phoneNumber,
    jwtToken,
  }: {
    token: string;
    phoneNumber: string;
    jwtToken?: string;
  }) {
    this.token = token ?? "";
    this.phoneNumber = phoneNumber;
    this.jwtToken = jwtToken ?? "";
  }

  static clearAuth() {
    this.token = "";
    this.phoneNumber = "";
    this.jwtToken = "";
  }

  static resetAuth() {
    this.token = "";
    this.phoneNumber = "";
    this.jwtToken = "";
  }

  protected static get<T = any>(path: string) {
    return axios.get<T>(`${API_URL}${path}`);
  }

  protected static getWithAuth<T = any>(path: string) {
    if (this.token && this.phoneNumber) {
      const hasParams = /\?/.test(path);
      const separator = hasParams ? "&" : "?";
      return axios.get<T>(
        `${API_URL}${path}${separator}token=${this.token}&phoneNumber=${this.phoneNumber}`
      );
    }

    return axios.get<T>(`${API_URL}${path}`);
  }

  protected static getWithJwtToken<T = any>(path: string, data: any = null) {
    const config = this.jwtToken
      ? {
          headers: {
            Authorization: `Bearer ${this.jwtToken}`,
          },
        }
      : {};

    return axios.get<T>(
      `${API_URL}${path}`,

      config
    );
  }

  protected static post<T = any>(path: string, data: any = null) {
    return axios.post<T>(`${API_URL}${path}`, data);
  }

  protected static postWithAuth<T = any>(path: string, data: any = null) {
    return axios.post<T>(`${API_URL}${path}`, this.appendAuthToData(data));
  }

  protected static postWithJwtToken<T = any>(path: string, data: any = null) {
    const config = this.jwtToken
      ? {
          headers: {
            Authorization: `Bearer ${this.jwtToken}`,
          },
        }
      : {};

    return axios.post<T>(
      `${API_URL}${path}`,
      this.appendAuthToData(data),
      config
    );
  }

  protected static patch<T = any>(path: string, data: any = null) {
    return axios.patch<T>(`${API_URL}${path}`, data);
  }

  protected static putWithAuth<T = any>(path: string, data: any = null) {
    return axios.put<T>(`${API_URL}${path}`, this.appendAuthToData(data));
  }

  protected static putWithJwtToken<T = any>(path: string, data: any = null) {
    const config = this.jwtToken
      ? {
          headers: {
            Authorization: `Bearer ${this.jwtToken}`,
          },
        }
      : {};

    return axios.put<T>(
      `${API_URL}${path}`,
      this.appendAuthToData(data),
      config
    );
  }

  protected static patchWithAuth<T = any>(path: string, data: any = null) {
    return axios.patch<T>(`${API_URL}${path}`, this.appendAuthToData(data));
  }

  protected static patchWithJwtToken<T = any>(path: string, data: any = null) {
    const config = this.jwtToken
      ? {
          headers: {
            Authorization: `Bearer ${this.jwtToken}`,
          },
        }
      : {};

    return axios.patch<T>(
      `${API_URL}${path}`,
      this.appendAuthToData(data),
      config
    );
  }

  protected static deleteWithAuth<T = any>(path: string) {
    return axios.delete<T>(
      `${API_URL}${path}?token=${this.token}&phoneNumber=${this.phoneNumber}`
    );
  }

  protected static deleteWithJwtToken<T = any>(path: string) {
    const config = this.jwtToken
      ? {
          headers: {
            Authorization: `Bearer ${this.jwtToken}`,
          },
        }
      : {};

    return axios.delete<T>(
      `${API_URL}${path}?token=${this.token}&phoneNumber=${this.phoneNumber}`,
      config
    );
  }

  protected static postWithAuthForm<T = any>(path: string, data: FormData) {
    return axios.post<T>(`${API_URL}${path}`, this.appendAuthToFormData(data));
  }

  protected static putWithAuthForm<T = any>(path: string, data: FormData) {
    return axios.put<T>(`${API_URL}${path}`, this.appendAuthToFormData(data));
  }

  private static appendAuthToData(data: any = null) {
    return { ...data, token: this.token, phoneNumber: this.phoneNumber };
  }

  private static appendAuthToFormData(data: FormData) {
    data.append("token", this.token);
    data.append("phoneNumber", this.phoneNumber);
    return data;
  }
}
