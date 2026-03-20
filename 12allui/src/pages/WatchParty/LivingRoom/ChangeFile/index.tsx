import React, {FC, useCallback, useState} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonCard, IonCardContent, IonModal, IonTitle, IonToolbar} from '@ionic/react';
import FileShare from '../../components/FileShare';
import {FileStreamSource} from '../../types';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import setLivingRoom from '../../../../redux/actions/livingRoomActions';
import {ShareStreamOption} from '../../enums';

interface ChangeFileProps {
  show: boolean;
  onOk: () => void;
  onClose: () => void;
}

const ChangeFile: FC<ChangeFileProps> = ({show, onOk, onClose}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const [src, setSrc] = useState<FileStreamSource[] | null>(null);
  const [valid, setValid] = useState<boolean>(false);

  const onFilesSrcValid = useCallback((valid: boolean) => {
    setValid(valid);
  }, []);

  const handleFilesModalDismiss = () => {
    onClose();
  };

  const handleFilesModalOk = () => {
    if (valid && src) {
      dispatch(setLivingRoom({files: src, share: ShareStreamOption.File}));
    }

    onOk();
    handleFilesModalDismiss();
  };

  return (
    <IonModal
      isOpen={show}
      onDidDismiss={handleFilesModalDismiss}
      className="wp-change-file-modal"
    >
      <IonToolbar>
        <IonTitle>{t('controlBar.addNewFile')}</IonTitle>
      </IonToolbar>

      <IonCard>
        <IonCardContent>
          <FileShare
            onSrc={setSrc}
            onValid={onFilesSrcValid}
          />

          <IonToolbar className="toolbar-actions">
            <IonButtons slot="end">
              <IonButton onClick={handleFilesModalDismiss}>
                {t('common.cancel')}
              </IonButton>
              <IonButton onClick={handleFilesModalOk} disabled={!valid}>
                {t('common.ok')}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
};

export default ChangeFile;
