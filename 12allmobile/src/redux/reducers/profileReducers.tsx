import { RESET_PROFILE, SET_PROFILE, LOGOUT_USER } from "../types/types";
import { Action, Profile, ReceiveCodeVia } from "../types";
import BaseService from "../../services/BaseService";
import { Gender } from "../../shared/enums";

const INITIAL: Profile = {
  id: 0,
  nickname: "",
  username: "",
  token: "",
  avatar: null,
  phoneNumber: "",
  gender: Gender.Man,
  preferredGenre: "",
  preferredLanguage: null,
  countryOfResidence: "",
  premium: false,
  isOverEighteen: false,
  isAuthenticated: false,
  codeProvider: ReceiveCodeVia.Sms,
  showDebugInfo: false,
  firstName: "",
  lastName: "",
  email: "",
  birthday: "",
  about_me: "",
  location: "",
  is_private: false,
  jwtToken: "",
};

export default function reducer(
  state: Profile = INITIAL,
  { type, payload }: Action<Profile>
): Profile {
  switch (type) {
    case SET_PROFILE:
      const newState = {
        ...state,
        ...payload,
      };
      newState.isAuthenticated = !!(newState.token && newState.phoneNumber);
      return newState;
    case RESET_PROFILE:
      BaseService.resetAuth();
      return INITIAL;
    case LOGOUT_USER:
      BaseService.resetAuth();
      return INITIAL;
    default:
      return state;
  }
}
