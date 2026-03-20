import {SET_LOGIN, SET_LOGOUT} from '../shared/constants';
import {Action, Profile} from '../shared/types';
import BaseService from '../../services/BaseService';

const INITIAL: Profile = {
  id: 0,
  jwt: "",
  email: "",
  isOverEighteen: false,
  hasConfirmedPhoneNumber: false,
  username: "",
  nickname: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  preferredGenre: "",
  preferredLanguage: "",
  showDebugInfo: false,
  isAnonymous: false,
  countryOfResidence:"",
  birthday:"",
  location:"",
  gender:"",
  about_me:"",
  is_private: false,
};

export default function reducer(
  state: Profile = INITIAL,
  {type, payload}: Action<Profile>
) {
  switch (type) {
    case SET_LOGIN:
      if (payload.jwt) {
        BaseService.setJwt(payload.jwt);
      }

      return {
        ...state,
        ...payload,
      };
    case SET_LOGOUT:
      BaseService.setJwt(INITIAL.jwt);
      return INITIAL;
    default:
      return state;
  }
}
