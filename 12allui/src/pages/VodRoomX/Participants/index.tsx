import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonicSafeString,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPopover,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import {
  alertCircleOutline,
  banOutline,
  ellipsisVerticalCircle,
  micOffOutline,
  micOutline,
  peopleOutline,
  phonePortraitSharp,
  pinOutline,
  removeCircleOutline,
  videocamOffOutline,
  videocamOutline
} from 'ionicons/icons';
import VertoSession from '../../../verto/VertoSession';
import {Participant} from '../../../verto/models';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../redux/shared/types';
import {VlrService} from '../../../services';
import {setErrorToast, setInfoToast} from '../../../redux/actions/toastActions';

enum Action {
  MuteMic,
  StopCam,
  AskToUnmuteMic,
  AskToStartCamera,
  MakeCoHost,
  RemoveAsCoHost,
  RemoveParticipant,
  PinToMainScreen,
  BlockParticipant,
  ReportParticipant
}

type Popover = { showPopover: boolean, event?: Event };

type Props = {
  session: VertoSession;
  participants: Participant[]
  host?: boolean;
  isVodRoom?: boolean;
  isStreamRoom?: boolean;
  isFullscreen?: boolean;
  show: boolean;
};

const Participants: FC<Props> = ({session,isVodRoom,isStreamRoom, participants, host, show,isFullscreen}: Props) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {roomId, publicRoomId} = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);

  const iamHost = useRef<Participant>();
  const reportText = useRef<HTMLIonTextareaElement>(null);
  const selectedParticipant = useRef<Participant>();

  const [popover, setPopover] = useState<Popover>({showPopover: false, event: undefined});
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [disableReportSubmitButton, setDisableReportSubmitButton] = useState<boolean>(true);
  const [showBlockAlert, setShowBlockAlert] = useState<boolean>(false);

  useEffect(() => {
    iamHost.current = participants.find(p => p.isHost && p.me);
  }, [participants]);


  const openPopover = (event: React.MouseEvent, participant: Participant) => {
    event.persist();
    selectedParticipant.current = participant;
    setPopover({showPopover: true, event: event as any});
  };

  const dismissPopover = () => setPopover({showPopover: false, event: undefined});

  const muteAllMics = () => {
    participants.forEach(p => {
      if (!p.audio.muted) {
        session.toggleParticipantMic(p.participantId);
      }
    });
  };

  const handleAction = (action: Action) => {
    const participant = selectedParticipant.current;

    if (!participant) {
      dismissPopover();
      return;
    }

    switch (action) {
      case Action.MuteMic:
        session.toggleParticipantMic(participant.participantId);
        break;
      case Action.StopCam:
        session.stopParticipantCam(participant.participantId);
        break;
      case Action.AskToUnmuteMic:
        session.askToUnmuteParticipantMic(participant.callId);
        break;
      case Action.AskToStartCamera:
        session.askToStartParticipantCam(participant.callId);
        break;
      case Action.MakeCoHost: {
        participant.isCoHost = true;
        const coHostsCallIds = participants
          .filter(p => p.isCoHost)
          .map(p => p.callId)
          .join(',');
        session.sendMessage.makeCoHost(coHostsCallIds);
        VlrService.addCoHost(roomId, participant.participantId).then();
        break;
      }
      case Action.RemoveAsCoHost: {
        participant.isCoHost = false;
        const coHostCallIds = participants
          .filter(p => p.isCoHost)
          .map(p => p.callId);
        session.sendMessage.removeCoHost(participant.callId, coHostCallIds);
        VlrService.removeCoHost(roomId, participant.participantId).then();
        break;
      }
      case Action.RemoveParticipant:
        session.removeParticipant(participant.participantId);
        session.sendMessage.youHaveBeenRemoved(participant.callId);
        break;
      case Action.ReportParticipant:
        setShowReportModal(true);
        break;
      case Action.BlockParticipant:
        setShowBlockAlert(true);
        break;
      case Action.PinToMainScreen:
        session.giveParticipantFloor(participant.participantId);
        break;
    }
  };

  const handleReportModalDidDismiss = () => {
    setShowReportModal(false);
    setDisableReportSubmitButton(true);
    if (reportText.current) {
      reportText.current.value = '';
    }
  };

  const handleSubmitReport = () => {
    if (reportText.current?.value && reportText.current.value.trim() && selectedParticipant.current) {
      VlrService.reportUser({
        message: reportText.current.value.trim(),
        callId: selectedParticipant.current?.callId,
        reportedUserId: selectedParticipant.current?.userId
      })
        .then(() => {
          dispatch(setInfoToast(t('participants.reportSend')));
        })
        .catch(() => {
          dispatch(setErrorToast(t('participants.reportError')));
        });
      setShowReportModal(false);
    } else {
      setDisableReportSubmitButton(true);
    }
  };

  const handleBlockParticipant = (participant: Participant) => {
    VlrService.blockIp(participant.callId)
      .then(() => {
        session.removeParticipant(participant.participantId);
        session.sendMessage.youHaveBeenBlocked(participant.callId);
      })
      .catch(() => {
        dispatch(setErrorToast(t('participants.couldNotBlock')));
      });
  };

  return (
    <>
      <IonCard className="living-room-participants-card" color="light" style={{display: show ? 'flex' : 'none'}}>
        <IonCardHeader>
          <IonCardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <IonIcon
                  className="text-xl"
                  icon={peopleOutline}
                  color="success"
              />
              {t('participants.header')}  
            </div>
            <div className='flex items-center gap-2'>
            {
              host && participants.length > 1 &&
              <IonButton
                  title={t('participants.muteAll')}
                  onClick={muteAllMics}
                  fill="clear"
                  disabled={!participants.find(p => !p.audio.muted)}
              >
                  <IonIcon
                      slot="icon-only"
                      icon={micOffOutline}
                      color="dark"
                  />
              </IonButton>
              
            }
              
            </div>
          </IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          
          {
            participants.length === 0 &&
            <IonText className="no-participants">{t('participants.noParticipants')}</IonText>
          }
          {
            participants.map(p => (
              <IonItem key={p.callId} className={isFullscreen?"living-room-participant-fullscreen":"living-room-participant" }   >
                <IonText className="participant-name">
                  {p.me ? (p.isHostSharedVideo ? t('participants.mySharing') : t('participants.me')) : p.participantName}
                  {p.isHost ? ` (${t('participants.host')})` : ''}
                  {p.isCoHost ? ` (${t('participants.coHost')})` : ''}
                  {p.isMobileApp && <IonIcon icon={phonePortraitSharp} className="on-app-icon"/>}
                </IonText>
                <IonButtons slot="end">
                  {
                    !p.isHostSharedVideo &&
                    <>
                      <IonIcon
                        icon={p.audio.muted ? micOffOutline : micOutline}
                        color={p.audio.muted ? 'dark' : 'success'}
                        className="mic-icon"
                      />
                      {
                        p.video &&
                        <IonIcon
                          icon={p.video.muted ? videocamOffOutline : videocamOutline}
                          color={p.video.muted ? 'dark' : 'success'}
                        />
                      }
                    </>
                  }
                  <IonButton id="top-center" onClick={(e) => openPopover(e, p)} size="small">
                    <IonIcon icon={ellipsisVerticalCircle} slot="icon-only"/>
                  </IonButton>
                </IonButtons>
              </IonItem>
            ))
          }
        </IonCardContent>
      </IonCard>

      <IonPopover
        event={popover.event}
        isOpen={popover.showPopover}
        onDidDismiss={dismissPopover}
        className={`vlr-participants-popover${!selectedParticipant.current?.isHostSharedVideo && !selectedParticipant.current?.me ? ' not-host' : ''}`}
        dismissOnSelect
        alignment="start"
        side="left"
      >
        {
          selectedParticipant.current &&
          <IonList>
            {
              !selectedParticipant.current.isMobileApp &&
              !selectedParticipant.current.isHostSharedVideo &&
              !selectedParticipant.current.isHost &&
              !selectedParticipant.current.me && host ?
                (
                  selectedParticipant.current.isCoHost ?
                    <IonItem
                      button
                      onClick={() => handleAction(Action.RemoveAsCoHost)}
                    >
                      <IonIcon icon={peopleOutline} slot="start"/>
                      <IonLabel>{t('participants.removeCoHost')}</IonLabel>
                    </IonItem> :
                    <IonItem
                      button
                      onClick={() => handleAction(Action.MakeCoHost)}
                    >
                      <IonIcon icon={peopleOutline} slot="start"/>
                      <IonLabel>{t('participants.makeCoHost')}</IonLabel>
                    </IonItem>
                )
                :
                null
            }
            {host && !selectedParticipant.current.isHost &&
              <IonItem
                button
                onClick={() => handleAction(Action.PinToMainScreen)}
              >
                <IonIcon icon={pinOutline} slot="start"/>
                <IonLabel>{t('participants.pinToMainScreen')}</IonLabel>
              </IonItem>
            }
            
            {
              !selectedParticipant.current.isHostSharedVideo && !selectedParticipant.current.me && host &&
              <>
                {
                  selectedParticipant.current.audio.muted ?
                    <IonItem
                      button
                      onClick={() => handleAction(Action.AskToUnmuteMic)}
                    >
                      <IonIcon icon={micOutline} slot="start"/>
                      <IonLabel>{t('participants.askToUnmute')}</IonLabel>
                    </IonItem> :
                    <IonItem
                      button
                      onClick={() => handleAction(Action.MuteMic)}
                    >
                      <IonIcon icon={micOffOutline} slot="start"/>
                      <IonLabel>{t('participants.mute')}</IonLabel>
                    </IonItem>
                }
                {
                  selectedParticipant.current.video.muted ?
                    <IonItem
                      button
                      onClick={() => handleAction(Action.AskToStartCamera)}
                    >
                      <IonIcon icon={videocamOutline} slot="start"/>
                      <IonLabel>{t('participants.askToStartCam')}</IonLabel>
                    </IonItem> :
                    <IonItem
                      button
                      onClick={() => handleAction(Action.StopCam)}
                    >
                      <IonIcon icon={videocamOffOutline} slot="start"/>
                      <IonLabel>{t('participants.stopCam')}</IonLabel>
                    </IonItem>
                }
              </>
            }

            {
              ((!selectedParticipant.current.me && !selectedParticipant.current.isHost && !selectedParticipant.current.isHostSharedVideo)
              ||
              isVodRoom || isStreamRoom) 
              &&
              <>
                <IonItem
                  button
                  onClick={() => handleAction(Action.ReportParticipant)}
                  lines="none"
                  className="report"
                >
                  <IonIcon icon={alertCircleOutline} slot="start"/>
                  <IonLabel>{t('participants.report')}</IonLabel>
                </IonItem>
                {host &&
                  <IonItem
                    button
                    onClick={() => handleAction(Action.RemoveParticipant)}
                    lines="none"
                    className="remove"
                  >
                    <IonIcon icon={removeCircleOutline} slot="start"/>
                    <IonLabel>{t('participants.remove')}</IonLabel>
                  </IonItem>
                }
                <IonItem
                  button
                  onClick={() => handleAction(Action.BlockParticipant)}
                  lines="none"
                  className="block"
                >
                  <IonIcon icon={banOutline} slot="start"/>
                  <IonLabel>{t('participants.block')}</IonLabel>
                </IonItem>
              </>
            }
          </IonList>
        }
      </IonPopover>

      <IonModal
        isOpen={showReportModal}
        onDidDismiss={handleReportModalDidDismiss}
        className="vlr-report-modal">
        <IonToolbar>
          <IonTitle>{t('participants.report')} {selectedParticipant.current?.participantName}</IonTitle>
        </IonToolbar>

        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonTextarea ref={reportText} rows={4} placeholder={t('participants.writeMessage')} onIonChange={e => setDisableReportSubmitButton(!e.detail.value)}/>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <IonToolbar>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowReportModal(false)}>{t('common.decline')}</IonButton>
            <IonButton onClick={handleSubmitReport} disabled={disableReportSubmitButton}>{t('common.submit')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonModal>

      <IonAlert
        isOpen={showBlockAlert}
        onDidDismiss={() => setShowBlockAlert(false)}
        message={new IonicSafeString(`<Trans i18nKey="participants.blockMessage">
            By blocking <IonText>${selectedParticipant.current?.participantName}</IonText>,
            he/she will no longer be able to enter room
            <IonText>${publicRoomId}</IonText>
          </Trans>`)}
        buttons={[
          {
            text: `${t('common.decline')}`,
            role: 'cancel'
          },
          {
            text: `${t('common.block')}`,
            handler: () => {
              selectedParticipant.current && handleBlockParticipant(selectedParticipant.current);
            }
          }
        ]}
      />
    </>
  );
};

export default Participants;
