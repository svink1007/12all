import {
  ADD_STREAM,
  ADD_STREAMS,
  REMOVE_STREAM,
  SET_BROADCAST_OPTION,
  SET_STREAMS_REDUX,
  SET_VLRS_REDUX,
  UPDATE_FAVORITE_STREAMS,
  UPDATE_FAVORITES,
  UPDATE_STREAM,
  UPDATE_STREAM_VLR_PREVIEW,
  UPDATE_STREAMS,
  UPDATE_VLRS,
  SET_SHARED_VOD_DATA,
  UPDATE_SHARED_VOD_DATA,
  ADD_SHARED_VOD_DATA,
} from "../types/types";
import {
  Channel,
  FavoritesResponse,
  SharedStream,
  SharedStreamVlrs,
  Vlr,
} from "../../shared/types";
import { BroadcastOptions } from "../reducers/broadcastReducers";

export function setVlrsAction(channels: Channel[]) {
  return {
    type: SET_VLRS_REDUX,
    payload: channels,
  };
}

export function setStreamsAction(streams: SharedStream[]) {
  return {
    type: SET_STREAMS_REDUX,
    payload: streams,
  };
}

export function updateVlrs(vlrs: Vlr[]) {
  return {
    type: UPDATE_VLRS,
    payload: vlrs,
  };
}

export function updateStreams(streams: SharedStreamVlrs[]) {
  return {
    type: UPDATE_STREAMS,
    payload: streams,
  };
}

export function addStreams(streams: SharedStream[]) {
  return {
    type: ADD_STREAMS,
    payload: streams,
  };
}

export function addStream(stream: SharedStream) {
  return {
    type: ADD_STREAM,
    payload: stream,
  };
}

export function updateStream(stream: SharedStream) {
  return {
    type: UPDATE_STREAM,
    payload: stream,
  };
}

export function removeStream(streamId: number) {
  return {
    type: REMOVE_STREAM,
    payload: streamId,
  };
}

export function updateStreamVlrPreview(vlrId: number) {
  return {
    type: UPDATE_STREAM_VLR_PREVIEW,
    payload: vlrId,
  };
}

export function setBroadcastOption(value: BroadcastOptions) {
  return {
    type: SET_BROADCAST_OPTION,
    payload: value,
  };
}

export function updateFavorites(favorites: FavoritesResponse) {
  return {
    type: UPDATE_FAVORITES,
    payload: favorites,
  };
}

export function setSharedVodData(sharedVod: SharedStreamVlrs[]) {
  return {
    type: SET_SHARED_VOD_DATA,
    payload: sharedVod,
  };
}

export function updateSharedVodData(sharedVod: SharedStreamVlrs[]) {
  return {
    type: UPDATE_SHARED_VOD_DATA,
    payload: sharedVod,
  };
}

export function addSharedVodData(sharedVod: SharedStreamVlrs[]) {
  return {
    type: ADD_SHARED_VOD_DATA,
    payload: sharedVod,
  };
}

export function updateFavoriteStreams(streams: SharedStream[]) {
  return {
    type: UPDATE_FAVORITE_STREAMS,
    payload: streams,
  };
}
