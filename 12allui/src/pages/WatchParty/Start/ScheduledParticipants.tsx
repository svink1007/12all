import React, {FC, useRef, useState} from 'react';
import {IonChip, IonIcon, IonInput, IonItem, IonLabel, IonText} from '@ionic/react';
import {closeCircle, peopleOutline} from 'ionicons/icons';
import {useTranslation} from 'react-i18next';
import {EMAIL_REGEX} from '../../../shared/constants';

type Props = {
  participants: string[];
  onAddParticipant: (participant: string) => void;
  onRemoveParticipant: (participant: string) => void;
  hideIcon?: boolean;
}

const ScheduledParticipants: FC<Props> = ({participants, hideIcon, onAddParticipant, onRemoveParticipant}) => {
  const {t} = useTranslation();
  const participantInput = useRef<HTMLIonInputElement>(null);
  const [invalidEmail, setInvalidEmail] = useState<boolean>(false);

  const handleParticipantsKeyDown = ({key}: React.KeyboardEvent) => {
    setInvalidEmail(false);

    if ((key === 'Enter' || key === ' ' || key === ',') && participantInput.current?.value) {
      const newParticipant = (participantInput.current.value as string).trim();
      if (!EMAIL_REGEX.test(newParticipant)) {
        setInvalidEmail(true);
      } else {
        const participantExists = participants.find(participant => participant === newParticipant);
        !participantExists && onAddParticipant(newParticipant);
        participantInput.current.getInputElement().then(input => input.value = '');
      }
    }
  };

  return (
    <div className="schedule-participants">
      {
        participants.map((participant, index) => (
          <IonChip key={index}>
            <IonLabel>{participant}</IonLabel>
            <IonIcon icon={closeCircle} onClick={() => onRemoveParticipant(participant)}/>
          </IonChip>
        ))
      }

      <IonItem>
        <IonIcon icon={peopleOutline} slot="start" color="dark" hidden={hideIcon}/>
        <IonLabel position="stacked">
          {t('vlrSchedule.participants')}
        </IonLabel>
        <IonInput
          type="email"
          placeholder={t('vlrSchedule.participantsPlaceholder')}
          ref={participantInput}
          onKeyDown={handleParticipantsKeyDown}
        />
        <IonText color="danger" hidden={!invalidEmail}>{t('vlrSchedule.invalidEmail')}</IonText>
      </IonItem>
    </div>
  );
};

export default ScheduledParticipants;
