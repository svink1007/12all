import React, {FC, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonInput,
  IonItem,
  IonModal,
  IonTitle,
  IonToolbar
} from '@ionic/react';

type Props = {
  open: boolean;
  onAdd: (value: number) => void;
  onCancel: () => void;
};

const AddAdditionalParticipantsModal: FC<Props> = ({open, onAdd, onCancel}: Props) => {
  const [numberOfAdditionalParticipants, setNumberOfAdditionalParticipants] = useState<number | null>(null);

  const handleAdd = () => {
    if (numberOfAdditionalParticipants && numberOfAdditionalParticipants <= 200) {
      onAdd(numberOfAdditionalParticipants);
      setNumberOfAdditionalParticipants(null);
    }

  }

  const handleDismiss = () => {
    if (open) {
      onCancel();
    }
  };

  return (
    <IonModal
      isOpen={open}
      onWillDismiss={handleDismiss}
      className="add-additional-participants-modal"
    >
      <IonToolbar>
        <IonTitle>Add participants</IonTitle>
      </IonToolbar>

      <IonCard>
        <IonCardContent>
          <IonItem className="add-participants-item">
            <IonInput
              type="number"
              min="0"
              max="200"
              placeholder="Add participants"
              value={numberOfAdditionalParticipants}
              onIonChange={(e) => e.detail.value && setNumberOfAdditionalParticipants(+e.detail.value)}
            />
          </IonItem>
          <IonToolbar>
            <IonButtons slot="end">
              <IonButton onClick={onCancel} color="primary">
                Cancel
              </IonButton>
              <IonButton onClick={handleAdd} color="primary">
                Add
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonCardContent>
      </IonCard>
    </IonModal>
  )
};

export default AddAdditionalParticipantsModal;
