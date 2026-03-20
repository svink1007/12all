import ReactPlayer from 'react-player';

declare module 'react-player' {
  interface ReactPlayerProps {
    url: string;
    playing?: boolean;
    loop?: boolean;
    controls?: boolean;
    light?: boolean;
    volume?: number;
    muted?: boolean;
    playbackRate?: number;
    width?: string | number;
    height?: string | number;
    style?: object;
    progressInterval?: number;
    playsinline?: boolean;
    pip?: boolean;
    stopOnUnmount?: boolean;
    fallback?: React.ReactElement;
    wrapper?: any;
    playIcon?: React.ReactElement;
    previewTabIndex?: number;
    config?: {
      youtube?: {
        playerVars?: object;
        embedOptions?: object;
      };
      facebook?: {
        appId?: string;
      };
      dailymotion?: {
        params?: object;
      };
      vimeo?: {
        playerOptions?: object;
      };
      file?: {
        attributes?: object;
        tracks?: Array<{
          kind: string;
          src: string;
          srcLang?: string;
          label?: string;
          default?: boolean;
        }>;
        forceVideo?: boolean;
        forceAudio?: boolean;
        forceHLS?: boolean;
        forceDASH?: boolean;
        forceFLV?: boolean;
        hlsVersion?: string;
        hlsOptions?: object;
        dashVersion?: string;
        flvVersion?: string;
      };
    };
    onReady?: (player: ReactPlayer) => void;
    onStart?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onBuffer?: () => void;
    onBufferEnd?: () => void;
    onError?: (error: any, data?: any, hlsInstance?: any, hlsGlobal?: any) => void;
    onDuration?: (duration: number) => void;
    onSeek?: (seconds: number) => void;
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
    onEnded?: () => void;
    onEnablePIP?: () => void;
    onDisablePIP?: () => void;
  }

  export default class ReactPlayer extends React.Component<ReactPlayerProps> {
    static canPlay(url: string): boolean;
    seekTo(amount: number, type?: 'seconds' | 'fraction'): void;
    getCurrentTime(): number;
    getSecondsLoaded(): number;
    getDuration(): number;
    getInternalPlayer(key?: string): any;
  }
}
