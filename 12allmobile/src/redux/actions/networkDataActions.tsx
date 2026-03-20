import { SET_NETWORK_DATA } from "../types/types";
import { NetworkData } from "../types";

export function setNetworkData(value: NetworkData) {
  return {
    type: SET_NETWORK_DATA,
    payload: value,
  };
}
