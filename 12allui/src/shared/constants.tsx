import {Routes} from './routes';

export const BILLING_SOCKET = "wss://billing.o2abilling.store/backend/websocket"

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID as string;
export const AVATAR_HOST = process.env.REACT_APP_HOST as string;
export const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID as string;
export const PUBLIC_VAPID_KEY = process.env.REACT_APP_PUBLIC_VAPID_KEY as string;

export const API_URL = process.env.REACT_APP_API_URL as string;
export const SNAPSHOT_URL = process.env.REACT_APP_SNAPSHOT_URL as string;

export const HOST_URL = process.env.REACT_APP_API_HOST as string;

export const VOD_FILE_HOST = process.env.REACT_APP_VOD_FILE_HOST as string;
export const PAYMENT_URL = process.env.REACT_APP_PAYMENT_LINK as string;
export const PAYMENT_BACKEND_URL = process.env.REACT_APP_PAYMENT_BACKEND_URL as string;

export const WEBSOCKET_PASSWORD = process.env.REACT_APP_WEBSOCKET_PASSWORD as string;
export const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL as string;

export const AD_SENSE_CLIENT = process.env.REACT_APP_AD_SENSE_CLIENT as string;
export const AD_SENSE_URL = `${process.env.REACT_APP_AD_SENSE_URL}?client=${AD_SENSE_CLIENT}`;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const WP_MIC = "wpMic";
export const WP_CAM = "wpCam";

export const WP_TEMPLATES = "wpTemplates";
export const INIT_VOL = 0.5;
export const INIT_GAIN_VOL = 1;

export const IS_IN_FULLSCREEN = () =>
  !!(
    document.fullscreenElement ||
    // @ts-ignore
    document.webkitFullscreenElement ||
    // @ts-ignore
    document.msFullscreenElement
  );

export const MAIN_CONTENT_ID = 'main-content';
export const IS_CHROME = !!navigator.userAgent.match('Chrome');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const parseRoomStart = (startAt: string) => {
  const now = new Date();
  const startAtDate = new Date(startAt);
  const year = startAtDate.getFullYear() !== now.getFullYear() ? startAtDate.getFullYear() : '';
  const date = startAtDate.toDateString() === now.toDateString() ? 'Today,' : `${MONTHS[startAtDate.getMonth()]}, ${startAtDate.getDate()} ${year ? year + ' ' : ''}`
  return `${date} ${startAtDate.getHours()}:${startAtDate.getMinutes().toString().padStart(2, '0')}`;
};

export const generateWatchPartyInvitationUrl = (publicId: string) => `${window.location.origin}${Routes.WatchParty}/${publicId}`;

export const generateVideoOnDemandInvitationUrl = (publicId: string) => `${window.location.origin}${Routes.Vod}/${publicId}`;

export const parseVlrScheduleStartAt = (iso: string) => {
  const date = new Date(iso);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${date.getHours()}:${pad(date.getMinutes())}`;
};

export const getHostUrl = () => {
  if(["localhost"].includes(HOST_URL)) {
    return `http://${HOST_URL}:3000`
  } else {
    return `https://${HOST_URL}`
  }
}
