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
import {Language, languages} from 'countries-list';
import {useTranslation} from 'react-i18next';
import {caretDown} from 'ionicons/icons';
import {addOutline} from 'ionicons/icons';
import { IonRadioGroupCustomEvent, RadioGroupChangeEventDetail } from '@ionic/core';

type Props = {
  language?: string | null;
  open?: boolean;
  showInput?: boolean;
  inputLabel?: string;
  inputColor?: string;
  onSelect: (language: string | null) => void;
  onClose?: () => void;
  disabled?: boolean;
  isMediaProfile?: boolean
};

const SelectLanguage: FC<Props> = ({
                                     language,
                                     onSelect,
                                     showInput,
                                     inputLabel,
                                     inputColor,
                                     onClose,
                                     open,
                                     disabled,
                                     isMediaProfile
                                   }: Props) => {
  const {t} = useTranslation();

  const searchTextRef = useRef<HTMLIonSearchbarElement>(null);
  const searchTextValue = useRef<string>('');
  const allLanguages = useRef<Language[]>([]);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  useEffect(() => {
    const l = Object.values(languages);
    l.sort((a, b) => a.name.localeCompare(b.name));
    allLanguages.current = l;
    setFilteredLanguages(l);
  }, []);

  useEffect(() => {
    open && setOpenModal(true);
  }, [open]);

  useEffect(() => {
    setSelectedLanguage(language || '');
  }, [language]);

  const handleDidPresent = () => {
    if (language) {
      const streamRow = document.getElementById('language-' + language);
      if (streamRow) {
        // need setTimeout for smooth scroll
        setTimeout(() => streamRow.scrollIntoView({behavior: 'smooth'}));
      }
    }
  };

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleDismiss = () => {
    setOpenModal(false);
    onClose && onClose();
  };

  const handleOnSelect = (e: IonRadioGroupCustomEvent<RadioGroupChangeEventDetail>) => {
    e.preventDefault()
    setSelectedLanguage(e.detail.value);
    onSelect(e.detail.value);
    handleDismiss();
  };

  const handleSearchChange = (value: string) => {
    searchTextValue.current = value;
    const insensitive = value.toLowerCase();
    setFilteredLanguages(allLanguages.current.filter(l => l.name.toLowerCase().startsWith(insensitive)));
  };

  return (
    <>
      {
        showInput &&
        <IonItem
          button
          onClick={handleOpen}
          lines="none"
          className="language-item"
          color={inputColor}
          detail={false}
          style={{borderBottomColor:'#E0007A'}}
        >
          <IonLabel position={selectedLanguage ? 'stacked' : 'fixed'} color="dark">
            {t(inputLabel ? inputLabel : 'selectLanguage.language')}
          </IonLabel>
          <IonInput
            value={selectedLanguage}
            readonly
            style={{flex: selectedLanguage ? 1 : 0}}
            disabled={disabled}
          />
          <IonIcon icon={isMediaProfile ? addOutline : caretDown} slot="end" className="caret-icon"/>
        </IonItem>
      }

      <IonModal
        isOpen={openModal}
        className="searchable-language-modal"
        onWillDismiss={handleDismiss}
        onDidPresent={handleDidPresent}
        keepContentsMounted
      >
        <IonSearchbar
          ref={searchTextRef}
          value={searchTextRef.current?.value}
          onIonChange={e => handleSearchChange(e.detail.value!)}
        />

        <IonContent>
          <IonRadioGroup
            value={selectedLanguage}
            onIonChange={e => handleOnSelect(e)}
            className="languages-wrapper"
          >
            <IonItem color="light" lines="none">
              <IonRadio value={''} slot="start"/>
              <IonLabel>{t('common.none')}</IonLabel>
            </IonItem>
            {filteredLanguages.map(({name}) => (
              <IonItem key={name} color="light" lines="none" id={`language-${name}`}>
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
  );
};

export default SelectLanguage;
