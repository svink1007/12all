import {SET_ERROR_TOAST, SET_INFO_TOAST, SET_RESET_TOAST, SET_SUCCESS_TOAST, SET_WARN_TOAST} from '../shared/constants';
import {Action, Toast, ToastPayload} from '../shared/types';
import {ToastTextFormat} from '../shared/enums';

const INITIAL: Toast = {
  text: '',
  show: false,
  type: undefined,
  duration: 0,
  textFormat: ToastTextFormat.i18
};

export default function reducer(state: Toast = INITIAL, {type, payload}: Action<ToastPayload>): Toast {
  switch (type) {
    case SET_SUCCESS_TOAST:
      return {
        show: true,
        duration: 5000,
        type: 'success',
        text: payload.text,
        textFormat: payload.textFormat
      };
    case SET_ERROR_TOAST:
      return {
        show: true,
        duration: 7000,
        type: 'danger',
        text: payload.text,
        textFormat: payload.textFormat
      };
    case SET_WARN_TOAST:
      return {
        show: true,
        duration: 7000,
        type: 'warning',
        text: payload.text,
        textFormat: payload.textFormat
      };
    case SET_INFO_TOAST:
      return {
        show: true,
        duration: 7000,
        type: 'dark',
        text: payload.text,
        textFormat: payload.textFormat
      };
    case SET_RESET_TOAST:
      return INITIAL;
    default:
      return state;
  }
}
