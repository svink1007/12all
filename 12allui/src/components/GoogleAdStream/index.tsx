import React, { useEffect, useRef, useState } from "react";
import "./styles.scss";
import sharedStream from "../../pages/SharedStream";
import {StreamService} from "../../services/StreamService";

// Define any custom types needed for the Google IMA SDK
declare global {
  interface Window {
    google: any;
  }
}

export const GoogleAdStream2: React.FC<{ adData?: any, setAdData?: any; className?: string }> = ({ className, setAdData, adData = {} }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const adsLoaderRef = useRef<any>(null);
  const adsManagerRef = useRef<any>(null);
  const adDisplayContainerRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [adsBlocked, setAdsBlocked] = useState<boolean>(false);
  const [adsLoaded, setAdsLoaded] = useState<boolean>(false);

  let adTrackingData = adData

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

      // Request video ads
      const adsRequest = new window.google.ima.AdsRequest();
      const now = new Date().getTime();
      adsRequest.adTagUrl = `https://pubads.g.doubleclick.net/gampad/ads?sz=336x280|300x250|400x300|480x720|1024x768&iu=/24458126/O2A_Preroll_web&env=vp&impl=s&gdfp_req=1&output=vast&unviewed_position_start=1&url=https://12all.tv&description_url=https://12all.tv&correlator=${now}`;

      adTrackingData = {
        ...adTrackingData,
        ad_source: adsRequest.adTagUrl
      }

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

      adsManagerRef.current.addEventListener(
          window.google.ima.AdErrorEvent.Type.AD_ERROR,
          onAdError
      );
      adsManagerRef.current.addEventListener(
          window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
          onContentPauseRequested
      );
      adsManagerRef.current.addEventListener(
          window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
          onContentResumeRequested
      );

      adsManagerRef.current.addEventListener(
          window.google.ima.AdEvent.Type.CLICK,
          onAdClick,
          false
      );

      // Add an event listener for when all ads are completed
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

    const onAdClick = () => {
      console.log("Ad clicked, opening link in new tab.");
      // Prevent pausing or stopping the video when ad is clicked
      adsManagerRef.current.resume();
    };

    const onAdError = (adErrorEvent: any) => {
      console.error("Ad error:", adErrorEvent.getError());
      adsManagerRef.current?.destroy();
    };

    const onContentPauseRequested = () => {
      console.log("Content pause requested.");
      videoRef.current?.pause();
    };

    const onContentResumeRequested = () => {
      console.log("Content resume requested.");
      // Prevent the content from resuming after ads
      adsManagerRef.current.resume();
    };

    const onAllAdsCompleted = () => {
      console.log("All ads completed. Restarting ads.");
      adsManagerRef.current?.destroy(); // Destroy current ad manager

      const now = new Date();
      const isoString = now.toISOString();
      adTrackingData = {
        ...adTrackingData,
        ad_run_time: isoString
      }

      StreamService.sendAdTracking(adTrackingData)
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
        <div id="ad-container" className={className}></div>
        <video id="video-player" ref={videoRef} />
        {adsLoaded && (
            <button onClick={handleMuteToggle} id="mute-btn">
              {isMuted ? "Unmute Ads" : "Mute Ads"}
            </button>
        )}
      </div>
  );
};

const GoogleAdStream: React.FC<{ adData?: any, className?: string, id?: number|null; delay?: number; onDelay?: any; afterFunc?: any; setAdData?: any; visible?: boolean; }> = ({ className, id, onDelay, afterFunc, visible, setAdData, delay = 0, adData = {} }) => {
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const adsLoaderRef = useRef<any>(null);
  const adsManagerRef = useRef<any>(null);
  const adDisplayContainerRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [adsBlocked, setAdsBlocked] = useState<boolean>(false);
  const [adsLoaded, setAdsLoaded] = useState<boolean>(false);

  let adTrackingData = adData

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

      // Request video ads
      const adsRequest = new window.google.ima.AdsRequest();
      const now = new Date().getTime();
      adsRequest.adTagUrl = `https://pubads.g.doubleclick.net/gampad/ads?sz=336x280|300x250|400x300|480x720|1024x768&iu=/24458126/O2A_Preroll_web&env=vp&impl=s&gdfp_req=1&output=vast&unviewed_position_start=1&url=https://12all.tv&description_url=https://12all.tv&correlator=${now}`;

      adTrackingData = {
        ...adTrackingData,
        ad_source: adsRequest.adTagUrl
      }

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

      adsManagerRef.current.addEventListener(
          window.google.ima.AdErrorEvent.Type.AD_ERROR,
          onAdError
      );
      adsManagerRef.current.addEventListener(
          window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
          onContentPauseRequested
      );
      adsManagerRef.current.addEventListener(
          window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
          onContentResumeRequested
      );

      adsManagerRef.current.addEventListener(
          window.google.ima.AdEvent.Type.CLICK,
          onAdClick,
          false
      );

      // Add an event listener for when all ads are completed
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

    const onAdClick = () => {
      console.log("Ad clicked, opening link in new tab.");
      // Prevent pausing or stopping the video when ad is clicked
      adsManagerRef.current.resume();
    };

    const onAdError = (adErrorEvent: any) => {
      console.error("Ad error:", adErrorEvent.getError());
      adsManagerRef.current?.destroy();
    };

    const onContentPauseRequested = () => {
      console.log("Content pause requested.");
      videoRef.current?.pause();
    };

    const onContentResumeRequested = () => {
      console.log("Content resume requested.");
      // Prevent the content from resuming after ads
      adsManagerRef.current.resume();
    };

    const onAllAdsCompleted = () => {
      setShowAd(false)
      setAdsLoaded(false);
      adsManagerRef.current?.destroy(); // Destroy current ad manager

      const now = new Date();
      const isoString = now.toISOString();
      adTrackingData = {
        ...adTrackingData,
        ad_run_time: isoString
      }

      StreamService.sendAdTracking(adTrackingData)

      if(onDelay){
        onDelay(null)
      }
      if(afterFunc){
        afterFunc(1)
      }
    };

    const onAdSkipped = () => {
      console.log("Ad was skipped.");
      adsManagerRef.current?.destroy();
      setAdsLoaded(false);
    };

    const onAdStarted = () => {
      afterFunc(0)
      console.log("Ad has started playing.");
      setAdsLoaded(true); // Set adsStarted to true when the ad starts
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
  }, [id, afterFunc, visible]);

  const [showAd, setShowAd] = useState(id !== null);

  useEffect(() => {
    console.log("Show Ad", showAd)
  }, [showAd])

  useEffect(() => {
    console.log("Loaded Ad", adsLoaded)
  }, [adsLoaded])

  const handleMuteToggle = () => {
    if (!adsManagerRef.current) return;

    const newMuteState = !isMuted;
    setIsMuted(newMuteState); // Toggle mute state
    adsManagerRef.current.setVolume(newMuteState ? 0 : 1); // Mute/Unmute based on state
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
      <>
        {
          showAd ?
              <div className="ads-container">
                <div id="ad-container" className={className}></div>
                <video id="video-player" ref={videoRef} />
                {adsLoaded && (
                    <button onClick={handleMuteToggle} id="mute-btn">
                      {isMuted ? "Unmute Ads" : "Mute Ads"}
                    </button>
                )}
              </div> : <></>
        }
      </>
  );

};

export default GoogleAdStream;

