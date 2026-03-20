import {
  ADD_FAVORITE_STREAM,
  REMOVE_FAVORITE_STREAM,
  SET_CURRENT_STREAM_ROUTE,
  SET_FAVORITE_STREAMS,
  SET_STREAMS,
  SET_STREAMS_SNAPSHOT,
  TOGGLE_STREAM_FAVORITE
} from '../shared/constants';
import {SharedStream, StreamSnapshot} from '../../shared/types';

export function setStreams(value: SharedStream[]) {
  return {
    type: SET_STREAMS,
    payload: value
  };
}

export function toggleStreamFavorite(value: SharedStream) {
  return {
    type: TOGGLE_STREAM_FAVORITE,
    payload: value
  };
}

export function setStreamsSnapshot(value: StreamSnapshot[]) {
  return {
    type: SET_STREAMS_SNAPSHOT,
    payload: value
  };
}

export function setFavoriteStreams(value: SharedStream[]) {
  return {
    type: SET_FAVORITE_STREAMS,
    payload: value
  };
}

export function addFavoriteStream(value: SharedStream) {
  return {
    type: ADD_FAVORITE_STREAM,
    payload: value
  };
}

export function removeFavoriteStream(value: SharedStream) {
  return {
    type: REMOVE_FAVORITE_STREAM,
    payload: value
  };
}

export function setCurrentStreamRoute(value: string) {
  return {
    type: SET_CURRENT_STREAM_ROUTE,
    payload: value
  };
}
