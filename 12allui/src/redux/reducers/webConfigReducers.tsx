import {SET_WEB_CONFIG} from '../shared/constants';
import {Action, WebConfig} from '../shared/types';
import VertoVariables from '../../verto/VertoVariables';

const INITIAL: WebConfig = {
  previewClip: '',
  streamMaxReconnectAttempts: 10,
  streamReconnectInterval: 4,
  streamPlayTimeout: 30,
  unableCamTimeout: 3,
  hostLeftRoomTimeout: 2,
  streamWidthConstrain: 0,
  astraUrl: '',
  updateStreamSnapshotsInterval: 0.083000,
  maxHotItems: 3,
  sdpVideoCodecRegex: VertoVariables.sdpVideoCodecRegex,
  roomSoonOnAirThreshold: 1800000
};

export default function reducer(state = INITIAL, {type, payload}: Action<WebConfig>) {
  switch (type) {
    case SET_WEB_CONFIG:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
