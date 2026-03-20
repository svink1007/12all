import {SET_SIGN_UP_DATA} from '../shared/constants';
import {Action, SignUpRedux} from '../shared/types';

const INITIAL: SignUpRedux = {
  email: '',
  password: '',
  phoneNumber: '',
  nickname: '',
  has_confirmed_is_over_eighteen: false
};

export default function reducer(state: SignUpRedux = INITIAL, {type, payload}: Action<SignUpRedux>) {
  switch (type) {
    case SET_SIGN_UP_DATA:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
