import {SET_LIVING_ROOM} from '../shared/constants';
import {Action, LivingRoomState} from '../shared/types';
import {LivingRoomMode} from '../../pages/WatchParty/enums';

const INITIAL: LivingRoomState = {
  share: null,
  files: null,
  myStream: null,
  joinCamMic: false,
  cam: 'none',
  mic: 'any',
  channel: {
    logo: null,
    name: ''
  },
  roomId: '',
  publicRoomId: '',
  moderatorUsername: '',
  moderatorPassword: '',
  fsUrl: '',
  nickname: '',
  streamName: null,
  isHost: false,
  singleConnection: false,
  joinRoomWithCoHost: false,
  roomResolution: 0,
  vlrId: 0,
  upSpeedUrl: null,
  mode: LivingRoomMode.Public,
  joinedFromJoinScreen: false,
  roomLayout: null,
  scheduledRooms: [],
  invitationUrl: ''
};

export default function reducer(
  state: LivingRoomState = INITIAL,
  {type, payload}: Action<LivingRoomState>
) {
  switch (type) {
    case SET_LIVING_ROOM:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
