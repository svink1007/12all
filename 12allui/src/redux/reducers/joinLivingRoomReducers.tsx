import {SET_JOIN_LIVING_ROOM} from '../shared/constants';
import {Action, JoinLivingRoom} from '../shared/types';

const INITIAL: JoinLivingRoom = {
  username: '',
  mic: '',
  cam: '',
  channelLogo: null,
  fsUrl: '',
  publicRoomId: '',
  mappedRoomId: ''
};

export default function reducer(state: JoinLivingRoom = INITIAL, {type, payload}: Action<JoinLivingRoom>
) {
  switch (type) {
    case SET_JOIN_LIVING_ROOM:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
