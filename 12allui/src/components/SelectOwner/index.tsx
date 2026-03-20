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
import {Genre} from '../../shared/types';
import { IonRadioGroupCustomEvent, RadioGroupChangeEventDetail } from '@ionic/core';
import {PartnerService} from "../../services/PartnerService";

type Props = {
  owner?: string | null;
  open?: boolean;
  showInput?: boolean;
  inputLabel?: string;
  inputColor?: string;
  onSelect: (owner: string | null) => void;
  onClose?: () => void;
};

const SelectOwner: FC<Props> = ({
                                  owner,
                                  open,
                                  showInput,
                                  inputLabel,
                                  inputColor,
                                  onSelect,
                                  onClose
                                }: Props) => {
  const {t} = useTranslation();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [owners, setOwners] = useState<Genre[]>([]);

  useEffect(() => {
    PartnerService.getPartners().then(({data}) => setOwners(data));
  }, []);

  useEffect(() => {
    open && setOpenModal(true);
  }, [open]);

  useEffect(() => {
    setSelectedOwner(owner || '');
  }, [owner]);

  const handleDidPresent = () => {
    if (owner) {
      const streamRow = document.getElementById('owner-' + owner);
      if (streamRow) {
        setTimeout(() => streamRow.scrollIntoView({behavior: 'smooth'}));
      }
    }
  };

  const handleOpen = () => {
    setOpenModal(true);
    setSelectedOwner(owner || '');
  };


  const handleDismiss = () => {
    setOpenModal(false);
    onClose && onClose();
  };

  const handleOnSelect = (e: IonRadioGroupCustomEvent<RadioGroupChangeEventDetail>) => {
    e.preventDefault()
    setSelectedOwner(e.detail.value);
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
          <IonLabel position={owner ? 'stacked' : 'fixed'} color="dark">
            {t(inputLabel ? inputLabel : 'selectGenre.genre')}
          </IonLabel>
          <IonInput
            value={owner}
            readonly
            style={{flex: owner ? 1 : 0}}
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
            value={selectedOwner}
            onIonChange={e => handleOnSelect(e)}
          >
            <IonItem color="light" lines="none">
              <IonRadio value={''} slot="start"/>
              <IonLabel>{t('common.none')}</IonLabel>
            </IonItem>
            {
              owners.map(({id, name}) => (
                <IonItem key={id} color="light" lines="none" id={`owner-${name}`}>
                  <IonRadio value={id + "-" + name} slot="start"/>
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

export default SelectOwner;
