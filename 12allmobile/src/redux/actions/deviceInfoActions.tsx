import { SET_DEVICE_INFO } from "../types/types";
import { DeviceInfo } from "@capacitor/device";

export function setDeviceInfo(data: DeviceInfo) {
  return {
    type: SET_DEVICE_INFO,
    payload: data,
  };
}
