import {SET_ROOM_LAYOUT} from '../shared/constants';
import {Action, RoomLayoutRedux} from '../shared/types';
import {VertoLayout} from '../../verto/types';

const INITIAL: RoomLayoutRedux = {
  selected: VertoLayout.VideoLeftLarge
};

export default function reducer(state = INITIAL, {type, payload}: Action<RoomLayoutRedux>
) {
  switch (type) {
    case SET_ROOM_LAYOUT:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
