import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonCard, IonCardContent, IonModal, IonTitle, IonToolbar} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import Cropper from 'react-easy-crop';
import {Area, Point, Size} from 'react-easy-crop/types';
import getCroppedImg from './cropImage';
import DragNDrop from '../../pages/WatchParty/components/DragNDrop';
import {nanoid} from 'nanoid';

type Props = {
  logo?: string | null;
  show: boolean;
  setShow: (value: boolean) => void;
  onSelect: (image: File) => void;
};

const SIZE = 256;
const CROP_SIZE: Size = {width: SIZE, height: SIZE};
const INITIAL_CROP = {x: 0, y: 0};
const INITIAL_ZOOM = 1;

const ParseLogo: FC<Props> = ({logo, show, setShow, onSelect}: Props) => {
  const {t} = useTranslation();
  const [inputImg, setInputImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>(INITIAL_CROP);
  const [zoom, setZoom] = useState<number>(INITIAL_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [loadCropper, setLoadCropper] = useState(false);

  useEffect(() => {
    setInputImage(logo || null);
  }, [logo]);

  const resetCropperValues = (img: string | null = null) => {
    setInputImage(img);
    setCrop(INITIAL_CROP);
    setZoom(INITIAL_ZOOM);
  };

  const handleCropImage = () => {
    if (!inputImg || !croppedAreaPixels) {
      return;
    }

    const crop = async () => {
      const cpImage = await getCroppedImg(inputImg, croppedAreaPixels, CROP_SIZE);
      if (cpImage) {
        const file = new File([cpImage], `${nanoid()}.png`, {type: 'image/png', lastModified: Date.now()});
        onSelect(file);
      } else {
        console.error('No cropped image');
      }
    };

    crop().catch(err => console.error(err));
  };

  const handleImageDrop = (img: File) => {
    const imgToBlob = URL.createObjectURL(img);
    if (!inputImg) {
      setInputImage(imgToBlob);
    } else {
      resetCropperValues(imgToBlob);
    }
  };

  const onWillPresent = () => {
    setLoadCropper(true);
  };

  const onDidDismiss = () => {
    setLoadCropper(false);
    setShow(false);
  };

  return (
    <IonModal
      isOpen={show}
      className="parse-logo-modal"
      onWillPresent={onWillPresent}
      onDidDismiss={onDidDismiss}
    >
      <IonToolbar>
        <IonTitle className="ion-text-center">{t('parseLogo.header')}</IonTitle>
      </IonToolbar>

      <IonCard>
        <IonCardContent>
          {
            loadCropper && inputImg &&
            <div className="crop-image-container">
              <Cropper
                image={inputImg}
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
            </div>
          }

          <DragNDrop
            accept="image/*"
            cssClass={inputImg ? 'drop-logo' : ''}
            onDrop={([img]: File[]) => handleImageDrop(img)}
            text={t(`parseLogo.${inputImg ? 'dropNewImage' : 'drop'}`)}
          />
        </IonCardContent>
      </IonCard>

      <IonToolbar>
        <IonButtons slot="end">
          <IonButton onClick={handleCropImage} disabled={!inputImg}>
            {t('common.ok')}
          </IonButton>
          <IonButton onClick={() => setShow(false)}>
            {t('common.cancel')}
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonModal>
  );
};

export default ParseLogo;
