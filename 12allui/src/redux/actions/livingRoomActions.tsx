import {SET_LIVING_ROOM} from '../shared/constants';
import {LivingRoomState} from '../shared/types';

export default function setLivingRoom(value: Partial<LivingRoomState>) {
  return {
    type: SET_LIVING_ROOM,
    payload: value
  }
}
