import { SET_CHANNELS_SEARCH } from "../types/types";

export function setChannelsSearch(value: string) {
  return {
    type: SET_CHANNELS_SEARCH,
    payload: value,
  };
}
