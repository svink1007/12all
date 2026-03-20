export type MyStreamType =
  | "audio/mpeg"
  | "audio/wav"
  | "video/mp4"
  | "video/webm"
  | "video/ogg"
  | "application/x-mpegURL"
  | "application/dash+xml";
export type FileStreamType =
  | "audio/mpeg"
  | "audio/wav"
  | "video/mp4"
  | "video/webm"
  | "video/ogg";

export type MyStreamSource = { src: string; type: MyStreamType };
export type FileStreamSource = {
  id: number;
  src: string;
  type: FileStreamType;
  fileName: string;
};
