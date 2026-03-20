import {
  SET_ACCUMULATOR_TO_INITIAL_UNREAD_MESSAGES,
  SET_RESET_UNREAD_MESSAGES,
  SET_UNREAD_MESSAGES
} from '../shared/constants';

export function setUnreadMessages(value: number) {
  return {
    type: SET_UNREAD_MESSAGES,
    payload: value
  }
}

export function setResetUnreadMessages() {
  return {
    type: SET_RESET_UNREAD_MESSAGES
  }
}

export function setAccumulatorToInitialUnreadMessages() {
  return {
    type: SET_ACCUMULATOR_TO_INITIAL_UNREAD_MESSAGES
  }
}
