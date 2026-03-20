import {SET_IN_ROOM} from '../shared/constants';
import {Action, InRoom} from '../shared/types';

const INITIAL: InRoom = {
  isCoHost: false,
  loadingStream: false,
  sharingInProgress: false
};

export default function reducer(state = INITIAL, {type, payload}: Action<InRoom>) {
  switch (type) {
    case SET_IN_ROOM:
      const data: InRoom = {
        ...state,
        ...payload
      };

      return data;
    default:
      return state;
  }
}
