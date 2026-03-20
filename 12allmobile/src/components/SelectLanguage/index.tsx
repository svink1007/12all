import React, { FC, useEffect, useRef, useState } from "react";
import "./styles.scss";
import {
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
  isPlatform,
} from "@ionic/react";
import { ILanguage, languages } from "countries-list";
import { useTranslation } from "react-i18next";
import { caretDown } from "ionicons/icons";
import InfiniteContent from "../InfiniteContent";
import SelectToolbar from "../SelectToolbar";
import AppSearchbar from "../AppSearchbar";

const INITIAL_SLICE_TO = isPlatform("tablet") ? 50 : 20;

type Props = {
  language: string | null;
  open?: boolean;
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputColor?: string;
  onSelect: (language: string) => void;
  onClose?: () => void;
};

const SelectLanguage: FC<Props> = ({
  language,
  onSelect,
  showInput,
  inputLabel,
  inputPlaceholder,
  inputColor,
  onClose,
  open,
}: Props) => {
  const { t } = useTranslation();

  const searchTextValue = useRef<string>("");

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [languageList, setLanguageList] = useState<ILanguage[]>([]);
  const [filteredLanguages, setFilteredLanguages] = useState<ILanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    const l = Object.values(languages);
    l.sort((a, b) => a.name.localeCompare(b.name));
    setLanguageList(l);
    setFilteredLanguages(l.slice(0, INITIAL_SLICE_TO));
  }, []);

  useEffect(() => {
    open && setOpenModal(true);
  }, [open]);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setOpenModal(false);
    onSelect(language);
  };

  const handleDismiss = () => {
    setOpenModal(false);
    onClose && onClose();
  };

  const filterLanguages = (value: string) => {
    setFilteredLanguages(
      languageList
        .filter((l) => l.name.toLowerCase().startsWith(value))
        .slice(0, INITIAL_SLICE_TO)
    );
  };

  const handleSearchChange = (value: string) => {
    searchTextValue.current = value.toLowerCase();
    filterLanguages(searchTextValue.current);
  };

  const handleLoadMore = () => {
    if (searchTextValue.current) {
      filterLanguages(searchTextValue.current);
    } else {
      setFilteredLanguages((prevState) =>
        languageList.slice(0, prevState.length + INITIAL_SLICE_TO)
      );
    }
  };

  return (
    <>
      {showInput && (
        <IonItem
          button
          onClick={handleOpen}
          lines="none"
          className="language-item"
          color={inputColor}
          detail={false}
        >
          <IonLabel position="stacked" color="dark">
            {t(inputLabel ? inputLabel : "selectLanguage.language")}
          </IonLabel>
          <IonInput
            placeholder={t(
              inputPlaceholder ? inputPlaceholder : "selectLanguage.placeholder"
            )}
            value={selectedLanguage}
            readonly
          />
          {/* <IonIcon icon={caretDown} slot="end" className="caret-icon"/> */}
        </IonItem>
      )}

      <IonModal isOpen={openModal} backdropDismiss={false}>
        <SelectToolbar
          titleText="selectLanguage.title"
          onDismiss={handleDismiss}
        />

        <AppSearchbar
          value={searchTextValue.current}
          onSearchChange={handleSearchChange}
        />

        <InfiniteContent onLoadMore={handleLoadMore}>
          <IonRadioGroup
            value={selectedLanguage}
            onIonChange={(e) => handleLanguageSelect(e.detail.value)}
            className="languages-wrapper"
          >
            <IonItem color="light">
              <IonRadio value={""} slot="start" />
              <IonLabel>{t("common.none")}</IonLabel>
            </IonItem>
            {filteredLanguages.map(({ name }) => (
              <IonItem key={name} color="light">
                <IonRadio value={name} slot="start" />
                <IonLabel>{name}</IonLabel>
              </IonItem>
            ))}
          </IonRadioGroup>
        </InfiniteContent>
      </IonModal>
    </>
  );
};

export default SelectLanguage;
