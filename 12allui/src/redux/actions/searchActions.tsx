import {SET_SEARCH} from '../shared/constants';
import {SearchRedux} from '../shared/types';

export function setSearch(payload: Partial<SearchRedux>) {
  return {
    type: SET_SEARCH,
    payload
  };
}
