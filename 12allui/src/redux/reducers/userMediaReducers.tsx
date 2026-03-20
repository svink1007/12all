import {SET_USER_MEDIA} from '../shared/constants';
import {Action, UserMedia} from '../shared/types';

const INITIAL: UserMedia = {
  cam: 'none',
  mic: 'any'
};

export default function reducer(state: UserMedia = INITIAL, {type, payload}: Action<UserMedia>) {
  switch (type) {
    case SET_USER_MEDIA:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
