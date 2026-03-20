import { FC, useEffect, useRef, useState } from "react";
import "./styles.scss";
import {
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
  isPlatform,
} from "@ionic/react";
import { countries, ICountry } from "countries-list";
import { useTranslation } from "react-i18next";
import InfiniteContent from "../InfiniteContent";
import SelectToolbar from "../SelectToolbar";
import AppSearchbar from "../AppSearchbar";

const INITIAL_SLICE_TO = isPlatform("tablet") ? 50 : 20;

type Props = {
  country: string | null;
  open?: boolean;
  hideNone?: boolean;
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  onSelect: (country: string) => void;
  onClose?: () => void;
};

const SelectCountry: FC<Props> = ({
  country,
  onSelect,
  hideNone,
  showInput,
  inputLabel,
  inputPlaceholder,
  onClose,
  open,
}: Props) => {
  const { t } = useTranslation();

  const searchTextValue = useRef<string>("");

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [countryList, setCountryList] = useState<ICountry[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<ICountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    const c = Object.values(countries);
    c.sort((a, b) => a.name.localeCompare(b.name));
    setCountryList(c);
    setFilteredCountries(c.slice(0, INITIAL_SLICE_TO));
  }, []);

  useEffect(() => {
    open && setOpenModal(true);
  }, [open]);

  const handleOpen = () => {
    setOpenModal(true);
    setSelectedCountry(country);
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setOpenModal(false);
    onSelect(country);
    onClose && onClose();
  };

  const handleDismiss = () => {
    setOpenModal(false);
    onClose && onClose();
  };

  const filterCountries = (value: string) => {
    setFilteredCountries(
      countryList
        .filter((l) => l.name.toLowerCase().startsWith(value))
        .slice(0, INITIAL_SLICE_TO)
    );
  };

  const handleSearchChange = (value: string) => {
    searchTextValue.current = value.toLowerCase();
    filterCountries(searchTextValue.current);
  };

  const handleLoadMore = () => {
    if (searchTextValue.current) {
      filterCountries(searchTextValue.current);
    } else {
      setFilteredCountries((prevState) =>
        countryList.slice(0, prevState.length + INITIAL_SLICE_TO)
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
          className="country-item"
          detail={false}
        >
          <IonLabel position="stacked" color="dark">
            {t(inputLabel ? inputLabel : "selectCountry.country")}
          </IonLabel>
          <IonInput
            placeholder={t(
              inputPlaceholder ? inputPlaceholder : "selectCountry.placeholder"
            )}
            value={country}
            readonly
          />
          {/* <IonIcon icon={caretDown} slot="end" className="caret-icon"/> */}
        </IonItem>
      )}

      <IonModal isOpen={openModal} backdropDismiss={false}>
        <SelectToolbar
          titleText="selectCountry.title"
          onDismiss={handleDismiss}
        />

        <AppSearchbar
          value={searchTextValue.current}
          onSearchChange={handleSearchChange}
        />

        <InfiniteContent onLoadMore={handleLoadMore}>
          <IonRadioGroup
            value={selectedCountry}
            onIonChange={(e) => handleCountrySelect(e.detail.value)}
          >
            {!hideNone && (
              <IonItem color="light">
                <IonRadio value={""} slot="start" />
                <IonLabel>{t("common.none")}</IonLabel>
              </IonItem>
            )}
            {filteredCountries.map(({ name }) => (
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

export default SelectCountry;
