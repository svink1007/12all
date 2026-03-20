import {SET_ROOM_LAYOUT} from '../shared/constants';
import {VertoLayout} from '../../verto/types';

export function setRoomLayout(layout: VertoLayout) {
  return {
    type: SET_ROOM_LAYOUT,
    payload: {selected: layout}
  }
}
