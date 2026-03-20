import {Channel} from '../../shared/types';

import {
  ON_CHANNEL_PREVIEW_ERROR,
  ON_CHANNEL_PREVIEW_LOADED,
  SET_CHANNELS,
  SET_FAVORITE_LIVE_ROOMS,
  TOGGLE_CHANNEL_FAVORITE
} from '../shared/constants';
import {Action, ChannelRedux} from '../shared/types';

const INITIAL: ChannelRedux = {
  liveRooms: [],
  upcomingRooms: [],
  favLiveRooms: [],
  favUpcomingRooms: []
};

export default function reducer(state = INITIAL, {type, payload}: Action<any>): ChannelRedux {
  let foundChannel: Channel | undefined;

  switch (type) {
    case SET_CHANNELS:
      const channels = (payload as Channel[]).map(pParty => {
        const ch = state.liveRooms.find(sParty => sParty.id === pParty.id);
        if (ch) {
          pParty.preview_loaded = ch.preview_loaded;
        }
        pParty.https_preview_high = pParty.https_preview_high ? `${pParty.https_preview_high}?hash=${Date.now()}` : null;
        return pParty;
      });
      return {
        ...state,
        liveRooms: channels
      };
    case ON_CHANNEL_PREVIEW_ERROR:
      foundChannel = state.liveRooms.find(((channel: Channel) => channel.id === parseInt(payload)));

      if (foundChannel) {
        foundChannel.https_preview_high = '';
      }

      return {
        ...state,
        liveRooms: [...state.liveRooms]
      };

    case ON_CHANNEL_PREVIEW_LOADED:
      foundChannel = state.liveRooms.find(((channel: Channel) => channel.id === parseInt(payload)));

      if (foundChannel) {
        foundChannel.preview_loaded = true;
      }

      return {
        ...state,
        liveRooms: [...state.liveRooms]
      };
    case TOGGLE_CHANNEL_FAVORITE:
      foundChannel = state.liveRooms.find(((channel: Channel) => channel.id === parseInt(payload.id)));

      if (foundChannel) {
        foundChannel.is_favorite = payload.state;
      }

      return {
        ...state,
        liveRooms: [...state.liveRooms]
      };
    case SET_FAVORITE_LIVE_ROOMS:
      return {
        ...state,
        favLiveRooms: payload
      };
    default:
      return state;
  }
}
