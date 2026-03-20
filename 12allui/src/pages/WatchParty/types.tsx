export interface HTMLVideoStreamElement extends HTMLVideoElement {
  captureStream?: () => MediaStream
  mozCaptureStream?: () => MediaStream
}

export interface HtmlCanvasStreamEl extends HTMLCanvasElement {
  captureStream: (frameRate?: number) => MediaStream
}

export type MyStreamType = 'audio/mpeg' | 'audio/wav' | 'video/mp4' | 'video/webm' | 'video/ogg' | 'application/x-mpegURL' | 'application/dash+xml';
export type FileStreamType = 'audio/mpeg' | 'audio/wav' | 'video/mp4' | 'video/webm' | 'video/ogg';

export type MyStreamSource = { src: string, type: MyStreamType };
export type FileStreamSource = { id: number, src: string, type: FileStreamType; fileName: string };

export type WebRTCUserMedia = { cam: string, mic: string };

export type SendWsRequest = {
  method: string,
  params: any,
  onSuccess: (data: any) => void,
  onError: (err?: any) => void
};

class Type {
  value: MyStreamType;
  label: string;
  local: boolean;

  constructor(value: MyStreamType, label: string, local: boolean = true) {
    this.value = value;
    this.label = label;
    this.local = local;
  }
}

export const TYPES = [
  new Type('audio/wav', 'wav'),
  new Type('audio/mpeg', 'mp3'),
  new Type('video/mp4', 'mp4'),
  new Type('video/webm', 'webm'),
  new Type('video/ogg', 'ogg'),
  new Type('application/x-mpegURL', 'm3u8', false),
  new Type('application/dash+xml', 'mpd', false)
];

export type MediaState = {camStopped: boolean, micMuted: boolean};
