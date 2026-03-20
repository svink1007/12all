import { FC, useState } from "react";
import { IonImg, IonText } from "@ionic/react";
import logo12all from "../../../images/12all-logo-128.svg";
import { SharedStreamVlrs, Vlr } from "../../../shared/types";
import dots from "../../../images/icons/dots.svg";
import star from "../../../images/create-room/star.svg";
import ControlChannel from "./ControlChannel";

type Props = {
  vlr: Vlr;
  snapShots?: any;
  onCollapseClick?: any;
  roomPrice: any;
};

const PopulateChannel: FC<Props> = ({
  vlr,
  onCollapseClick,
  roomPrice,
}: Props) => {
  const [previewLoaded, setPreviewLoaded] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);

  return (
    <>
      <div
        className={`default-channel-logo-wrapper ${
          previewLoaded ? "preview-loaded" : ""
        }`}
      >
        <div
          className="custom-collapse"
          onClick={(event) => onCollapseClick(vlr, event)}
        >
          <IonImg src={dots} />
        </div>
        {vlr.channel.https_preview_high && !previewError && (
          <IonImg
            src={vlr.channel.https_preview_high}
            className="preview-image-stream"
            alt="image"
            onIonImgDidLoad={() => setPreviewLoaded(true)}
            onIonError={() => {
              setPreviewLoaded(false);
              setPreviewError(true);
            }}
          />
        )}
        <IonImg src={vlr.channel.logo || logo12all} className="channel-logo" />
        <div className="flex items-center justify-between">
          {roomPrice > 0 && <IonImg src={star} className="w-4" />}

          <IonText>{vlr.channel.name}</IonText>
          {roomPrice > 0 && <IonImg src={star} className="w-4" />}
        </div>
      </div>
    </>
  );
};

export default PopulateChannel;
