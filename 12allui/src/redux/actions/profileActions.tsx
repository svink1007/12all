import {SET_LOGIN, SET_LOGOUT} from '../shared/constants';
import {Profile} from '../shared/types';

export function setLogin(value: Partial<Profile>) {
  return {
    type: SET_LOGIN,
    payload: value
  }
}

export function setLogout() {
  return {
    type: SET_LOGOUT
  }
}
