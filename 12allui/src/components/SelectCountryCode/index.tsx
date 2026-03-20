import React, {FC, useRef, useState} from 'react';
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
  useIonViewWillEnter
} from '@ionic/react';
import {countries, Country} from 'countries-list';
import {useTranslation} from 'react-i18next';
import {caretDown} from 'ionicons/icons';
import InfiniteContent from '../InfiniteContent';

const INITIAL_SLICE_TO = 10;

type Props = {
  inputPlaceholder?: string;
  onSelect: (countryCode: string) => void;
};

const SelectCountryCode: FC<Props> = ({
                                        inputPlaceholder,
                                        onSelect
                                      }: Props) => {
  const {t} = useTranslation();

  const searchTextRef = useRef<HTMLIonSearchbarElement>(null);
  const searchTextValue = useRef<string>('');
  const countryListRef = useRef<Country[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');

  useIonViewWillEnter(() => {
    setSelectedCountryCode('');
    searchTextValue.current = '';
    const c = Object.values(countries);
    c.sort((a, b) => a.name.localeCompare(b.name));
    countryListRef.current = c;
    setCountryList(c);
    setFilteredCountries(c.slice(0, INITIAL_SLICE_TO));
  }, []);

  const handleWillPresent = () => {
    if (searchTextRef.current) {
      searchTextRef.current.value = searchTextValue.current;
    }
  };

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleDismiss = () => {
    setOpenModal(false);
  };

  const handleOk = (country: string) => {
    setSelectedCountryCode(country);
    onSelect(country);
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
        className="country-code-item"
        lines="none"
      >
        <IonInput
          placeholder={t(inputPlaceholder ? inputPlaceholder : 'selectCountryCode.selectCountryCode')}
          value={selectedCountryCode ? `+${selectedCountryCode}` : ''}
          readonly
        />
        <IonIcon icon={caretDown} slot="end" className="caret-icon"/>
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
            {filteredCountries.map(({name, phone}) => (
              <IonItem key={name} color="light" lines="none">
                <IonRadio value={phone} slot="start"/>
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
};

export default SelectCountryCode;
