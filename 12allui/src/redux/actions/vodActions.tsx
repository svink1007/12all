import {
    ADD_CHANNEL,
    ADD_RECORDED_VOD,
    ADD_VOD, ALL_VOD_CHANNEL,
    ALL_VODS,
    DELETE_CHANNEL,
    DELETE_VOD,
    EDIT_CHANNEL,
    EDIT_VOD,
    LOAD_CHANNELS,
    LOAD_VODS, SEARCH_VODS,
    ADD_RECORDED_VOD_INFO,
    CLEAR_RECORDED_VOD_INFO,
    TOGGLE_VOD_FAVORITE,
    ADD_FAVORITE_VOD,
    SET_FAVORITE_VOD,
    REMOVE_FAVORITE_VOD
} from "../shared/types";
import {VodChannelItem, VodState} from "../reducers/vodReducers";

// VOD Actions

export const allVodChannels = (channel: VodChannelItem[]) => ({
    type: ALL_VOD_CHANNEL,
    payload: channel,
});


export const findVods = (vods: VodState[]) => ({
    type: SEARCH_VODS,
    payload: vods,
});

export const allVods = (vods: VodState[]) => ({
    type: ALL_VODS,
    payload: vods,
});

export const loadVods = (vods: VodState[]) => ({
    type: LOAD_VODS,
    payload: vods,
});

export const addVod = (vod: VodState) => ({
    type: ADD_VOD,
    payload: vod,
});

export const addRecordedVod = (recordedVideoId: string) => ({
    type: ADD_RECORDED_VOD,
    payload: recordedVideoId,
});

export const addRecordedVodInfo = (recordInfo: {
    gender: string,
    language: string
  }) => ({
    type: ADD_RECORDED_VOD_INFO,
    payload: recordInfo,
});

export const clearRecordedVodInfo = () => ({
    type: CLEAR_RECORDED_VOD_INFO,
});

export const editVod = (vod: VodState) => ({
    type: EDIT_VOD,
    payload: vod,
});

export const deleteVod = (vodId: number) => ({
    type: DELETE_VOD,
    payload: vodId,
});

// Channel Actions
export const loadChannels = (channels: VodChannelItem[]) => ({
    type: LOAD_CHANNELS,
    payload: channels,
});
export function toggleVodFavorite(value: VodState) {
  return {
    type: TOGGLE_VOD_FAVORITE,
    payload: value
  };
}
export function setFavoriteVods(value: VodState[]) {
  return {
    type: SET_FAVORITE_VOD,
    payload: value
  };
}

export function addFavoriteVod(value: VodState) {
  return {
    type: ADD_FAVORITE_VOD,
    payload: value
  };
}

export function removeFavoriteVod(value: VodState) {
  return {
    type: REMOVE_FAVORITE_VOD,
    payload: value
  };
}

export const addChannel = (channel: VodChannelItem) => ({
    type: ADD_CHANNEL,
    payload: channel,
});

export const editChannel = (channel: VodChannelItem) => ({
    type: EDIT_CHANNEL,
    payload: channel,
});

export const deleteChannel = (channelId: number) => ({
    type: DELETE_CHANNEL,
    payload: channelId,
});

