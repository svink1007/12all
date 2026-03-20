import {SET_HOME_FILTER} from '../shared/constants';
import {HomeFilterRedux} from '../shared/types';

export function setHomeFilter(payload: Partial<HomeFilterRedux>) {
  return {
    type: SET_HOME_FILTER,
    payload
  }
}
