import {SET_NETWORK_CONFIG} from '../shared/constants';
import {Action, NetworkConfig} from '../shared/types';

const INITIAL: NetworkConfig = {
  streamWidthConstrainLow: 0,
  streamWidthConstrainMedium: 0,
  streamWidthConstrainHigh: 0,
  uplinkSpeedInMbpsMedium: 0,
  uplinkSpeedInMbpsHigh: 0,
  uplinkSpeedCheckIntervalSec: 0,
  screenShareResolution: 0,
  fsMbpsLow: 0,
  fsMbpsMedium: 0,
  fsMbpsHigh: 0,
  fsResolutionLow: 0,
  fsResolutionMedium: 0,
  fsResolutionHigh: 0,
  fileSizeInBytesUp: 0
};

export default function reducer(state = INITIAL, {type, payload}: Action<NetworkConfig>) {
  switch (type) {
    case SET_NETWORK_CONFIG:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
