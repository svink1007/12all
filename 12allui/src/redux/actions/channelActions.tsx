import {
  ON_CHANNEL_PREVIEW_ERROR,
  ON_CHANNEL_PREVIEW_LOADED,
  SET_CHANNELS,
  SET_FAVORITE_LIVE_ROOMS,
  TOGGLE_CHANNEL_FAVORITE
} from '../shared/constants';
import {Channel} from '../../shared/types';

export function setChannels(value: Channel[]) {
  return {
    type: SET_CHANNELS,
    payload: value
  };
}

export function onChannelPreviewError(id: number) {
  return {
    type: ON_CHANNEL_PREVIEW_ERROR,
    payload: id
  };
}

export function onChannelPreviewLoaded(id: number) {
  return {
    type: ON_CHANNEL_PREVIEW_LOADED,
    payload: id
  };
}

export function toggleChannelFavorite(state: boolean, channel: Channel) {
  return {
    type: TOGGLE_CHANNEL_FAVORITE,
    payload: {
      state,
      id: channel.id
    }
  };
}

export function setFavoriteLiveRooms(payload: Channel[]) {
  return {
    type: SET_FAVORITE_LIVE_ROOMS,
    payload
  }
}
