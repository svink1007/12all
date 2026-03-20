import React, {FC, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonModal,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import {closeCircleOutline} from 'ionicons/icons';
import {useTranslation} from 'react-i18next';
import SocialNetworks from '../SocialNetworks';
import {VlrService} from '../../services';
import {setErrorToast, setInfoToast} from '../../redux/actions/toastActions';
import {useDispatch} from 'react-redux';

type Props = {
  show: boolean;
  url: string;
  title?: string;
  roomPublicId?: string;
  showPushInvite?: boolean;
  onClose: () => void;
};

const Invite: FC<Props> = ({show, url, title, roomPublicId, showPushInvite, onClose}: Props) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [invitationSending, setInvitationSending] = useState(false);

  const dismissModal = () => {
    onClose();
  };

  const handleInviteAllToMyRoom = () => {
    if (roomPublicId) {
      setInvitationSending(true);
      VlrService.inviteAllToMyRoom(roomPublicId)
        .then(() => dispatch(setInfoToast('invite.invitationSent')))
        .catch(() => dispatch(setErrorToast('invite.invitationCouldNotBeSend')))
        .finally(() => {
          setInvitationSending(false);
          dismissModal();
        });
    }
  };

  return (
    <IonModal
      isOpen={show}
      onDidDismiss={dismissModal}
      className="wp-invite-modal">

      <IonToolbar>
        <IonTitle>{title || t('invite.header')}</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={dismissModal}>
            <IonIcon slot="icon-only" icon={closeCircleOutline}/>
          </IonButton>
        </IonButtons>
      </IonToolbar>

      <IonCard>
        <IonCardContent>
          <IonText color="dark">{url}</IonText>

          <SocialNetworks url={url}/>
          {
            showPushInvite && roomPublicId &&
            <IonButton
              className="invite-all"
              onClick={handleInviteAllToMyRoom}
              disabled={invitationSending}
              size="small"
            >
              {invitationSending && <IonSpinner/>}
              {t('invite.notifyAll')}
            </IonButton>
          }
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
};

export default Invite;
