import VertoNotification from './VertoNotification';

export type WsRequest = {
  method: string;
  id: number;
  jsonrpc: string;
  params: { sessid: string };
};

export type VertoSessionParams = {
  callerName: string;
  realNumber: string;
  streamNumber?: string;
  localStream: MediaStream;
  secondary?: boolean;
  giveFloor?: boolean;
  channelName?: string;
  moderatorUsername?: string;
  moderatorPassword?: string;
  fsUrl?: string;
  isHost?: boolean;
  isHostSharedVideo?: boolean;
  notifyOnStateChange?: boolean;
  receivePrimaryCallStream?: boolean;
  userId?: number;
  connectionType: string;
  outgoingBandwidth: number;
  incomingBandwidth: number;
  destinationNumber: string;
};

export type VertoCallParams = {
  moderatorUsername: string;
  destinationNumber: string;
  localStream: MediaStream;
  notifyOnStateChange: boolean;
  notification: VertoNotification;
  showMe: boolean;
  callerName: string;
  receiveStream: boolean;
  outgoingBandwidth: number;
  incomingBandwidth: number;
  isPrimaryCall?: boolean;
  isHost?: boolean;
  isHostSharedVideo?: boolean;
  channelName?: string;
  userId?: number;
  connectionType: string;
  onDestroy?: () => void;
  onRTCStateChange?: () => void;
  onRemoteStream?: (stream: MediaStream) => void;
};

export enum VertoLayout {
  OnlyVideo = '1x1',
  VideoLeftSmall = '1up_top_left+9',
  VideoLeftLarge = '1up_top_left+9_orig',
  VideoCenter = '1center_left_10_right_10_bbottom_10'
}

export type ConferenceLiveArrayJoinData = {
  action: string;
  callID: string;
  canvasCount: number;
  chatChannel: string;
  chatID: string;
  conferenceMemberID: string;
  infoChannel: string;
  laChannel: string;
  laName: string;
  modChannel: string;
  role: string;
};
