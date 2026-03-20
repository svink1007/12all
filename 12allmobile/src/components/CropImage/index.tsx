import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import { IonModal } from "@ionic/react";
import Cropper from "react-easy-crop";
import { Area, Point, Size } from "react-easy-crop/types";
import SelectToolbar from "../SelectToolbar";
import getCroppedImg from "../cropImageParser";
import { nanoid } from "nanoid";

type Props = {
  image: string;
  onSelect: (image: File) => void;
  onDismiss: () => void;
};

const SIZE = 256;
const CROP_SIZE: Size = { width: SIZE, height: SIZE };
const INITIAL_CROP = { x: 0, y: 0 };
const INITIAL_ZOOM = 1;

const CropImage: FC<Props> = ({ image, onSelect, onDismiss }: Props) => {
  const [crop, setCrop] = useState<Point>(INITIAL_CROP);
  const [zoom, setZoom] = useState<number>(INITIAL_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [loadCropper, setLoadCropper] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setLoadCropper(true), 200);
  }, []);

  const handleCropImage = () => {
    if (!croppedAreaPixels) {
      return;
    }

    const crop = async () => {
      const cpImage = await getCroppedImg(image, croppedAreaPixels, CROP_SIZE);
      if (cpImage) {
        const file = new File([cpImage], `${nanoid()}.png`, {
          type: "image/png",
          lastModified: Date.now(),
        });
        onSelect(file);
        onDismiss();
      } else {
        console.error("No cropped image");
      }
    };

    crop().catch((err) => console.error(`Crop image error ${err.message}`));
  };

  return (
    <IonModal isOpen className="crop-image-modal" backdropDismiss={false}>
      <SelectToolbar
        titleText="cropImage.cropImage"
        onOk={handleCropImage}
        onDismiss={onDismiss}
      />

      {loadCropper && (
        <Cropper
          image={image}
          zoomSpeed={0.1}
          crop={crop}
          cropSize={CROP_SIZE}
          zoom={zoom}
          aspect={1}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
          }}
        />
      )}
    </IonModal>
  );
};

export default CropImage;
