import React, {FC} from 'react';
import {IonAlert} from '@ionic/react';
import {useTranslation} from 'react-i18next';

type Props = {
  streamName: string;
  open: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
};

const DeleteStream: FC<Props> = ({streamName, open, onDismiss, onConfirm}: Props) => {
  const {t} = useTranslation();
  return (
    <IonAlert
      isOpen={open}
      onDidDismiss={onDismiss}
      header={`${t('manageStream.titleDelete')} ${streamName}`}
      message={`${t('manageStream.deleteStream')} ${streamName}?`}
      buttons={[
        {
          text: t('common.cancel'),
          role: 'cancel'
        },
        {
          text: t('common.yes'),
          handler: () => {
            onConfirm();
          }
        }
      ]}
    />
  )
};

export default DeleteStream;
