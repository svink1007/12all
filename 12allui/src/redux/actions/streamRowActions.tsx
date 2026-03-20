import { SharedStream } from "../../shared/types";
import { SET_STREAMS_ROW } from "../shared/constants";

export function setStreamsRow(value: SharedStream[]) {
  return {
    type: SET_STREAMS_ROW,
    payload: value
  };
}