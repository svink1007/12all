import React, { useEffect, useState } from "react";
import { initGA, trackPage } from "../../utils/analytics";
import { IonButton, IonContent } from "@ionic/react";
import "./styles.scss";

type G = {
  showGModal: boolean;
  setShowGModal: (showGModal: boolean) => void;
};

const Gdpr: React.FC<G> = (props) => {
  const { showGModal, setShowGModal } = props;
  const [animationClass, setAnimationClass] = useState<string>("slide-up");
  useEffect(() => {
    const consentGiven = localStorage.getItem("gaConsent") === "true";
    if (consentGiven) {
      initGA();
      trackPage(window.location.pathname);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gaConsent", "true");
    initGA();
    trackPage(window.location.pathname);
    setShowGModal(false);
    setAnimationClass("slide-down");
  };
  const handleDecline = () => {
    localStorage.setItem("gaConsent", "false");
    setShowGModal(false);
    setAnimationClass("slide-down");
  };

  return (
    <div className="gModalContainer">
      <div className={`gModalContent ${animationClass}`}>
        <div>
          <span>Privacy Notice</span>
          <p>
            We use cookies to improve your experience, analyze site traffic, and
            serve targeted ads. By using this app, you agree to our use of
            cookies.
          </p>
          <IonButton onClick={handleAccept}>Accept</IonButton>
          <IonButton onClick={handleDecline}>Decline</IonButton>
        </div>
      </div>
    </div>
  );
};

export default Gdpr;
