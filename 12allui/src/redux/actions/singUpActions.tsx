import {SET_SIGN_UP_DATA} from '../shared/constants';
import {SignUpRedux} from '../shared/types';

export function setSignUpData(value: SignUpRedux) {
  return {
    type: SET_SIGN_UP_DATA,
    payload: value
  }
}
