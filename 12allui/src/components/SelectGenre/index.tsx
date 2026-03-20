import React, {FC, useEffect, useState} from 'react';
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
} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {caretDown} from 'ionicons/icons';
import {GenreService} from '../../services';
import {Genre} from '../../shared/types';
import { IonRadioGroupCustomEvent, RadioGroupChangeEventDetail } from '@ionic/core';

type Props = {
  genre?: string | null;
  open?: boolean;
  showInput?: boolean;
  inputLabel?: string;
  inputColor?: string;
  onSelect: (genre: string | null) => void;
  onClose?: () => void;
};

const SelectGenre: FC<Props> = ({
                                  genre,
                                  open,
                                  showInput,
                                  inputLabel,
                                  inputColor,
                                  onSelect,
                                  onClose
                                }: Props) => {
  const {t} = useTranslation();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    GenreService.getGenres().then(({data}) => setGenres(data));
  }, []);

  useEffect(() => {
    open && setOpenModal(true);
  }, [open]);

  useEffect(() => {
    setSelectedGenre(genre || '');
  }, [genre]);

  const handleDidPresent = () => {
    if (genre) {
      const streamRow = document.getElementById('genre-' + genre);
      if (streamRow) {
        // need setTimeout for smooth scroll
        setTimeout(() => streamRow.scrollIntoView({behavior: 'smooth'}));
      }
    }
  };

  const handleOpen = () => {
    setOpenModal(true);
    setSelectedGenre(genre || '');
  };


  const handleDismiss = () => {
    setOpenModal(false);
    onClose && onClose();
  };

  const handleOnSelect = (e: IonRadioGroupCustomEvent<RadioGroupChangeEventDetail>) => {
    e.preventDefault()
    setSelectedGenre(e.detail.value);
    onSelect(e.detail.value);
    handleDismiss();
  };

  return (
    <>
      {
        showInput &&
        <IonItem
          button
          onClick={handleOpen}
          lines="none"
          className="genre-item"
          color={inputColor}
          detail={false}
          style={{borderBottomColor:'#E0007A'}}
        >
          <IonLabel position={genre ? 'stacked' : 'fixed'} color="dark">
            {t(inputLabel ? inputLabel : 'selectGenre.genre')}
          </IonLabel>
          <IonInput
            value={genre}
            readonly
            style={{flex: genre ? 1 : 0}}
          />
          <IonIcon icon={caretDown} slot="end" className="caret-icon"/>
        </IonItem>
      }

      <IonModal
        isOpen={openModal}
        className="select-genre-modal"
        onWillDismiss={handleDismiss}
        onDidPresent={handleDidPresent}
      >
        <IonContent>
          <IonRadioGroup
            value={selectedGenre}
            onIonChange={e => handleOnSelect(e)}
          >
            <IonItem color="light" lines="none">
              <IonRadio value={''} slot="start"/>
              <IonLabel>{t('common.none')}</IonLabel>
            </IonItem>
            {
              genres.map(({id, name}) => (
                <IonItem key={id} color="light" lines="none" id={`genre-${name}`}>
                  <IonRadio value={name} slot="start"/>
                  <IonLabel>{name}</IonLabel>
                </IonItem>
              ))
            }
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

export default SelectGenre;
