import React, { FC, MouseEvent, useEffect, useRef, useState } from "react";
import "./styles.scss";
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { apertureOutline, closeCircleOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import CropImage from "../CropImage";

type Props = {
  logo?: string | null;
  logoText?: string;
  selectLogoText?: string;
  removeLogoText?: string;
  onLogoSelected: (logo: File | null) => void;
};

const SelectLogo: FC<Props> = ({
  logo,
  logoText,
  selectLogoText,
  removeLogoText,
  onLogoSelected,
}: Props) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedLogo, setCroppedLogo] = useState<string | null>(null);

  useEffect(() => {
    setCroppedLogo(logo || null);
  }, [logo]);

  const handleLogoSelected = (logo: File) => {
    setCroppedLogo(URL.createObjectURL(logo));
    onLogoSelected(logo);
  };

  const handleRemoveLogo = (e: MouseEvent) => {
    e.stopPropagation();
    setCroppedLogo(null);
    onLogoSelected(null);
  };

  return (
    <>
      <IonItem
        button
        onClick={() => inputRef.current?.click()}
        className="select-logo-component"
        detail={false}
      >
        {!croppedLogo ? (
          <>
            <IonIcon
              icon={apertureOutline}
              color="dark"
              className="default-icon-avatar"
            />
            <IonLabel>
              {t(selectLogoText ? selectLogoText : "selectLogo.selectLogo")}
            </IonLabel>
          </>
        ) : (
          <>
            <IonAvatar>
              <img src={croppedLogo} alt="" />
            </IonAvatar>
            <IonLabel>{t(logoText ? logoText : "selectLogo.logo")}</IonLabel>
            <IonButtons slot="end">
              <IonButton
                onClick={handleRemoveLogo}
                title={t(
                  removeLogoText ? removeLogoText : "selectLogo.removeLogo"
                )}
              >
                <IonIcon slot="icon-only" icon={closeCircleOutline} />
              </IonButton>
            </IonButtons>
          </>
        )}
      </IonItem>

      {selectedImage && (
        <CropImage
          image={selectedImage}
          onSelect={handleLogoSelected}
          onDismiss={() => setSelectedImage(null)}
        />
      )}

      <input
        hidden
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={({ target }) => {
          if (target.files?.length) {
            setSelectedImage(URL.createObjectURL(target.files[0]));
            target.value = "";
          }
        }}
      />
    </>
  );
};

export default SelectLogo;
