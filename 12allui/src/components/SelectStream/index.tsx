import React, {FC, useCallback, useState} from 'react';
import './styles.scss';
import {IonIcon, IonInput, IonItem, IonLabel} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {caretDown, filmOutline} from 'ionicons/icons';
import {SharedStream} from '../../shared/types';
import SelectStreamModal from '../SelectStreamModal';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';

type Props = {
  inputLabel?: string;
  inputPlaceholder?: string;
  onSelect: (stream: SharedStream) => void;
  onResetValidation: () => void;
};

const SelectStream: FC<Props> = ({
                                   inputLabel,
                                   inputPlaceholder,
                                   onSelect,
                                   onResetValidation
                                 }: Props) => {
  const {t} = useTranslation();

  const {streamId} = useSelector(({vlrTemplate}: ReduxSelectors) => vlrTemplate.selected);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [streamName, setStreamName] = useState<string>('');

  const handleOnSelect = useCallback((stream: SharedStream | null) => {
    if (stream) {
      setStreamName(stream.name);
      onSelect(stream);
    } else {
      setStreamName('');
    }
  }, [onSelect]);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleDismiss = (stream?: SharedStream) => {
    setOpenModal(false);
    if (stream) {
      setStreamName(stream.name);
      onSelect(stream);
    }
  };

  const handleOnDeleteStream = () => {
    setStreamName('');
    onResetValidation();
  };

  return (
    <>
      <IonItem button onClick={handleOpen} lines="none" className="stream-input-item">
        <IonIcon slot="start" icon={filmOutline} className="ion-align-self-center" color="dark"/>
        <IonLabel position="stacked" color="dark">
          {t(inputLabel ? inputLabel : 'selectStream.stream')}
        </IonLabel>
        <IonInput
          placeholder={t(inputPlaceholder ? inputPlaceholder : 'selectStream.selectStream')}
          value={streamName}
          readonly
        />
        <IonIcon icon={caretDown} slot="end" className="caret-icon"/>
      </IonItem>

      <SelectStreamModal
        open={openModal}
        streamId={streamId || undefined}
        onClose={handleDismiss}
        onSelect={handleOnSelect}
        showManageStreamButtons
        onDeleteSteam={handleOnDeleteStream}
      />
    </>
  );
};

export default SelectStream;
