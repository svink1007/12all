import {SET_ROOM_TEST} from '../shared/constants';
import {Action, RoomTest} from '../shared/types';

const INITIAL: RoomTest = {
  moderatorPassword: '',
  moderatorUsername: '',
  publicId: '',
  streamName: '',
  streamUrl: '',
  roomId: '',
  fsUrl: '',
  numberOfParticipants: 0
};

export default function reducer(state = INITIAL, {type, payload}: Action<RoomTest>
) {
  switch (type) {
    case SET_ROOM_TEST:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
