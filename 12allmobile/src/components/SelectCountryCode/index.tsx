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
  IonText,
  isPlatform,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { caretDown } from "ionicons/icons";
import InfiniteContent from "../InfiniteContent";
import SelectToolbar from "../SelectToolbar";
import AppSearchbar from "../AppSearchbar";
import addSmartlookShow from "../../shared/methods/addSmartlookShow";
import CountryService from "../../services/CountryService";
import { CountryResponse } from "../../shared/types";
import { UserManagementService } from "../../services";

const INITIAL_SLICE_TO = isPlatform("tablet") ? 50 : 20;

export type SelectedCountryOnSelect = {
  code: number;
  name?: string;
  autoOpenPhoneNumber?: boolean;
};

type Props = {
  onSelect: (data: SelectedCountryOnSelect) => void;
  onClose?: () => void;
};

const SelectCountryCode: FC<Props> = ({ onSelect, onClose }: Props) => {
  const { t } = useTranslation();

  const searchTextValue = useRef<string>("");
  const countryInputRef = useRef<HTMLIonInputElement>(null);
  const autoOpenPhoneNumber = useRef<boolean>(false);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [countryList, setCountryList] = useState<CountryResponse[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryResponse[]>(
    []
  );
  const [selectedCountryCode, setSelectedCountryCode] = useState<number>();
  const [selectedCountryName, setSelectedCountryName] = useState<string>();
  const [countryIso, setCountryIso] = useState<string | null>(null);

  useEffect(() => {
    CountryService.getCountries().then(({ data }) => {
      setCountryList(data);
      setFilteredCountries(data.slice(0, INITIAL_SLICE_TO));
    });

    UserManagementService.getUserCountry().then(({ data: { iso } }) =>
      setCountryIso(iso)
    );
    countryInputRef.current?.getInputElement().then(addSmartlookShow);
  }, []);

  useEffect(() => {
    if (countryList.length && countryIso) {
      const country = countryList.find(
        ({ iso_code }) => iso_code === countryIso
      );
      country && setSelectedCountryName(country.name);
    }
  }, [countryList, countryIso]);

  useEffect(() => {
    if (selectedCountryName) {
      const country = countryList.find((c) => c.name === selectedCountryName);
      if (country) {
        setSelectedCountryCode(country.dial_code);
        onSelect({
          code: country.dial_code,
          name: selectedCountryName,
          autoOpenPhoneNumber: autoOpenPhoneNumber.current,
        });
      }
      setOpenModal(false);
    }
  }, [countryList, selectedCountryName, onSelect]);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleDismiss = () => {
    setOpenModal(false);
    onClose && onClose();
  };

  const handleSearchChange = (value: string) => {
    searchTextValue.current = value;
    const insensitive = value.toLowerCase();
    setFilteredCountries(
      countryList
        .filter(
          (l) =>
            l.name.toLowerCase().startsWith(insensitive) ||
            l.dial_code.toString().startsWith(insensitive) ||
            `+${l.dial_code}`.startsWith(insensitive)
        )
        .slice(0, INITIAL_SLICE_TO)
    );
  };

  const handleLoadMore = () => {
    setFilteredCountries((prevState) =>
      countryList.slice(0, prevState.length + INITIAL_SLICE_TO)
    );
  };

  return (
    <>
      <IonItem
        button
        onClick={handleOpen}
        className="country-code-item"
        lines="none"
        detail={false}
      >
        {/* <IonLabel position="stacked" class='label'>
          {t('signup.countryCode')}
        </IonLabel> */}
        <IonText className="label">{t("signup.countryCode")}</IonText>
        <IonInput
          ref={countryInputRef}
          placeholder={t("common.select")}
          value={selectedCountryCode ? `+${selectedCountryCode}` : ""}
          readonly
          className="country-input"
        />
        <IonIcon icon={caretDown} className="caret-icon" />
      </IonItem>

      <IonModal
        isOpen={openModal}
        className="searchable-country-modal"
        backdropDismiss={false}
      >
        <SelectToolbar
          titleText="selectCountryCode.selectCountryCode"
          onDismiss={handleDismiss}
        />

        <AppSearchbar
          value={searchTextValue.current}
          onSearchChange={handleSearchChange}
        />

        <InfiniteContent onLoadMore={handleLoadMore}>
          <IonRadioGroup
            value={selectedCountryName}
            onIonChange={(e) => {
              setSelectedCountryName(e.detail.value);
              autoOpenPhoneNumber.current = true;
            }}
          >
            {filteredCountries.map(({ name, dial_code }) => (
              <IonItem key={name} color="light">
                <IonRadio value={name} slot="start" />
                <IonLabel>
                  {name} (+{dial_code})
                </IonLabel>
              </IonItem>
            ))}
          </IonRadioGroup>
        </InfiniteContent>
      </IonModal>
    </>
  );
};

export default SelectCountryCode;
