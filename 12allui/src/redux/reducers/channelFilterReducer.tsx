import {RESET_CHANNELS_FILTER_OPTION, SET_CHANNELS_FILTER_OPTION} from '../shared/constants';
import {Action, ChannelsFilter} from '../shared/types';

const INITIAL = {
  language: "",
  genre: "",
  country_of_origin: ""
};

export default function reducer(state = INITIAL, {type, payload}: Action<ChannelsFilter>) {

  switch (type) {
    case SET_CHANNELS_FILTER_OPTION:
      return payload;
    case RESET_CHANNELS_FILTER_OPTION:
      return INITIAL;
    default:
      return state;
  }
}
