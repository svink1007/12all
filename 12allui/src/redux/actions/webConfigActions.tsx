import {SET_WEB_CONFIG} from '../shared/constants';
import {WebConfig} from '../shared/types';

export function setWebConfig(value: WebConfig) {
  return {
    type: SET_WEB_CONFIG,
    payload: value
  }
}
