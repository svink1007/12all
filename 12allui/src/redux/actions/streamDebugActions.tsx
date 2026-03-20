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
import {HTMLVideoStreamElement} from '../../pages/WatchParty/types';
import VertoSession from '../../verto/VertoSession';
import {StreamDebugActions} from '../shared/types';

export function setStreamDebugSentStream(value: MediaStream | null) {
  return {
    type: STREAM_DEBUG_SET_SENT_STREAM,
    payload: {sentStream: value}
  };
}

export function setStreamDebugReplaceSentStream(value: MediaStream | null) {
  return {
    type: STREAM_DEBUG_SET_REPLACE_SENT_STREAM,
    payload: {sentStream: value}
  };
}

export function setStreamDebugReceivedStream(value: MediaStream) {
  return {
    type: STREAM_DEBUG_SET_RECEIVED_STREAM,
    payload: {receivedStream: value}
  };
}

export function setStreamDebugVideoElement(value: HTMLVideoStreamElement | null) {
  return {
    type: STREAM_DEBUG_SET_VIDEO_ELEMENT,
    payload: {videoElement: value}
  };
}

export function setStreamDebugHlsError(value: string) {
  return {
    type: STREAM_DEBUG_SET_HLS_ERROR,
    payload: {hlsError: value}
  };
}

export function resetStreamDebugValues() {
  return {
    type: STREAM_DEBUG_RESET_VALUES
  };
}

export function setStreamDebugVertoSession(value: VertoSession) {
  return {
    type: STREAM_DEBUG_VERTO_SESSION,
    payload: {vertoSession: value}
  };
}

export function setStreamDebug(payload: Partial<StreamDebugActions>) {
  return {
    type: SET_STREAM_DEBUG,
    payload
  };
}
