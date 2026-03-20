import {SET_SHARED_STREAM_LIVING_ROOM} from '../shared/constants';
import {SharedStreamLivingRoom} from '../shared/types';

export default function setSharedStreamLivingRoom(value: Partial<SharedStreamLivingRoom>) {
  return {
    type: SET_SHARED_STREAM_LIVING_ROOM,
    payload: value
  }
}
