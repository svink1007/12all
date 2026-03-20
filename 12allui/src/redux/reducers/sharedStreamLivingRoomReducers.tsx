import {SET_SHARED_STREAM_LIVING_ROOM} from '../shared/constants';
import {Action, SharedStreamLivingRoom} from '../shared/types';

const INITIAL: SharedStreamLivingRoom = {
  fsUrl: '',
  mappedRoomId: '',
  isPremium: false,
  publicRoomId: '',
  moderatorUsername: '',
  moderatorPassword: '',
  streamUrl: '',
  channelIsActive: false
};

export default function reducer(state: SharedStreamLivingRoom = INITIAL, {
  type,
  payload
}: Action<SharedStreamLivingRoom>) {
  switch (type) {
    case SET_SHARED_STREAM_LIVING_ROOM:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
