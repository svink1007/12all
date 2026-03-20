import {
  SET_STREAM_DEBUG,
  STREAM_DEBUG_RESET_VALUES,
  STREAM_DEBUG_SET_HLS_ERROR,
  STREAM_DEBUG_SET_RECEIVED_STREAM,
  STREAM_DEBUG_SET_REPLACE_SENT_STREAM,
  STREAM_DEBUG_SET_SENT_STREAM,
  STREAM_DEBUG_SET_VIDEO_ELEMENT,
  STREAM_DEBUG_VERTO_SESSION
} from '../shared/constants';
import {Action, StreamDebugActions, StreamDebugRedux} from '../shared/types';

const INITIAL: StreamDebugRedux = {
  sentStream: null,
  receivedStream: null,
  videoElement: null,
  hlsErrors: [],
  vertoSession: null
};

export default function reducer(state = INITIAL, {type, payload}: Action<StreamDebugActions>): StreamDebugRedux {
  switch (type) {
    case STREAM_DEBUG_SET_SENT_STREAM:
      return {
        ...state,
        sentStream: payload.sentStream
      };
    case STREAM_DEBUG_SET_REPLACE_SENT_STREAM:
      let mediaStream = payload.sentStream;
      if (state.sentStream?.getAudioTracks().length && payload.sentStream?.getVideoTracks().length) {
        mediaStream = new MediaStream([state.sentStream.getAudioTracks()[0], payload.sentStream.getVideoTracks()[0]]);
      } else if (state.sentStream?.getVideoTracks().length && payload.sentStream?.getAudioTracks().length) {
        mediaStream = new MediaStream([payload.sentStream.getAudioTracks()[0], state.sentStream.getVideoTracks()[0]]);
      }

      return {
        ...state,
        sentStream: mediaStream
      };
    case STREAM_DEBUG_SET_RECEIVED_STREAM:
      return {
        ...state,
        receivedStream: payload.receivedStream
      };
    case STREAM_DEBUG_SET_VIDEO_ELEMENT:
      return {
        ...state,
        videoElement: payload.videoElement
      };
    case STREAM_DEBUG_SET_HLS_ERROR:
      const errorData = {
        date: new Date().toLocaleTimeString(),
        message: payload.hlsError
      };
      return {
        ...state,
        hlsErrors: [errorData, ...state.hlsErrors.map(err => ({...err}))]
      };
    case STREAM_DEBUG_RESET_VALUES:
      return INITIAL;

    case STREAM_DEBUG_VERTO_SESSION:
      return {
        ...state,
        vertoSession: payload.vertoSession
      };
    case SET_STREAM_DEBUG:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
