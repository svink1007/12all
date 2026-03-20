import {
  SET_ERROR_TOAST,
  SET_INFO_TOAST,
  SET_RESET_TOAST,
  SET_SUCCESS_TOAST,
  SET_WARN_TOAST,
} from "../types/types";
import { ToastPayload } from "../types";

export function setSuccessToast(value: string) {
  return {
    type: SET_SUCCESS_TOAST,
    payload: value,
  };
}

export function setErrorToast(value: string) {
  return {
    type: SET_ERROR_TOAST,
    payload: value,
  };
}

export function setWarnToast(value: string) {
  return {
    type: SET_WARN_TOAST,
    payload: value,
  };
}

export function setInfoToast(value: string | ToastPayload) {
  return {
    type: SET_INFO_TOAST,
    payload: value,
  };
}

export function setResetToast() {
  return {
    type: SET_RESET_TOAST,
  };
}
