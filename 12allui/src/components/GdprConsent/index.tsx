import React, { useEffect, useRef } from "react";
import "./styles.scss"
import { IonButton, IonContent, IonImg, IonLabel, IonModal } from "@ionic/react";
import userCircleIcon from "../../images/icons/userCircle.svg"
import devicesIcon from "../../images/icons/devices.svg"
import downArrowCircle from "../../images/icons/downArrowCircle.svg"

type GdprProps = {
  setShowGdpr: (arg: boolean) => void;
};

export default function GdprConsent({setShowGdpr}: GdprProps) {
  const modalRef = useRef<HTMLIonModalElement>(null);

  const handleDoNotConsent = () => {
    modalRef.current?.dismiss()
    setShowGdpr(false)
  }

  const handleConsent = () => {
    modalRef.current?.dismiss()
    setShowGdpr(false)
  }

  useEffect(() => {
    modalRef.current?.present();
  }, [])

  return (
    <div
      className="gdpr-modal"
    >
      <IonModal id="gdpr-info-modal" ref={modalRef} trigger="open-modal" backdropDismiss={false} >
        <IonContent className="gdpr-modal-content" style={{ overflow: "hidden" }}>
          <div className="modal-header">
            <IonLabel className="gdpr-modal-title ion-text-wrap ion-text-center">
              One2all.tv asks for your consent to use your personal data to:
            </IonLabel>
          </div>

          <div className="gdpr-modal-info-lists">
            <div className="gdpr-modal-list">
              <IonImg src={userCircleIcon} style={{ width: 60, marginLeft: "-5px" }} />
              <IonLabel className="list-label ion-text-wrap">
                Personalised advertising and content, advertising and content measurement, audience research and services development
              </IonLabel>
            </div>

            <div className="gdpr-modal-list">
              <IonImg src={devicesIcon} />
              <IonLabel className="list-label ion-text-wrap">
                Store and/or access information on a device
              </IonLabel>
            </div>

            <div className="gdpr-modal-list">
              <IonImg src={downArrowCircle} />
              <IonLabel className="list-label ion-text-wrap">
                Learn more
              </IonLabel>
            </div>

          </div>


          <div className="modal-data-info">
            <IonLabel className="modal-title ion-text-wrap">
              Your personal data will be processed and information from your device (cookies, unique identifiers, and other device data) may be stored by, accessed by and shared with 136 TCF vendor(s) and 66 ad partner(s), or used specifically by this site or app.
            </IonLabel>

            <IonLabel className="modal-title ion-text-wrap">
              Some vendors may process your personal data on the basis of legitimate interest, which you can object to by managing your options below. Look for a link at the bottom of this page or in our privacy policy where you can withdraw consent.
            </IonLabel>
          </div>

          <div className="modal-consent-buttons">
            <IonButton onClick={(e) => {
              handleDoNotConsent()
            }}>
              DO NOT CONSENT
            </IonButton>

            <IonButton onClick={() => {
              handleConsent()
            }}>
              CONSENT
            </IonButton>
          </div>

        </IonContent>
      </IonModal>


    </div>
  );
}

