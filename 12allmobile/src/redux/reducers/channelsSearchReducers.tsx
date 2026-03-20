import { SET_CHANNELS_SEARCH } from "../types/types";
import { Action, ChannelsSearch } from "../types";

const INITIAL: ChannelsSearch = {
  searchText: "",
};

export default function reducer(
  state: ChannelsSearch = INITIAL,
  { type, payload }: Action<string>
) {
  switch (type) {
    case SET_CHANNELS_SEARCH:
      return {
        ...state,
        searchText: payload,
      };
    default:
      return state;
  }
}
