import {
  ADD_FAVORITE_STREAM,
  REMOVE_FAVORITE_STREAM,
  SET_CURRENT_STREAM_ROUTE,
  SET_FAVORITE_STREAMS,
  SET_STREAMS,
  SET_STREAMS_SNAPSHOT,
  TOGGLE_STREAM_FAVORITE
} from '../shared/constants';
import {Action, StreamRedux} from '../shared/types';
import {SharedStream, StreamSnapshot} from '../../shared/types';

const INITIAL: StreamRedux = {
  streams: [],
  favoriteStreams: [],
  currentStreamRoute: ""
};

export default function reducer(state = INITIAL, {
  type,
  payload
}: Action<SharedStream[] | SharedStream | StreamSnapshot[] | string>): StreamRedux {
  switch (type) {
    case SET_STREAMS: {
      const streams = (payload as SharedStream[]).map(nextStream => {
        const prevStream = state.streams.find(s => s.id === nextStream.id);
        if (prevStream) {
          nextStream.stream_snapshot = prevStream.stream_snapshot ? prevStream.stream_snapshot : null;
        }

        return {...nextStream};
      });
      return {
        ...state,
        streams
      };
    }
    case TOGGLE_STREAM_FAVORITE:
      const streamToBeUpdated = state.streams.find(({id}) => id === (payload as SharedStream).id);
      if (streamToBeUpdated) {
        streamToBeUpdated.is_favorite = (payload as SharedStream).is_favorite;

        return {
          ...state,
          streams: state.streams.map(s => ({...s}))
        };
      }

      return state;
    case SET_STREAMS_SNAPSHOT: {
      const streams = state.streams.map(stream => {
        const snapshot = (payload as StreamSnapshot[]).find(({id}) => id === stream.id);
        stream.stream_snapshot = snapshot ? snapshot.snapshot : stream.stream_snapshot ? stream.stream_snapshot : null;
        return stream;
      });

      return {...state, streams};
    }
    case SET_FAVORITE_STREAMS:
      return {
        ...state,
        favoriteStreams: payload as SharedStream[]
      }
    case ADD_FAVORITE_STREAM:
      return {
        ...state,
        favoriteStreams: [payload as SharedStream, ...state.favoriteStreams]
      }
    case REMOVE_FAVORITE_STREAM:
      return {
        ...state,
        favoriteStreams: state.favoriteStreams.filter(({id}) => id !== (payload as SharedStream).id)
      }
    
      case SET_CURRENT_STREAM_ROUTE:
        return {
          ...state,
          currentStreamRoute: payload as string
        }
    default:
      return state;
  }
}
