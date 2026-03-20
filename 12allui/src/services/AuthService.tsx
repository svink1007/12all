import BaseService from "./BaseService";
import { SignUpRedux, SignupDataUsingPhone } from "../redux/shared/types";
import { LoginResponse, RecaptchaResponse, UserData } from "../shared/types";

export class AuthService extends BaseService {
  static registerNewUser(data: SignUpRedux) {
    return this.post("/auth/local/register", data);
  }

  static login(data: { identifier: string; password: string }) {
    return this.post<LoginResponse>("/auth/local", data);
  }

  static loginGoogle(token: string, phoneNumber: string) {
    return this.get<LoginResponse>(
      `/auth/google/callback?access_token=${token}&phone_number=${phoneNumber}`
    );
  }

  static loginFacebook(token: string, phoneNumber: string) {
    return this.get<LoginResponse>(
      `/auth/facebook/callback?access_token=${token}&phone_number=${phoneNumber}`
    );
  }

  static loginWithPhone(signupData: SignupDataUsingPhone) {
    return this.post<{
      status: string;
      confirmed?: { token: string; user: UserData; jwtToken: string };
      error: { code: number; message: string };
    }>("/user-management/app-login", { ...signupData });
  }

  static forgotPassword(email: string) {
    return this.post("/auth/forgot-password", { email });
  }

  static resetPassword(data: {
    code: string;
    password: string;
    passwordConfirmation: string;
  }) {
    return this.post("/custom-auths/reset-password-update", data);
  }

  static verifyRecaptcha(data: { token: string }) {
    return this.post<RecaptchaResponse>("/recaptchas", data);
  }

  static findUser(data: string) {
    return this.get(`/user-management/find-user?identifier=${data}`);
  }
}
