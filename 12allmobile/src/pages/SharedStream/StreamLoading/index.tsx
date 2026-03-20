import React, { FC, useEffect, useRef, useState } from "react";
import "./styles.scss";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonModal,
  IonText,
} from "@ionic/react";
import ShareInvitation from "./ShareInvitation";
import { API_URL, STREAM_URL } from "../../../shared/constants";
import Loading from "./Loading";
import { StreamVlr } from "../index";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { ReduxSelectors } from "../../../redux/types";
import { volumeHighOutline, volumeMuteOutline } from "ionicons/icons";
import appStorage from "../../../shared/appStorage";
import GoogleAdStream from "../../../components/GoogleAdStream";

type Props = {
  loading: boolean;
  imHost: boolean | null;
  showLeaveButton: boolean;
  streamVlr: StreamVlr;
  reconnecting: boolean;
  onLeave: () => void;
};

const MUTE_STREAM_LOADING_PREVIEW = "muteStreamLoadingPreview";

const StreamLoading: FC<Props> = ({
  loading,
  imHost,
  showLeaveButton,
  streamVlr,
  reconnecting,
  onLeave,
}: Props) => {
  const { id } = useParams<{ id: string; roomId?: string }>();
  const { t } = useTranslation();
  const { previewClip } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );
  const streamVideoRef = useRef<HTMLVideoElement>(null);
  const [muteVideo, setMuteVideo] = useState<boolean>(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupUrl, setPopupUrl] = useState("");

  useEffect(() => {
    appStorage.getItem(MUTE_STREAM_LOADING_PREVIEW).then((value) => {
      if (value && value === "true") {
        setMuteVideo(true);
      }
    });
  }, []);

  const handleMuteVideo = () => {
    appStorage
      .setItem(MUTE_STREAM_LOADING_PREVIEW, (!muteVideo).toString())
      .then();
    setMuteVideo(!muteVideo);
  };

  const handleVideoLoadStart = () => {
    if (streamVideoRef.current) {
      streamVideoRef.current.volume = 0.1;
    }
  };

  const handleClosePopup = () => {
    setPopupVisible(false); // Hide the popup
  };

  if (!loading) return null;

  return (
    <>
      <div className="custom-modal-backdrop"></div>
      <div
        className={`custom-modal ${loading ? "show" : ""} stream-loading-modal`}
      >
        {imHost ? (
          <IonCard className="host-loading-card">
            <IonCardContent>
              <div className="player">
                {/* <video
                  ref={streamVideoRef}
                  src={`${API_URL}${previewClip}`}
                  autoPlay
                  loop
                  muted={muteVideo}
                  onLoadStart={handleVideoLoadStart}
                  playsInline
                />
                <IonButtons className="player-buttons">
                  <IonButton onClick={handleMuteVideo} color="dark">
                    <IonIcon
                      slot="icon-only"
                      icon={muteVideo ? volumeMuteOutline : volumeHighOutline}
                    />
                  </IonButton>
                </IonButtons> */}
                <GoogleAdStream
                  popupVisible={popupVisible}
                  onPopUpVisible={setPopupVisible}
                  handleClosePopup={handleClosePopup}
                  popupUrl={popupUrl}
                  onSetPopUpUrl={setPopupUrl}
                />
              </div>

              <section className="share-invitation">
                {!reconnecting ? (
                  <ShareInvitation
                    invitationUrl={`${STREAM_URL}/${id}/${streamVlr.publicId}`}
                  />
                ) : (
                  <IonText color="dark">
                    {t("sharedStream.reconnecting")}
                  </IonText>
                )}

                <IonButton
                  color="primary"
                  expand="full"
                  onClick={onLeave}
                  className={`${!showLeaveButton ? "ion-hide" : ""}`}
                >
                  {t("sharedStream.leave")}
                </IonButton>
              </section>
            </IonCardContent>
          </IonCard>
        ) : (
          <Loading show showLeave={showLeaveButton} onLeave={onLeave} />
        )}
      </div>
      {popupVisible && (
        <div
          className="fixed inset-0 flex items-end justify-center z-[1001] bg-black bg-opacity-50"
          onClick={handleClosePopup} // Close popup when clicking outside
        >
          <div
            className="absolute bottom-0 left-0 w-full bg-white border-t-4 border-blue-500 rounded-t-xl shadow-lg p-4 transition-all transform translate-y-0 duration-500 h-1/2 flex justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
          >
            {/* Close Button at Top Right */}
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 bg-gray-300 text-black rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-400"
            >
              ✕
            </button>

            {/* External Link Button */}
            <iframe src={popupUrl} className="h-full"></iframe>
          </div>
        </div>
      )}
    </>
    // </IonModal>
  );
};

export default StreamLoading;
