import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonSearchbar
} from '@ionic/react';
import {countries, Country} from 'countries-list';
import {useTranslation} from 'react-i18next';
import {caretDown} from 'ionicons/icons';
import { IonRadioGroupCustomEvent, RadioGroupChangeEventDetail } from '@ionic/core';

type Props = {
  country?: string | null;
  open?: boolean;
  showInput?: boolean;
  inputLabel?: string;
  onSelect: (country: string | null) => void;
  onClose?: () => void;
};

const SelectCountry: FC<Props> = ({
                                    country,
                                    onSelect,
                                    showInput,
                                    inputLabel,
                                    onClose,
                                    open
                                  }: Props) => {
  const {t} = useTranslation();

  const searchTextValue = useRef<string>('');
  const allCountries = useRef<Country[]>([]);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  useEffect(() => {
    const c = Object.values(countries);
    c.sort((a, b) => a.name.localeCompare(b.name));
    allCountries.current = c;
    setFilteredCountries(c);
  }, []);

  useEffect(() => {
    open && setOpenModal(true);
  }, [open]);

  useEffect(() => {
    setSelectedCountry(country || '');
  }, [country]);

  const handleDidPresent = () => {
    if (country) {
      const streamRow = document.getElementById('country-' + country);
      if (streamRow) {
        // need setTimeout for smooth scroll
        setTimeout(() => streamRow.scrollIntoView({behavior: 'smooth'}));
      }
    }
  };

  const handleOpen = () => {
    setOpenModal(true);
    setSelectedCountry(country || '');
  };

  const handleDismiss = () => {
    setOpenModal(false);
    onClose && onClose();
  };

  const handleOnSelect = (e: IonRadioGroupCustomEvent<RadioGroupChangeEventDetail>) => {
    setSelectedCountry(e.detail.value);
    onSelect(e.detail.value);
    handleDismiss();
  };

  const handleSearchChange = (value: string) => {
    searchTextValue.current = value;
    const insensitive = value.toLowerCase();
    setFilteredCountries(allCountries.current.filter(l => l.name.toLowerCase().startsWith(insensitive)));
  };

  return (
    <>
      {
        showInput &&
        <IonItem button onClick={handleOpen} lines="none" className="country-item" style={{borderBottom:'1px solid #E0007A'}}>
          <IonLabel position={country ? 'stacked' : 'fixed'} color="dark">
            {t(inputLabel ? inputLabel : 'selectCountry.country')}
          </IonLabel>
          <IonInput
            value={country}
            readonly
            style={{flex: country ? 1 : 0}}
          />
          <IonIcon icon={caretDown} slot="end" className="caret-icon"/>
        </IonItem>
      }

      <IonModal
        isOpen={openModal}
        className="searchable-country-modal"
        onWillDismiss={handleDismiss}
        onDidPresent={handleDidPresent}
        keepContentsMounted
      >
        <IonSearchbar onIonChange={e => handleSearchChange(e.detail.value!)}/>

        <IonContent>
          <IonRadioGroup
            value={selectedCountry}
            onIonChange={e => handleOnSelect(e)}
          >
            <IonItem color="light" lines="none">
              <IonRadio value={''} slot="start"/>
              <IonLabel>{t('common.none')}</IonLabel>
            </IonItem>
            {filteredCountries.map(({name}) => (
              <IonItem key={name} color="light" lines="none" id={`country-${name}`}>
                <IonRadio value={name} slot="start"/>
                <IonLabel>{name}</IonLabel>
              </IonItem>
            ))}
          </IonRadioGroup>
        </IonContent>

        <IonItem color="light" lines="none">
          <IonButtons slot="end">
            <IonButton color="primary" onClick={() => handleDismiss()}>
              {t('common.dismiss')}
            </IonButton>
          </IonButtons>
        </IonItem>
      </IonModal>
    </>
  )
};

export default SelectCountry;
