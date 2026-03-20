import { SET_NETWORK_CONFIG } from "../types/types";
import { NetworkConfig } from "../types";

export function setNetworkConfig(value: NetworkConfig) {
  return {
    type: SET_NETWORK_CONFIG,
    payload: value,
  };
}
