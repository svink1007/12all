import {SET_IN_ROOM} from '../shared/constants';
import {InRoom} from '../shared/types';

export function setInRoom(value: Partial<InRoom>) {
  return {
    type: SET_IN_ROOM,
    payload: value
  }
}
