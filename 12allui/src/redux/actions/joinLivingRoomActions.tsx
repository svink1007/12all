import {SET_JOIN_LIVING_ROOM} from '../shared/constants';
import {JoinLivingRoom} from '../shared/types';

export default function setJoinLivingRoom(value: JoinLivingRoom) {
  return {
    type: SET_JOIN_LIVING_ROOM,
    payload: value
  }
}
