import { SET_APP_CONFIG } from "../types/types";
import { Action, AppConfig } from "../types";
import VertoVariables from "../../verto/VertoVariables";

const INITIAL: AppConfig = {
  adInterval: 120,
  adPublisherIdAndroid: "",
  adPublisherIdIOS: "",
  adShowInTheBeginning: true,
  roomInactiveTimeout: 120,
  userCameraMaxWidth: 320,
  streamMaxReconnectAttempts: 10,
  streamReconnectInterval: 4,
  streamPlayTimeout: 15,
  phoneNumbers: [],
  previewClip: "",
  updateStreamSnapshotsInterval: 10,
  androidWebViewToUseCaptureStream: "",
  inAppProrotaionMode: "DEFERRED",
  sdpVideoCodecRegex: VertoVariables.sdpVideoCodecRegex,
  astraUrl: "",
};

export default function reducer(
  state: AppConfig = INITIAL,
  { type, payload }: Action<AppConfig>
) {
  switch (type) {
    case SET_APP_CONFIG:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
