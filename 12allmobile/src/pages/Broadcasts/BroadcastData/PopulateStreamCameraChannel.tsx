import React, { FC, useState } from "react";
import { IonIcon, IonImg, IonText } from "@ionic/react";
import { Channel } from "../../../shared/types";
import { videocam, videocamOutline } from "ionicons/icons";

type Props = {
  channel: Channel;
};

const PopulateStreamCameraChannel: FC<Props> = ({ channel }: Props) => {
  const [previewLoaded, setPreviewLoaded] = useState<boolean>(false);

  return (
    <div
      className={`default-channel-logo-wrapper ${previewLoaded ? "preview-loaded" : ""}`}
    >
      {channel.https_preview_high && (
        <IonImg
          src={channel.https_preview_high}
          className="preview-image-stream"
          onIonImgDidLoad={() => setPreviewLoaded(true)}
          onIonError={() => setPreviewLoaded(false)}
        />
      )}
      <IonIcon
        icon={previewLoaded ? videocam : videocamOutline}
        className="channel-stream-camera-icon"
      />
      <IonText>{channel.name}</IonText>
    </div>
  );
};

export default PopulateStreamCameraChannel;
