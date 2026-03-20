import {
  STREAM_LOADING_DONE,
  STREAM_LOADING_START,
  STREAM_RECONNECTING,
} from "../types/types";
import { Action, StreamRedux } from "../types";

const INITIAL: StreamRedux = {
  loading: false,
  reconnecting: false,
};

export default function reducer(
  state = INITIAL,
  { type, payload }: Action<{ type: string; payload: boolean }>
) {
  switch (type) {
    case STREAM_LOADING_START:
      return {
        ...state,
        loading: true,
      };
    case STREAM_LOADING_DONE:
      return {
        ...state,
        loading: false,
      };
    case STREAM_RECONNECTING:
      return {
        ...state,
        reconnecting: payload,
      };
    default:
      return state;
  }
}
