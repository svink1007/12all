import {STREAM_LOADING_DONE, STREAM_LOADING_START} from '../shared/constants';
import {Action, StreamLoading} from '../shared/types';

const INITIAL: StreamLoading = {
  loading: false
};

export default function reducer(state = INITIAL, {type}: Action<{ type: string }>) {
  switch (type) {
    case STREAM_LOADING_START:
      return {
        loading: true
      };
    case STREAM_LOADING_DONE:
      return {
        loading: false
      };
    default:
      return state;
  }
}
