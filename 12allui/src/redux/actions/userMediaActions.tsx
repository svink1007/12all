import {SET_USER_MEDIA} from '../shared/constants';

export default function setUserMedia(value: {cam?: string; mic?: string}) {
  return {
    type: SET_USER_MEDIA,
    payload: value
  }
}
