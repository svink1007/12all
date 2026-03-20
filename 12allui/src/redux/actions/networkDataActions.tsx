import {SET_NETWORK_DATA} from '../shared/constants';
import {NetworkData} from '../shared/types';

export function setNetworkData(value: NetworkData) {
  return {
    type: SET_NETWORK_DATA,
    payload: value
  }
}
