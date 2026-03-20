import {SET_SHARED_SITE_DATA} from '../shared/constants';
import {SharedSitesRedux} from '../shared/types';

export default function setSharedSiteData(value: SharedSitesRedux) {
  return {
    type: SET_SHARED_SITE_DATA,
    payload: value
  }
}
