import {
  SET_ACCUMULATOR_TO_INITIAL_UNREAD_MESSAGES,
  SET_RESET_UNREAD_MESSAGES,
  SET_UNREAD_MESSAGES
} from '../shared/constants';
import {Action, UnreadMessages} from '../shared/types';

const INITIAL: UnreadMessages = {
  initial: -1,
  accumulator: -1
};

export default function reducer(state: UnreadMessages = INITIAL, {type, payload}: Action<number>) {
  switch (type) {
    case SET_UNREAD_MESSAGES:
      const accumulator = state.accumulator === INITIAL.accumulator ? payload : state.accumulator + 1;

      return {
        initial: payload,
        accumulator
      };
    case SET_ACCUMULATOR_TO_INITIAL_UNREAD_MESSAGES:
      return {
        ...state,
        accumulator: state.initial
      };

    case SET_RESET_UNREAD_MESSAGES:
      return INITIAL;
    default:
      return state;
  }
}
