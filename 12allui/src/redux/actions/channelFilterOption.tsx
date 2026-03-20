import {ChannelsFilter} from '../shared/types';
import {SET_CHANNELS_FILTER_OPTION} from '../shared/constants';


export function setChannelsFilterOption(value: ChannelsFilter) {

  return {
    type: SET_CHANNELS_FILTER_OPTION,
    payload: value
  }
}
