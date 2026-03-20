import {SET_NETWORK_CONFIG} from '../shared/constants';
import {NetworkConfig} from '../shared/types';

export function setNetworkConfig(value: NetworkConfig) {
  return {
    type: SET_NETWORK_CONFIG,
    payload: value
  };
}
