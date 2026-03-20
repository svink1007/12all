import {STREAM_LOADING_DONE, STREAM_LOADING_START} from '../shared/constants';


export function streamLoadingStart() {
  return {
    type: STREAM_LOADING_START
  };
}

export function streamLoadingDone() {
  return {
    type: STREAM_LOADING_DONE
  };
}
