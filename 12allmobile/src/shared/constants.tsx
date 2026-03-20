import { isPlatform } from "@ionic/react";
import { Routes } from "./routes";

export const APP_URL = process.env.REACT_APP_APP_URL as string;
export const API_URL = process.env.REACT_APP_API_URL as string;
export const STREAM_URL = `${APP_URL}${Routes.Stream}`;

export const WEBSOCKET_PASSWORD = process.env
  .REACT_APP_WEBSOCKET_PASSWORD as string;
export const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL as string;

export const PAYMENT_URL = process.env.REACT_APP_PAYMENT_LINK as string;
export const PAYMENT_BACKEND_URL = process.env
  .REACT_APP_PAYMENT_BACKEND_URL as string;

export const APPSFLYER_ANDROID_KEY = process.env
  .REACT_APP_APPSFLYER_ANDROID_KEY as string;
export const APPSFLYER_IOS_KEY = process.env
  .REACT_APP_APPSFLYER_IOS_KEY as string;
export const IOS_APP_ID = process.env.REACT_APP_IOS_APP_ID as string;

export const MOBILE_VIEW = !isPlatform("mobileweb") && !isPlatform("desktop");
export const LAYOUT_ID = "main-content";
export const ENV_IS_DEVELOPMENT = process.env.REACT_APP_ENV === "development";

export const DEBUG_MODE = process.env.REACT_APP_DEBUG === "true";
export const DEBUG_PHONE_NUMBER = process.env.REACT_APP_DEBUG_PHONE_NUMBER;
export const DEBUG_TOKEN = API_URL.includes("wp")
  ? process.env.REACT_APP_DEBUG_TOKEN_WP
  : API_URL.includes("be")
    ? process.env.REACT_APP_DEBUG_TOKEN_BE
    : process.env.REACT_APP_DEBUG_TOKEN_LOCAL;

// export const DEBUG_MODE = true;
// export const DEBUG_PHONE_NUMBER = '359884094589';
// export const DEBUG_TOKEN = 'JHQx58YY8wwcD5g1QIZNYOXg95ead5uD'; // be
// export const DEBUG_TOKEN = 'HoizmUsHZJv1EgOI9oyp3KUEUtw5OdXv'; // wp

export const BROADCASTS_PER_SCROLL = isPlatform("tablet") ? 140 : 40;
export const PUSH_NOTIFICATION_APP_NAME = "main";

export const getHostUrl = () => {
  if (["localhost"].includes(API_URL)) {
    return `http://${API_URL}:3000`;
  } else {
    return `https://${API_URL}`;
  }
};
export const ON_CHANNEL_PREVIEW_ERROR = 'ON_CHANNEL_IMG_ERROR';
export const ON_CHANNEL_PREVIEW_LOADED = 'ON_CHANNEL_PREVIEW_LOADED';
export const SET_CHANNELS = 'SET_CHANNELS';
export const SET_FAVORITE_STREAMS = 'SET_FAVORITE_STREAMS';
export const SET_FAVORITE_LIVE_ROOMS = 'SET_FAVORITE_LIVE_ROOMS';
export const TOGGLE_CHANNEL_FAVORITE = 'TOGGLE_CHANNEL_FAVORITE';
