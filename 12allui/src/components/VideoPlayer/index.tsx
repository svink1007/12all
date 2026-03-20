import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import './styles.scss';

declare global {
  interface Window {
    google: any;
  }
}

export interface VideoPlayerProps {
  url: string;
  playing?: boolean;
  controls?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: number;
  width?: string | number;
  height?: string | number;
  adTagUrl?: string;
  onReady?: () => void;
  onStart?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
  onAdStarted?: () => void;
  onAdComplete?: () => void;
  onAdError?: (error: any) => void;
  className?: string;
}

export interface VideoPlayerRef {
  seekTo: (amount: number, type?: 'seconds' | 'fraction') => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getInternalPlayer: () => HTMLVideoElement;
  loadAds: () => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>((props, ref) => {
  const playerRef = useRef<ReactPlayer>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adDisplayContainer, setAdDisplayContainer] = useState<any>(null);
  const [adsLoader, setAdsLoader] = useState<any>(null);
  const [adsManager, setAdsManager] = useState<any>(null);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  const cleanup = useCallback(() => {
    if (adsManager) {
      adsManager.destroy();
    }
    if (adsLoader) {
      adsLoader.destroy();
    }
  }, [adsManager, adsLoader]);

  const onAdError = useCallback((adErrorEvent: any) => {
    console.log('Ad error:', adErrorEvent.getError());
    props.onAdError?.(adErrorEvent.getError());
    if (adsManager) {
      adsManager.destroy();
    }
    setIsAdPlaying(false);
  }, [adsManager, props]);

  const onAdsManagerLoaded = useCallback((adsManagerLoadedEvent: any) => {
    const adsRenderingSettings = new window.google.ima.AdsRenderingSettings();
    const adsManager = adsManagerLoadedEvent.getAdsManager(
      playerRef.current?.getInternalPlayer() as HTMLVideoElement,
      adsRenderingSettings
    );
    setAdsManager(adsManager);

    adsManager.addEventListener(window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
      setIsAdPlaying(true);
      props.onAdStarted?.();
    });

    adsManager.addEventListener(window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
      setIsAdPlaying(false);
      props.onAdComplete?.();
    });

    adsManager.addEventListener(window.google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);

    try {
      const videoElement = playerRef.current?.getInternalPlayer() as HTMLVideoElement;
      adsManager.init(
        videoElement.clientWidth,
        videoElement.clientHeight,
        window.google.ima.ViewMode.NORMAL
      );
      adsManager.start();
    } catch (adError) {
      onAdError(adError);
    }
  }, [props, onAdError]);

  const initializeIMA = useCallback(() => {
    if (!window.google || !props.adTagUrl) return;

    const videoElement = playerRef.current?.getInternalPlayer() as HTMLVideoElement;
    const adDisplayContainer = new window.google.ima.AdDisplayContainer(
      adContainerRef.current,
      videoElement
    );
    setAdDisplayContainer(adDisplayContainer);

    const adsLoader = new window.google.ima.AdsLoader(adDisplayContainer);
    setAdsLoader(adsLoader);

    adsLoader.addEventListener(
      window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
    );

    adsLoader.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false
    );
  }, [props.adTagUrl, onAdsManagerLoaded, onAdError]);

  useEffect(() => {
    // Load IMA SDK
    const script = document.createElement('script');
    script.src = '//imasdk.googleapis.com/js/sdkloader/ima3.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = initializeIMA;

    return () => {
      document.body.removeChild(script);
      cleanup();
    };
  }, [initializeIMA, cleanup]);

  const loadAds = useCallback(() => {
    if (!props.adTagUrl || !adsLoader || !adDisplayContainer) return;

    adDisplayContainer.initialize();

    const videoElement = playerRef.current?.getInternalPlayer() as HTMLVideoElement;
    const width = videoElement?.clientWidth || 640;
    const height = videoElement?.clientHeight || 360;

    const adsRequest = new window.google.ima.AdsRequest();
    adsRequest.adTagUrl = props.adTagUrl;
    adsRequest.linearAdSlotWidth = width;
    adsRequest.linearAdSlotHeight = height;
    adsRequest.nonLinearAdSlotWidth = width;
    adsRequest.nonLinearAdSlotHeight = height / 3;

    adsLoader.requestAds(adsRequest);
  }, [props.adTagUrl, adsLoader, adDisplayContainer]);

  useImperativeHandle(ref, () => ({
    seekTo: (amount, type) => {
      if (!isAdPlaying) {
        playerRef.current?.seekTo(amount, type);
      }
    },
    getCurrentTime: () => {
      return playerRef.current?.getCurrentTime() || 0;
    },
    getDuration: () => {
      return playerRef.current?.getDuration() || 0;
    },
    getInternalPlayer: () => {
      return playerRef.current?.getInternalPlayer() as HTMLVideoElement;
    },
    loadAds
  }), [loadAds, isAdPlaying]);

  return (
    <div className="video-player-container">
      <ReactPlayer
        ref={playerRef}
        url={props.url}
        className={`react-player ${props.className || ''} ${isAdPlaying ? 'ad-playing' : ''}`}
        playing={props.playing}
        controls={!isAdPlaying && props.controls}
        muted={props.muted}
        volume={props.volume}
        playbackRate={props.playbackRate}
        width={props.width || '100%'}
        height={props.height || '100%'}
        onReady={props.onReady}
        onStart={props.onStart}
        onPlay={() => {
          if (!isAdPlaying) {
            props.onPlay?.();
          }
        }}
        onPause={() => {
          if (!isAdPlaying) {
            props.onPause?.();
          }
        }}
        onEnded={props.onEnded}
        onError={props.onError}
        onProgress={(state) => {
          if (!isAdPlaying) {
            props.onProgress?.(state);
          }
        }}
        onDuration={props.onDuration}
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous',
              playsInline: true
            },
            forceVideo: true,
            forceHLS: true
          }
        }}
      />
      <div 
        ref={adContainerRef} 
        className="ad-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: isAdPlaying ? 1 : -1
        }}
      />
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
