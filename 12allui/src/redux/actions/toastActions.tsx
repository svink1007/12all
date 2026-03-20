import {SET_ERROR_TOAST, SET_INFO_TOAST, SET_RESET_TOAST, SET_SUCCESS_TOAST, SET_WARN_TOAST} from '../shared/constants';
import {ToastTextFormat} from '../shared/enums';

export function setSuccessToast(text: string, textFormat: ToastTextFormat = ToastTextFormat.i18) {
  return {
    type: SET_SUCCESS_TOAST,
    payload: {text, textFormat}
  };
}

export function setErrorToast(text: string, textFormat: ToastTextFormat = ToastTextFormat.i18) {
  return {
    type: SET_ERROR_TOAST,
    payload: {text, textFormat}
  };
}

export function setWarnToast(text: string, textFormat: ToastTextFormat = ToastTextFormat.i18) {
  return {
    type: SET_WARN_TOAST,
    payload: {text, textFormat}
  };
}

export function setInfoToast(text: string, textFormat: ToastTextFormat = ToastTextFormat.i18) {
  return {
    type: SET_INFO_TOAST,
    payload: {text, textFormat}
  };
}


export function setResetToast() {
  return {
    type: SET_RESET_TOAST
  };
}

