import {SET_SHARED_SITE_DATA} from '../shared/constants';
import {Action, SharedSitesRedux} from '../shared/types';

const INITIAL: SharedSitesRedux = {
  url: '',
  name: ''
};

export default function reducer(state = INITIAL, {type, payload}: Action<SharedSitesRedux>) {
  switch (type) {
    case SET_SHARED_SITE_DATA:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
