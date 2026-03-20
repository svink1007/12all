import React, {FC, useEffect, useRef, useState} from 'react';
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
  IonSearchbar
} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {caretDown} from 'ionicons/icons';
import InfiniteContent from '../InfiniteContent';

const INITIAL_SLICE_TO = 10;

type Data = { name: string, value: string | number };


type Props = {
  data: Data[];
  inputLabel: string;
  inputPlaceholder: string;
  onSelect: (value: string | number | null) => void;
  onClose?: () => void;
};

const SelectSearchable: FC<Props> = ({
                                       data,
                                       inputLabel,
                                       inputPlaceholder,
                                       onSelect,
                                       onClose
                                     }: Props) => {
  const {t} = useTranslation();

  const searchTextRef = useRef<HTMLIonSearchbarElement>(null);
  const searchTextValue = useRef<string>('');

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [filtered, setFiltered] = useState<Data[]>([]);
  const [selected, setSelected] = useState<Data>();
  const [selectedOldValue, setSelectedOldValue] = useState<Data>();

  useEffect(() => {
    setFiltered(data.slice(0, INITIAL_SLICE_TO));
  }, [data]);

  const handleWillPresent = () => {
    if (searchTextRef.current) {
      searchTextRef.current.value = searchTextValue.current;
    }
  };

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleOk = () => {
    setOpenModal(false);
    setSelectedOldValue(selected);
    selected && onSelect(selected.value);
  };

  const handleDismiss = () => {
    setOpenModal(false);
    setSelected(selectedOldValue);
    onClose && onClose();
  };

  const handleSearchChange = (value: string) => {
    searchTextValue.current = value;
    const insensitive = value.toLowerCase();
    setFiltered(data.filter(l => l.name.toLowerCase().includes(insensitive)).slice(0, INITIAL_SLICE_TO));
  };

  const handleLoadMore = (target: any) => {
    setFiltered(prevState => data.slice(0, prevState.length + INITIAL_SLICE_TO));
    target.complete();
  };

  return (
    <>
      <IonItem button onClick={handleOpen} lines="none" className="country-item">
        <IonLabel position="stacked" color="dark">
          {t(inputLabel)}
        </IonLabel>
        <IonInput
          placeholder={inputPlaceholder}
          value={selected?.name}
          readonly
        />
        <IonIcon icon={caretDown} slot="end" className="caret-icon"/>
      </IonItem>

      <IonModal
        isOpen={openModal}
        className="searchable-country-modal"
        backdropDismiss={false}
        onWillPresent={handleWillPresent}
      >
        <IonSearchbar
          ref={searchTextRef}
          onIonChange={e => handleSearchChange(e.detail.value!)}
        />

        <InfiniteContent onLoadMore={handleLoadMore}>
          <IonRadioGroup
            value={selected}
            onIonChange={e => setSelected(e.detail.value)}
          >
            {filtered.map((d) => (
              <IonItem key={d.value} color="light" lines="none">
                <IonRadio value={d} slot="start"/>
                <IonLabel>{d.name}</IonLabel>
              </IonItem>
            ))}
          </IonRadioGroup>
        </InfiniteContent>

        <IonItem color="light" lines="none">
          <IonButtons slot="end">
            <IonButton color="primary" onClick={() => handleDismiss()}>
              {t('common.dismiss')}
            </IonButton>
            <IonButton color="primary" onClick={() => handleOk()}>
              {t('common.okay')}
            </IonButton>
          </IonButtons>
        </IonItem>
      </IonModal>
    </>
  );
};

export default SelectSearchable;
