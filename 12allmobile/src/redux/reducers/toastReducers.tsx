import {
  SET_ERROR_TOAST,
  SET_INFO_TOAST,
  SET_RESET_TOAST,
  SET_SUCCESS_TOAST,
  SET_WARN_TOAST,
} from "../types/types";
import { Action, Toast, ToastPayload } from "../types";

const INITIAL: Toast = {
  i18nKey: "",
  show: false,
  type: undefined,
  duration: 0,
};

export default function reducer(
  state: Toast = INITIAL,
  { type, payload }: Action<string | ToastPayload>
) {
  switch (type) {
    case SET_SUCCESS_TOAST:
      return {
        show: true,
        duration: 5000,
        type: "success",
        i18nKey: payload,
      };
    case SET_ERROR_TOAST:
      return {
        show: true,
        duration: 8000,
        type: "danger",
        i18nKey: payload,
      };
    case SET_WARN_TOAST:
      return {
        show: true,
        duration: 8000,
        type: "warning",
        i18nKey: payload,
      };
    case SET_INFO_TOAST:
      return {
        show: true,
        duration:
          typeof payload === "object" && payload.duration
            ? payload.duration
            : 10000,
        type: "dark",
        i18nKey: typeof payload === "string" ? payload : payload.i18nKey,
        prefixText: typeof payload === "object" && payload.prefixText,
      };
    case SET_RESET_TOAST:
      return INITIAL;
    default:
      return state;
  }
}
