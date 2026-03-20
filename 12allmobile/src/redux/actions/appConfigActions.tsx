import { SET_APP_CONFIG } from "../types/types";
import { AppConfig } from "../types";

export default function setAppConfig(value: AppConfig) {
  return {
    type: SET_APP_CONFIG,
    payload: value,
  };
}
