import { SET_DEVICE_INFO } from "../types/types";
import { Action } from "../types";
import { DeviceInfo } from "@capacitor/device";

const INITIAL: DeviceInfo = {
  isVirtual: false,
  manufacturer: "",
  model: "",
  operatingSystem: "android",
  osVersion: "",
  platform: "android",
  webViewVersion: "",
};

export default function reducer(
  state = INITIAL,
  { type, payload }: Action<DeviceInfo>
) {
  switch (type) {
    case SET_DEVICE_INFO:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
