import {Channel} from '../../shared/types';

import {
  ON_CHANNEL_PREVIEW_ERROR,
  ON_CHANNEL_PREVIEW_LOADED,
  SET_CHANNELS,
  SET_FAVORITE_LIVE_ROOMS,
  SET_FAVORITE_STREAMS,
  TOGGLE_CHANNEL_FAVORITE
} from '../shared/constants';
import {
  Action, ADD_CHANNEL,
  ADD_VOD, ALL_VOD_CHANNEL, ALL_VODS,
  ChannelRedux,
  DELETE_CHANNEL,
  DELETE_VOD,
  EDIT_CHANNEL,ADD_RECORDED_VOD,
  EDIT_VOD, LOAD_CHANNELS,
  LOAD_VODS, SEARCH_VODS,
  ADD_RECORDED_VOD_INFO,
  CLEAR_RECORDED_VOD_INFO,
  TOGGLE_VOD_FAVORITE,
  ADD_FAVORITE_VOD,
  REMOVE_FAVORITE_VOD
} from '../shared/types';


export interface VodState {
  id: number;
  title: string;
  description: string;
  url: string;
  logo: string | null;
  genre: string;
  country: string | null;
  language: string;
  is_approved: boolean;
  owner_id: number;
  last_active: string | null;
  is_adult_content: boolean;
  show_till_android_version: string | null;
  duration: number;
  last_watch_date: string | null;
  country_of_origin: string | null;
  audioOnly: boolean | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  starsAmount: number | null;
  isPrivate: boolean;
  is_favorite?: boolean
  restrictions: string | null;
  shared_streams: VodChannelItem[]
}
export class VodStateClass implements VodState{
  id!: number;
  title!: string;
  description!: string;
  url!: string;
  logo!: string | null;
  genre!: string;
  country!: string | null;
  language!: string;
  is_approved!: boolean;
  owner_id!: number;
  last_active!: string | null;
  is_adult_content!: boolean;
  show_till_android_version!: string | null;
  duration!: number;
  last_watch_date!: string | null;
  country_of_origin!: string | null;
  audioOnly!: boolean | null;
  created_by!: number | null;
  updated_by!: number | null;
  created_at!: string;
  updated_at!: string;
  starsAmount!: number | null;
  isPrivate!: boolean;
  restrictions!: string | null;
  shared_streams!: VodChannelItem[];
}

export interface VodChannelItem {
  id: number;
  name: string;
  url: string;
  logo: string;
  created_by: number | null;
  updated_by: number | null;
  genre: string;
  country: string | null;
  language: string;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
  owner_id: number | null;
  last_active: string | null;
  is_adult_content: boolean;
  show_till_android_version: string | null;
  published_at: string;
  played_successfully: boolean;
  stream_alive: boolean;
  last_check_date: string | null;
  epg_channel: string | null;
  owner: string | null;
  source: string | null;
  country_of_origin: string | null;
  audioOnly: boolean | null;
  starsAmount: string | null;
  description: string;
  restrictions: string | null;
  isPrivate: boolean;
  vod_owner: number;
  logo_image: string | null;
  shared_vods: VodState[]
}
/* CreatedVideo{
    id: "3f3b32fc-3db6-4331-b05b-6fb719268ab5",
    "fileName": "202310512783-91.132.60.125_3f3b32fc-3db6-4331-b05b-6fb719268ab5.mp4",
    "duration": 61180,
    "startDate": "2025-05-07T05:33:08.000Z"
} */
export type VodRedux = {
  allVODs: VodState[];
  searchVODs: VodState[];
  userVODs: VodState[],
  favoriteVods:VodState[];
  userChannels: VodChannelItem[],
  recordedVideoId: string | null,
  recordedVideoInfo:{
    gender: string ;
    language: string ;
  }
};

const INITIAL: VodRedux = {
  allVODs: [],
  searchVODs: [],
  userVODs: [],
  favoriteVods: [],
  userChannels: [],
  recordedVideoId:null,
  recordedVideoInfo:{
    gender: "",
    language: ""
  }
};

export default function reducer(state = INITIAL, { type, payload }: Action<any>): VodRedux {
  switch (type) {

    case ALL_VOD_CHANNEL:
      return {
        ...state,
        userChannels: payload,
      };

    case ALL_VODS:
      return {
        ...state,
        allVODs: payload,
      };

    case SEARCH_VODS:
      return {
        ...state,
        searchVODs: payload,
      };

    case LOAD_VODS:
      return {
        ...state,
        userVODs: payload,
      };

    case ADD_VOD:
      return {
        ...state,
        userVODs: [...state.userVODs, payload],
      };
    case SET_FAVORITE_STREAMS:
      return {
        ...state,
        favoriteVods: payload as VodState[]
      }
    case ADD_FAVORITE_VOD:
      return {
        ...state,
        favoriteVods: [payload as VodState, ...state.favoriteVods]
      }
    case REMOVE_FAVORITE_VOD:
      return {
        ...state,
        favoriteVods: state.favoriteVods.filter(({id}) => id !== (payload as VodState).id)
      }
    case TOGGLE_VOD_FAVORITE: {
        const updatedAllVODs = state.allVODs.map((vod: VodState) =>
          vod.id === (payload as VodState).id
            ? { ...vod, is_favorite: (payload as VodState).is_favorite }
            : vod
        );
        return {
          ...state,
          allVODs: updatedAllVODs
        };
      }
    
    case ADD_RECORDED_VOD: return{
      ...state,
      recordedVideoId: payload
    }
    case ADD_RECORDED_VOD_INFO: return {
      ...state,
      recordedVideoInfo: {
        ...state.recordedVideoInfo,
        ...payload
      }
    };

    case CLEAR_RECORDED_VOD_INFO: return {
      ...state,
      recordedVideoId: null,
      recordedVideoInfo: {
        gender: "",
        language: ""
      }
    };

    case EDIT_VOD:
      return {
        ...state,
        userVODs: state.userVODs.map((vod) =>
            vod.id === payload.id ? { ...vod, ...payload } : vod
        ),
      };

    case DELETE_VOD:
      return {
        ...state,
        userVODs: state.userVODs.filter((vod) => vod.id !== payload),
      };

    case LOAD_CHANNELS:
      return {
        ...state,
        userChannels: payload,
      };

    case ADD_CHANNEL:
      return {
        ...state,
        userChannels: [...state.userChannels, payload],
      };

    case EDIT_CHANNEL:
      return {
        ...state,
        userChannels: state.userChannels.map((channel) =>
            channel.id === payload.id ? { ...channel, ...payload } : channel
        ),
      };

    case DELETE_CHANNEL:
      return {
        ...state,
        userChannels: state.userChannels.filter((channel) => channel.id !== payload),
      };

    default:
      return state;
  }
}
