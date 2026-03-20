import {
  ADD_STREAM,
  ADD_STREAMS,
  REMOVE_STREAM,
  SET_BROADCAST_OPTION,
  SET_STREAMS_REDUX,
  SET_VLRS_REDUX,
  UPDATE_FAVORITE_STREAMS,
  UPDATE_FAVORITES,
  UPDATE_STREAM,
  UPDATE_STREAM_STATE,
  UPDATE_STREAM_VLR_PREVIEW,
  UPDATE_STREAMS,
  UPDATE_VLRS,
  SET_SHARED_VOD_DATA,
  UPDATE_SHARED_VOD_DATA,
  ADD_SHARED_VOD_DATA,
} from "../types/types";
import {
  Action,
  Broadcast,
  UpdateChannelAction,
  UpdateStreamAction,
} from "../types";
import {
  FavoritesResponse,
  SharedStream,
  SharedStreamVlrs,
  Vlr,
} from "../../shared/types";

export enum BroadcastOptions {
  Vlr = "vlr",
  SharedStreams = "shared-streams",
  SharedSites = "shared-sites",
  Favorites = "favorites",
}

const sortStreams = (streams: SharedStream[]) =>
  streams.sort((a, b) =>
    a.is_owner === b.is_owner
      ? a.name.localeCompare(b.name)
      : a.is_owner
        ? -1
        : 1
  );

const INITIAL: Broadcast = {
  selectedOption: BroadcastOptions.SharedStreams,
  shared: [],
  vlrs: [],
  epg: [],
  streams: [],
  favoriteStreams: [],
  sharedVod: [],
};

type BroadcastActions =
  | UpdateChannelAction
  | UpdateStreamAction
  | Vlr[]
  | SharedStreamVlrs[]
  | SharedStream
  | FavoritesResponse
  | BroadcastOptions
  | number;

export default function reducer(
  state: Broadcast = INITIAL,
  { type, payload }: Action<BroadcastActions>
): Broadcast {
  switch (type) {
    case SET_STREAMS_REDUX:
      return {
        ...state,
        streams: payload as SharedStream[],
      };

    case SET_VLRS_REDUX:
      return {
        ...state,
        vlrs: payload as Vlr[],
      };

    case UPDATE_STREAMS: {
      const streams = (payload as SharedStreamVlrs[]).map((stream) => {
        const exists = state.streams.find((s) => s.id === stream.id);
        if (exists && exists.stream_snapshot) {
          stream.stream_snapshot = exists.stream_snapshot;
        }
        return {
          ...stream,
          vlr: stream.vlr?.map((v) => ({
            ...v,
            channel: {
              ...v.channel,
              https_preview_high: `${v.channel.https_preview_high}?hash=${Date.now()}`,
            },
          })),
        };
      });

      return {
        ...state,
        streams,
      };
    }

    case ADD_STREAMS: {
      const streams = state.streams.map((s) => ({ ...s }));
      (payload as SharedStream[]).forEach((stream) => {
        if (!streams.find((s) => s.id === stream.id)) {
          streams.push(stream);
        }
      });

      return {
        ...state,
        streams,
      };
    }

    case ADD_STREAM:
      const mappedStreams = state.streams.map((s) => ({ ...s }));
      mappedStreams.push(payload as SharedStream);
      const sortedStreams = sortStreams(mappedStreams);

      return {
        ...state,
        streams: sortedStreams,
      };

    case UPDATE_STREAM:
      const newStreamsState = state.streams.map((stream) => {
        if (stream.id === (payload as SharedStream).id) {
          return payload as SharedStream;
        }
        return stream;
      });

      return {
        ...state,
        streams: newStreamsState,
      };
    case REMOVE_STREAM:
      const filteredStreams = state.streams.filter(
        (stream) => stream.id !== (payload as number)
      );

      return {
        ...state,
        streams: filteredStreams,
      };

    case UPDATE_VLRS: {
      const vlrs = (payload as Vlr[]).map((p) => ({
        ...p,
        channel: {
          ...p.channel,
          https_preview_high: `${p.channel.https_preview_high}?hash=${Date.now()}`,
        },
      }));

      return {
        ...state,
        vlrs,
      };
    }

    case UPDATE_STREAM_STATE: {
      const stream = state.streams.find(
        (stream) => stream.id === (payload as UpdateStreamAction).id
      );

      if (stream) {
        switch ((payload as UpdateStreamAction).key) {
          case "logo":
            stream.logo = null;
            break;
        }
      }

      return { ...state };
    }

    case UPDATE_STREAM_VLR_PREVIEW: {
      const streams = state.streams.map((stream) => {
        const vlr = stream.vlr?.find((vlr) => vlr.id === (payload as number));
        if (vlr) {
          vlr.channel.https_preview_high = null;
        }
        return {
          ...stream,
          vlr: stream.vlr?.map((vlr) => ({ ...vlr })),
        };
      });

      return { ...state, streams };
    }

    case SET_BROADCAST_OPTION:
      return {
        ...state,
        selectedOption: payload as BroadcastOptions,
      };
    case UPDATE_FAVORITES: {
      const favoriteStreams = (
        payload as FavoritesResponse
      ).favorite_streams.map((f) => ({ ...f }));

      return {
        ...state,
        favoriteStreams,
      };
    }

    case UPDATE_FAVORITE_STREAMS: {
      const favoriteStreams = (payload as SharedStream[]).map((f) => ({
        ...f,
      }));
      return {
        ...state,
        favoriteStreams,
      };
    }

    case SET_SHARED_VOD_DATA:
      return {
        ...state,
        sharedVod: payload as SharedStreamVlrs[],
      };

    case UPDATE_SHARED_VOD_DATA:
      return {
        ...state,
        sharedVod: payload as SharedStreamVlrs[],
      };

    case ADD_SHARED_VOD_DATA: {
      const sharedVod = state.sharedVod.map((item) => ({ ...item }));
      (payload as SharedStreamVlrs[]).forEach((item) => {
        if (!sharedVod.find((s) => s.id === item.id)) {
          sharedVod.push(item);
        }
      });
      return {
        ...state,
        sharedVod,
      };
    }

    default:
      return state;
  }
}
