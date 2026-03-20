import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import {
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { caretDown } from "ionicons/icons";
import SelectToolbar from "../SelectToolbar";
import GenreService from "../../services/GenreService";

type Props = {
  genre: string | null;
  open?: boolean;
  showInput?: boolean;
  inputLabel?: string;
  inputColor?: string;
  onSelect: (genre: string) => void;
  onClose?: () => void;
};

const SelectGenre: FC<Props> = ({
  genre,
  open,
  showInput,
  inputLabel,
  inputColor,
  onSelect,
  onClose,
}: Props) => {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    GenreService.getGenres().then(({ data }) => {
      setGenres(data.map((genre) => genre.name));
    });
  }, []);

  useEffect(() => {
    open && setOpenModal(true);
  }, [open]);

  const handleOpen = () => {
    setOpenModal(true);
    setSelectedGenre(genre);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setOpenModal(false);
    onSelect(genre);
  };

  const handleDismiss = () => {
    setOpenModal(false);
    onClose && onClose();
  };

  return (
    <>
      {showInput && (
        <IonItem
          button
          onClick={handleOpen}
          lines="none"
          className="genre-item"
          color={inputColor}
          detail={false}
        >
          <IonLabel position={genre ? "stacked" : "fixed"} color="dark">
            {t(inputLabel ? inputLabel : "selectGenre.genre")}
          </IonLabel>
          <IonInput value={genre} readonly />
          <IonIcon icon={caretDown} slot="end" className="caret-icon" />
        </IonItem>
      )}

      <IonModal isOpen={openModal} backdropDismiss={false}>
        <IonContent>
          <SelectToolbar
            titleText="selectGenre.selectGenre"
            onDismiss={handleDismiss}
          />

          <IonRadioGroup
            value={selectedGenre}
            onIonChange={(e) => handleGenreSelect(e.detail.value)}
          >
            <IonItem color="light" lines="none">
              <IonRadio value={""} slot="start" />
              <IonLabel>{t("common.none")}</IonLabel>
            </IonItem>
            {genres.map((genre) => (
              <IonItem key={genre} color="light">
                <IonRadio value={genre} slot="start" />
                <IonLabel>{genre}</IonLabel>
              </IonItem>
            ))}
          </IonRadioGroup>
        </IonContent>
      </IonModal>
    </>
  );
};

export default SelectGenre;
