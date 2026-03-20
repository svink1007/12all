import {
  SET_STREAMS_ROW
} from '../shared/constants';
import { Action, StreamRedux } from '../shared/types';
import { SharedStream, StreamSnapshot } from '../../shared/types';

const INITIAL: StreamRedux = {
  streams: [],
  favoriteStreams: []
};

export default function reducer(state = INITIAL, {
  type,
  payload
}: Action<SharedStream[] | SharedStream | StreamSnapshot[]>): StreamRedux {
  switch (type) {
    case SET_STREAMS_ROW: {
      const streams = (payload as SharedStream[]).map(nextStream => {
        const prevStream = state.streams.find(s => s.id === nextStream.id);
        if (prevStream) {
          nextStream.stream_snapshot = prevStream.stream_snapshot ? prevStream.stream_snapshot : null;
        }

        return { ...nextStream };
      });
      return {
        ...state,
        streams
      };
    }
    default:
      return state;
  }
}