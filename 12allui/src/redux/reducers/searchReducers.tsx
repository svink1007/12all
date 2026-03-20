import {SET_SEARCH} from '../shared/constants';
import {Action, SearchRedux} from '../shared/types';
import {SearchType} from '../shared/enums';

const INITIAL: SearchRedux = {
  type: SearchType.All,
  query: ''
};

export default function reducer(state = INITIAL, {type, payload}: Action<SearchRedux>): SearchRedux {
  switch (type) {
    case SET_SEARCH:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
