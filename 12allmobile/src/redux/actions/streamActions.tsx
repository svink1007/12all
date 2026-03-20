import {
  STREAM_LOADING_DONE,
  STREAM_LOADING_START,
  STREAM_RECONNECTING,
} from "../types/types";

export function streamLoadingStart() {
  return {
    type: STREAM_LOADING_START,
  };
}

export function streamLoadingDone() {
  return {
    type: STREAM_LOADING_DONE,
  };
}

export function streamReconnecting(value: boolean) {
  return {
    type: STREAM_RECONNECTING,
    payload: value,
  };
}
