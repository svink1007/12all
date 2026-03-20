import React, { FC, useEffect, useRef, useState } from "react";
import "./StreamDebugInfo.scss";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/types";
import { HTMLVideoStreamElement } from "../../shared/types";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonList,
  IonListHeader,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { closeCircleOutline } from "ionicons/icons";

export const OPEN_STREAM_DEBUG = "open-stream-debug";

type Props = {
  inPipMode: boolean;
};

const StreamDebugInfo: FC<Props> = ({ inPipMode }: Props) => {
  const { hlsErrors, videoElement, sentStream, receivedStream, vertoSession } =
    useSelector(({ streamDebug }: ReduxSelectors) => streamDebug);
  const sourceRef = useRef<HTMLDivElement>(null);
  const sentStreamVideoRef = useRef<HTMLVideoStreamElement>(null);
  const receivedStreamVideoRef = useRef<HTMLVideoStreamElement>(null);
  const modal = useRef<HTMLIonModalElement>(null);
  const statsInterval = useRef<NodeJS.Timeout>();

  const [sourceInfo, setSourceInfo] = useState<string>("");
  const [sentStreamInfo, setSentStreamInfo] = useState<string>("");
  const [receivedStreamInfo, setReceivedStreamInfo] = useState<string>("");
  const [rtcStats, setRTCStats] = useState<string>("");
  const [rtcCodec, setRTCCodec] = useState<string>("");

  const handleDidPresent = () => {
    const getStats = () => {
      if (videoElement) {
        const sourceData = {
          video: {
            height: videoElement.videoHeight,
            width: videoElement.videoWidth,
          },
        };
        setSourceInfo(JSON.stringify(sourceData, null, 2));
      } else {
        setSourceInfo("");
      }

      if (sentStream) {
        const sentData = {
          video: sentStream.getVideoTracks().length
            ? sentStream.getVideoTracks()[0].getSettings()
            : "No video track",
          audio: sentStream.getAudioTracks().length
            ? sentStream.getAudioTracks()[0].getSettings()
            : "No audio track",
        };

        setSentStreamInfo(JSON.stringify(sentData, null, 2));
      } else {
        setSentStreamInfo("");
      }

      if (receivedStream) {
        const receivedData = {
          video: receivedStream.getVideoTracks().length
            ? receivedStream.getVideoTracks()[0].getSettings()
            : "No video track",
          audio: receivedStream.getAudioTracks().length
            ? receivedStream.getAudioTracks()[0].getSettings()
            : "No audio track",
        };

        setReceivedStreamInfo(JSON.stringify(receivedData, null, 2));
      } else {
        setReceivedStreamInfo("");
      }

      if (vertoSession) {
        vertoSession.getRTCVideoTrackStats()?.then((stats) => {
          stats.forEach((report) => {
            switch (report.type) {
              case "outbound-rtp":
                setRTCStats(JSON.stringify(report, null, 2));
                break;
              case "codec":
                setRTCCodec(JSON.stringify(report, null, 2));
                break;
            }
          });
        });
      }
    };
    getStats();

    statsInterval.current = setInterval(getStats, 2500);

    if (videoElement && sourceRef.current) {
      sourceRef.current.append(videoElement);
    }

    if (sentStreamVideoRef.current) {
      sentStreamVideoRef.current.srcObject = sentStream;
    }

    if (receivedStreamVideoRef.current) {
      receivedStreamVideoRef.current.srcObject = receivedStream;
    }
  };

  useEffect(() => {
    if (inPipMode) {
      modal.current?.dismiss();
    }
  }, [inPipMode]);

  return (
    <IonModal
      ref={modal}
      trigger={OPEN_STREAM_DEBUG}
      className="stream-debug"
      onDidPresent={handleDidPresent}
      onWillDismiss={() =>
        statsInterval.current && clearInterval(statsInterval.current)
      }
    >
      <IonToolbar>
        <IonTitle>Stream info</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={() => modal.current?.dismiss()} color="dark">
            <IonIcon icon={closeCircleOutline} slot="icon-only" />
          </IonButton>
        </IonButtons>
      </IonToolbar>

      <IonContent>
        <IonCard className={`${!videoElement ? "ion-hide" : ""}`}>
          <IonCardHeader>
            <IonCardTitle>Source</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div ref={sourceRef} />
            <pre>{sourceInfo}</pre>
            {hlsErrors.length > 0 && (
              <IonList className="hls-errors-list">
                <IonListHeader>Errors ({hlsErrors.length})</IonListHeader>
                {hlsErrors.map(({ date, message }, index) => (
                  <IonText key={index} color="danger">
                    [{date}] {message}
                  </IonText>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>

        <IonCard className={`${!sentStream ? "ion-hide" : ""}`}>
          <IonCardHeader>
            <IonCardTitle>Sent stream</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <video ref={sentStreamVideoRef} autoPlay muted />
            <pre>{sentStreamInfo}</pre>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Received stream</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <video ref={receivedStreamVideoRef} autoPlay muted />
            <pre>{receivedStreamInfo}</pre>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>RTC statistics</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <pre>{rtcStats}</pre>
            <pre>{rtcCodec}</pre>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonModal>
  );
};

export default StreamDebugInfo;
