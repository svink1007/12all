type Audio = { muted: boolean; talking: boolean };
type Video = { muted: boolean; floor: boolean; floorLocked: boolean; };

export interface ParticipantParams {
  callId: string;
  participantId: string;
  participantName?: string;
  audio: Audio;
  video: Video;
  me?: boolean;
  showMe?: boolean;
  isHost?: boolean;
  channelName?: string;
  isHostSharedVideo?: boolean;
  isMobileApp?: boolean;
  isVlrConnection?: boolean;
  isCoHost?: boolean;
  isPrimaryCall?: boolean;
  userId?: number;
  hasSocket?: boolean;
}

export class Participant {
  readonly callId: string;
  readonly participantId: string;
  readonly participantName: string;
  readonly avatar: { text: string; color: string; };
  readonly me?: boolean;
  readonly showMe?: boolean;
  readonly isHost?: boolean;
  readonly isHostSharedVideo?: boolean;
  readonly channelName?: string;
  readonly isMobileApp?: boolean;
  readonly isVlrConnection?: boolean;
  readonly isPrimaryCall?: boolean;
  readonly hasSocket?: boolean;
  readonly userId?: number;
  private _unread = 0;
  private _isActive = true;
  private _isCoHost = false;
  private _audio: Audio = { muted: true, talking: false };
  private _video: Video = { muted: true, floor: false, floorLocked: false };

  constructor(params: ParticipantParams) {
    const {
      callId,
      participantId,
      me,
      showMe,
      participantName,
      audio,
      video,
      isHost,
      isHostSharedVideo,
      channelName,
      isMobileApp,
      isVlrConnection,
      isPrimaryCall,
      userId,
      isCoHost,
      hasSocket
    } = params;
    this.callId = callId;
    this.participantId = participantId;
    this.participantName = participantName || '';
    this.avatar = {
      text: this.participantName.charAt(0),
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    };
    this.audio = audio;
    this.video = video;
    this.me = me;
    this.showMe = showMe;
    this.isHost = isHost;
    this.isHostSharedVideo = isHostSharedVideo;
    this.channelName = channelName;
    this.isMobileApp = isMobileApp;
    this.isVlrConnection = isVlrConnection;
    this.isPrimaryCall = isPrimaryCall;
    this.userId = userId;
    this.isCoHost = isCoHost || false;
    this.hasSocket = hasSocket;
  }

  get unread() {
    return this._unread;
  }

  set unread(value: number) {
    this._unread = value;
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
  }

  get isCoHost() {
    return this._isCoHost;
  }

  set isCoHost(value: boolean) {
    this._isCoHost = value;
  }

  get audio() {
    return this._audio;
  }

  set audio(value: Audio) {
    this._audio = value;
  }

  get video() {
    return this._video;
  }

  set video(value: Video) {
    this._video = value;
  }
}
