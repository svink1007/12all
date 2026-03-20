import React, { useEffect, useRef, useState } from "react";
import "./styles.scss";
import { isPlatform } from "@ionic/react";
import { MOBILE_VIEW } from "../../shared/constants";

// Define any custom types needed for the Google IMA SDK
declare global {
  interface Window {
    google: any;
  }
}

interface IGoogleAdStreamProp {
  popupVisible: boolean;
  onPopUpVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleClosePopup: () => void;
  popupUrl: string;
  onSetPopUpUrl: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

const GoogleAdStream: React.FC<IGoogleAdStreamProp> = ({
  popupVisible,
  onPopUpVisible,
  handleClosePopup,
  popupUrl,
  onSetPopUpUrl,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const adsLoaderRef = useRef<any>(null);
  const adsManagerRef = useRef<any>(null);
  const adDisplayContainerRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [adsBlocked, setAdsBlocked] = useState<boolean>(false);
  const [adsLoaded, setAdsLoaded] = useState<boolean>(false);
  const [adObject, setAdObject] = useState<any>();

  useEffect(() => {
    const initIMA = () => {
      const videoElement = videoRef.current;

      if (!videoElement) {
        console.error("Video element not found");
        return;
      }

      if (!window.google || !window.google.ima) {
        console.warn(
          "Google IMA SDK is blocked by an ad blocker or not available."
        );
        setAdsBlocked(true); // Set state to handle ad blocker case
        return;
      }

      // Create the ad display container
      adDisplayContainerRef.current = new window.google.ima.AdDisplayContainer(
        document.getElementById("ad-container"),
        videoElement
      );

      // Initialize the ad display container (may require user interaction in some cases)
      adDisplayContainerRef.current.initialize();

      // Create ads loader
      adsLoaderRef.current = new window.google.ima.AdsLoader(
        adDisplayContainerRef.current
      );

      // Add ads loader event listeners
      adsLoaderRef.current.addEventListener(
        window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        onAdsManagerLoaded,
        false
      );
      adsLoaderRef.current.addEventListener(
        window.google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError,
        false
      );

      // Ensure the video element has dimensions and is ready for ad requests
      // Request video ads
      const adsRequest = new window.google.ima.AdsRequest();
      const now = new Date().getTime();

      // URL Encoding (Just in case)
      const adTagUrl = `https://pubads.g.doubleclick.net/gampad/ads?sz=336x280|300x250|400x300|480x720|1024x768&iu=/24458126/O2A_Preroll_web&env=vp&impl=s&gdfp_req=1&output=vast&unviewed_position_start=1&url=https://12all.tv&description_url=https://12all.tv&correlator=${now}`;

      // Log the URL for debugging
      adsRequest.adTagUrl = adTagUrl; // Ensure URL is encoded properly
      adsRequest.linearAdSlotWidth = videoElement.clientWidth;
      adsRequest.linearAdSlotHeight = videoElement.clientHeight;
      adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
      adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

      adsRequest.setAdWillAutoPlay(true);
      adsRequest.setContinuousPlayback(true);

      console.log("Requesting ads...");
      adsLoaderRef.current.requestAds(adsRequest);
    };

    const onAdsManagerLoaded = (adsManagerLoadedEvent: any) => {
      console.log("AdsManager loaded event received.");
      adsManagerRef.current = adsManagerLoadedEvent.getAdsManager(
        videoRef.current
      );

      // Prevent video pause/resume when ad is clicked
      adsManagerRef.current.addEventListener(
        window.google.ima.AdEvent.Type.CLICK,
        (e: any) => {
          e.preventDefault(); // Prevent default click behavior
          e.stopPropagation(); // Stop event propagation
          console.log("Ad click prevented.");
        }
      );

      adsManagerRef.current.addEventListener(
        window.google.ima.AdEvent.Type.LOADED,
        onAdLoaded
      );

      adsManagerRef.current.addEventListener(
        window.google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError
      );

      adsManagerRef.current.addEventListener(
        window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        onAllAdsCompleted
      );

      adsManagerRef.current.addEventListener(
        window.google.ima.AdEvent.Type.SKIPPED,
        onAdSkipped
      );
      adsManagerRef.current.addEventListener(
        window.google.ima.AdEvent.Type.STARTED,
        onAdStarted
      );

      adsManagerRef.current.addEventListener(
        window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        onAdContentPauseRequested
      );

      setAdsLoaded(true);

      try {
        adsManagerRef.current.init(
          videoRef.current!.clientWidth,
          videoRef.current!.clientHeight,
          window.google.ima.ViewMode.NORMAL
        );
        adsManagerRef.current.start();
        console.log("AdsManager started.");

        adsManagerRef.current.setVolume(isMuted ? 0 : 1);
      } catch (adError) {
        console.error("AdsManager could not be started:", adError);
      }
    };

    const onAllAdsCompleted = () => {
      initIMA();
    };

    function onAdLoaded(adEvent: any) {
      var current_ad = adEvent.getAd();
      console.log("CURRENT AD:", current_ad);
      setAdObject(current_ad);
    }

    const onAdError = (adErrorEvent: any) => {
      console.error("Ad error:", adErrorEvent.getError());
      // initIMA();
      adsManagerRef.current?.destroy();
    };

    const onAdSkipped = () => {
      console.log("Ad was skipped.");
      adsManagerRef.current?.destroy();
      setAdsLoaded(false);
    };

    const onAdStarted = () => {
      console.log("Ad has started playing.");
      setAdsLoaded(true); // Set adsStarted to true when the ad starts
    };

    const onAdContentPauseRequested = () => {
      console.log("CONTENT PAUSE REUQEST CALLED");
      adsManagerRef.current.resume();
    };

    const tryAutoplay = async () => {
      try {
        adsManagerRef.current.resume();
        console.log("Video autoplayed successfully");
      } catch (error) {
        console.warn(
          "Autoplay failed. User interaction required to start ads.",
          error
        );
      }
    };

    tryAutoplay(); // Attempt to autoplay the video
    initIMA(); // Initialize IMA SDK for ads

    return () => {
      adsManagerRef.current?.destroy();
    };
  }, []);

  const handleMuteToggle = () => {
    if (!adsManagerRef.current) return;

    const newMuteState = !isMuted;
    setIsMuted(newMuteState); // Toggle mute state
    adsManagerRef.current.setVolume(newMuteState ? 0 : 1); // Mute/Unmute based on state
  };

  const onAdClick = () => {
    if (adObject) {
      var key = Object.keys(adObject)[0] || null;

      if (key && adObject[key]) {
        adsManagerRef.current.resume();
        onSetPopUpUrl(adObject[key].clickThroughUrl); // Set the URL to display in the popup
        onPopUpVisible(true);
      }
    }
  };

  if (adsBlocked) {
    // Fallback if ads are blocked
    return (
      <div className="ads-container">
        <video id="video-player" ref={videoRef} />
        <p style={{ zIndex: 201, color: "white" }}>
          Ads could not be displayed due to ad blocker. Continuing video without
          ads.
        </p>
      </div>
    );
  }

  return (
    <div className="ads-container">
      <div id="ad-container" className={className} onClick={onAdClick}></div>
      <video id="video-player" ref={videoRef} />
      {adsLoaded && (
        <button onClick={handleMuteToggle} id="mute-btn">
          {isMuted ? "Unmute Ads" : "Mute Ads"}
        </button>
      )}
    </div>
  );
};

export default GoogleAdStream;
