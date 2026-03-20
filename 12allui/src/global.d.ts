// src/global.d.ts
import videojs from 'video.js';

declare module 'videojs-ima' {
  const ima: any;
  export default ima;
}

declare module 'video.js' {
  interface VideoJsPlayer {
    ima: {
      (options: any): void;
      initializeAdDisplayContainer(): void;
      setContentWithAdTag(contentSrc: string | null, adTagUrl: string, playOnLoad: boolean): void;
      requestAds(): void;
      addEventListener(event: string, callback: (event: any) => void): void;
    };
  }
}

