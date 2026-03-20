import {SET_ROOM_TEST} from '../shared/constants';
import {RoomTest} from '../shared/types';

export function setRoomTest(value: RoomTest) {
  return {
    type: SET_ROOM_TEST,
    payload: value
  }
}
