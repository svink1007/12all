import {SET_NETWORK_DATA} from '../shared/constants';
import {Action, NetworkData} from '../shared/types';

const INITIAL: NetworkData = {
    uplinkSpeed: 0,
    streamWidth: 0
};

export default function reducer(
  state: NetworkData = INITIAL,
  {type, payload}: Action<NetworkData>
) {
  switch (type) {
    case SET_NETWORK_DATA:
        const data: NetworkData = {
            ...state,
            ...payload
        };
      return data;
    default:
      return state;
  }
}
