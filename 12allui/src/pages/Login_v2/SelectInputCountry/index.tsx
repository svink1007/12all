import React, {FC, forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  // useIonViewWillEnter
} from '@ionic/react';
import { countries, Country } from 'countries-list';
import { useTranslation } from 'react-i18next';
import { caretDown } from 'ionicons/icons';
import InfiniteContent from '../../../components/InfiniteContent';
import { UserManagementService } from '../../../services';
import axios from "axios";

const INITIAL_SLICE_TO = 10;

type Props = {
  inputPlaceholder?: string;
  onSelect: (selection: { countryCode: string; countryName: string }) => void;
  disabled: boolean;
  className?: string;
};

export interface SelectCountryCodeRef {
  focus: () => void;
}

const SelectCountryCode = forwardRef<SelectCountryCodeRef, Props>(
    ({ inputPlaceholder, onSelect, disabled, className }, ref) => {

  const { t } = useTranslation();

  const searchTextRef = useRef<HTMLIonSearchbarElement>(null);
  const searchTextValue = useRef<string>('');
  const countryListRef = useRef<Country[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');

  const inputRef = useRef<HTMLIonInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.setFocus();
    }
  }));

  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const response = await axios.get("https://freeipapi.com/api/json/");
        const selectedCountry = countryListRef.current.find(c => c.name === response.data.countryName);
        if (selectedCountry) {
          setSelectedCountryCode(selectedCountry.phone);
          onSelect({ countryCode: selectedCountry.phone, countryName: selectedCountry.name });
        }
      } catch (error) {
        console.error("Error fetching country code:", error);
      }
    };
    searchTextValue.current = '';
    const c = Object.values(countries);
    c.sort((a, b) => a.name.localeCompare(b.name));
    countryListRef.current = c;
    setCountryList(c);
    setFilteredCountries(c.slice(0, INITIAL_SLICE_TO));

    fetchCountryCode();
  }, []);

  const handleWillPresent = () => {
    if (searchTextRef.current) {
      searchTextRef.current.value = searchTextValue.current;
    }
  };

  const handleOpen = () => {
    setOpenModal(true);
    setTimeout(() => {
      inputRef.current?.setFocus();
    }, 100);
  };

  const handleDismiss = () => {
    setOpenModal(false);
  };

  const handleOk = (countryCode: string) => {
    const selectedCountry = countryListRef.current.find(c => c.phone === countryCode);
    if (selectedCountry) {
      setSelectedCountryCode(countryCode);
      onSelect({ countryCode, countryName: selectedCountry.name });
      handleDismiss();
    }
    // setSelectedCountryCode(country);
    // onSelect(country);
    handleDismiss();
  };

  const handleSearchChange = (value?: string) => {
    let all = countryListRef.current;

    if (value) {
      searchTextValue.current = value;
      const insensitive = value.toLowerCase();
      all = countryListRef.current.filter(l =>
        l.name.toLowerCase().startsWith(insensitive)
        || l.phone.startsWith(insensitive)
        || `+${l.phone}`.startsWith(insensitive)
      );
    }

    setCountryList(all);
    setFilteredCountries(all.slice(0, INITIAL_SLICE_TO));
  };

  const handleLoadMore = (target: any) => {
    setFilteredCountries(prevState => countryList.slice(0, prevState.length + INITIAL_SLICE_TO));
    target.complete();
  };

  return (
    <>
      <IonItem
        button
        onClick={handleOpen}
        className={`country-code-item ${className}`}
        lines="none"
        disabled={disabled}
      >
        <IonInput
          ref={inputRef}
          placeholder={t(inputPlaceholder ? inputPlaceholder : 'selectCountryCode.selectCountryCode')}
          value={selectedCountryCode ? `+${selectedCountryCode}` : ''}
          readonly
        />
        <IonIcon icon={caretDown} slot="end" className="caret-icon" />
      </IonItem>

      <IonModal
        isOpen={openModal}
        className="searchable-country-modal"
        onWillPresent={handleWillPresent}
        onWillDismiss={handleDismiss}
      >
        <IonSearchbar
          ref={searchTextRef}
          onIonChange={e => handleSearchChange(e.detail.value)}
        />

        <InfiniteContent onLoadMore={handleLoadMore}>
          <IonRadioGroup
            value={selectedCountryCode}
            onIonChange={e => handleOk(e.detail.value)}
          >
            {filteredCountries.map(({ name, phone }) => (
              <IonItem key={name} color="light" lines="none">
                <IonRadio value={phone} slot="start" />
                <IonLabel>{name} (+{phone})</IonLabel>
              </IonItem>
            ))}

          </IonRadioGroup>
        </InfiniteContent>

        <IonItem color="light" lines="none">
          <IonButtons slot="end">
            <IonButton color="primary" onClick={handleDismiss}>
              {t('common.dismiss')}
            </IonButton>
          </IonButtons>
        </IonItem>
      </IonModal>
    </>
  );
});

export default SelectCountryCode;
