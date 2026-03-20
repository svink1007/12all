declare namespace google {
  namespace ima {
    class AdDisplayContainer {
      constructor(adContainerElement: HTMLElement, videoElement: HTMLVideoElement);
      initialize(): void;
    }

    class AdsLoader {
      constructor(adDisplayContainer: AdDisplayContainer);
      requestAds(adsRequest: AdsRequest): void;
      addEventListener(eventType: string, listener: (event: any) => void): void;
      contentComplete(): void;
    }

    class AdsManager {
      init(width: number, height: number, viewMode: ViewMode): void;
      start(): void;
      resize(width: number, height: number, viewMode: ViewMode): void;
      addEventListener(eventType: string, listener: (event: any) => void): void;
    }

    class AdsRequest {
      adTagUrl: string;
      linearAdSlotWidth: number;
      linearAdSlotHeight: number;
      nonLinearAdSlotWidth: number;
      nonLinearAdSlotHeight: number;
    }

    enum ViewMode {
      NORMAL,
      FULLSCREEN
    }

    interface AdsManagerLoadedEvent {
      getAdsManager(videoElement: HTMLVideoElement): AdsManager;
    }

    interface AdErrorEvent {
      getError(): Error;
    }

    interface AdEvent {
      getAd(): Ad;
    }

    interface Ad {
      isLinear(): boolean;
    }

    namespace AdsManagerLoadedEvent {
      const Type: {
        ADS_MANAGER_LOADED: 'adsManagerLoaded';
      };
    }

    namespace AdErrorEvent {
      const Type: {
        AD_ERROR: 'adError';
      };
    }

    namespace AdEvent {
      const Type: {
        CONTENT_PAUSE_REQUESTED: 'contentPauseRequested';
        CONTENT_RESUME_REQUESTED: 'contentResumeRequested';
        LOADED: 'loaded';
        ALL_ADS_COMPLETED: string;
        CLICK: string;
        COMPLETE: string;
        FIRST_QUARTILE: string;
        LOADED: string;
        MIDPOINT: string;
        PAUSED: string;
        RESUMED: string;
        STARTED: string;
        THIRD_QUARTILE: string;
      };
    }
  }
}
