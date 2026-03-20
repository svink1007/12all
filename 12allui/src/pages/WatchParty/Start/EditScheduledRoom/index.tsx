import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import {VlrScheduledRoom} from '../ScheduledRooms';
import DatetimePicker from '../DatetimePicker';
import {useTranslation} from 'react-i18next';
import SelectLanguage from '../../../../components/SelectLanguage';
import SelectGenre from '../../../../components/SelectGenre';
import SelectLogo from '../../../../components/SelectLogo';
import {VlrScheduleService, VlrService} from '../../../../services';
import {CreateVlrSchedule, SharedStream, Vlr, VlrScheduleDTO} from '../../../../shared/types';
import {generateWatchPartyInvitationUrl, parseVlrScheduleStartAt} from '../../../../shared/constants';
import {useDispatch} from 'react-redux';
import {setErrorToast, setInfoToast} from '../../../../redux/actions/toastActions';
import ShareOptions from '../ShareOptions';
import {addVlrLogo} from '../Step2';
import ScheduledParticipants from '../ScheduledParticipants';
import {ShareStreamOption} from '../../enums';
import MyStream from '../../components/MyStream';
import {MyStreamSource} from '../../types';
import VlrScheduleDurations from '../VlrScheduleDurations';
import axios, {AxiosError} from 'axios';
import SelectFsResolution from '../SelectFsResolution';

type Props = {
  room: VlrScheduledRoom;
  isOpen: boolean;
  onUpdateDone: (room: VlrScheduleDTO) => void;
  onDismiss: (value: false) => void;
};

const EDIT_SCHEDULE_CALENDAR_ID = 'edit-schedule-calendar-id';

const EditScheduledRoom: FC<Props> = ({
                                        room: {
                                          id,
                                          vlr,
                                          start_at,
                                          name,
                                          genre,
                                          language,
                                          description,
                                          logo,
                                          participants,
                                          use_user_media,
                                          share_type,
                                          mode,
                                          invitation_url,
                                          custom_stream_url,
                                          stream,
                                          duration,
                                          room_resolution
                                        }, isOpen, onUpdateDone, onDismiss
                                      }: Props) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const logoFile = useRef<File | null>(null);
  const [editedRoom, setEditedRoom] = useState<CreateVlrSchedule>({
    vlrId: vlr?.id,
    startAt: start_at,
    name,
    genre,
    language,
    description,
    logo,
    participants,
    useUserMedia: use_user_media,
    shareType: share_type,
    mode,
    invitationUrl: invitation_url,
    customStreamUrl: custom_stream_url,
    streamId: stream?.id || null,
    duration,
    roomResolution: room_resolution
  });
  const [freeRooms, setFreeRooms] = useState<Vlr[]>([]);
  const [startAtParsed, setStartAtParsed] = useState<string>(editedRoom.startAt);
  const [participantsSplited, setParticipantsSplited] = useState<string[]>([]);
  const [streamIsValid, setStreamIsValid] = useState<boolean>(true);
  const [showCustomStream, setShowCustomStream] = useState<boolean>(!!custom_stream_url);

  useEffect(() => {
    VlrService.getFreeVlrList().then(({data: {vlr_collection}}) => setFreeRooms(vlr_collection));
  }, []);

  useEffect(() => {
    setStartAtParsed(parseVlrScheduleStartAt(editedRoom.startAt));
  }, [editedRoom.startAt]);

  const handleWillPresent = async () => {
    setParticipantsSplited(participants ? participants.split(',') : []);
    setShowCustomStream(!!custom_stream_url);
    setEditedRoom({
      vlrId: vlr.id,
      startAt: start_at,
      name,
      genre,
      language,
      description,
      logo,
      participants,
      useUserMedia: use_user_media,
      shareType: share_type,
      mode,
      invitationUrl: invitation_url,
      customStreamUrl: custom_stream_url,
      streamId: stream?.id || null,
      duration,
      roomResolution: room_resolution
    });
  };

  const handleChangeRoomValue = (value: Partial<CreateVlrSchedule>) => {
    setEditedRoom(prevState => ({...prevState, ...value}));
  };

  const handleDismiss = () => {
    onDismiss(false);
  };

  const handleRoomChange = (vlrId: number) => {
    const room = freeRooms.find(({id}) => id === vlrId);
    handleChangeRoomValue({
      vlrId,
      invitationUrl: room ? generateWatchPartyInvitationUrl(room.public_id) : ''
    });
  };

  const handleAddParticipant = (participant: string) => {
    setParticipantsSplited([...participantsSplited, participant]);
  };

  const handleRemoveParticipant = (participant: string) => {
    setParticipantsSplited(participantsSplited.filter(existingParticipant => existingParticipant !== participant));
  };

  const handleShareOptionsChange = (shareType: ShareStreamOption) => {
    let value: Partial<CreateVlrSchedule> = {shareType};
    if (shareType === ShareStreamOption.Stream || shareType === ShareStreamOption.Camera) {
      value.useUserMedia = true;
    }

    setStreamIsValid(shareType !== ShareStreamOption.Stream);
    handleChangeRoomValue(value);
  };

  const handleSave = async () => {
    if (logoFile.current) {
      editedRoom.logo = await addVlrLogo(logoFile.current);
      logoFile.current = null;
    }

    editedRoom.participants = participantsSplited.join(',');

    if (editedRoom.shareType !== ShareStreamOption.Stream) {
      editedRoom.streamId = null;
      editedRoom.customStreamUrl = null;
    }

    VlrScheduleService.updateScheduledRoom(id, editedRoom)
      .then(({data}) => {
        onUpdateDone(data);
        handleDismiss();
        dispatch(setInfoToast('vlrSchedule.roomUpdated'));
      })
      .catch((err: Error | AxiosError) => {
        let message = 'common.unexpectedError';
        if (axios.isAxiosError(err)) {
          switch ((err.response?.data as any).message) {
            case 'vlr_already_scheduled':
              message = 'vlrSchedule.vlrAlreadyBooked';
              break;
          }
        }
        dispatch(setErrorToast(message));
      });
  };

  const handleStreamSelect = useCallback((source: MyStreamSource | MyStreamSource[] | null, isValid?: boolean, stream?: SharedStream) => {
    if (stream) {
      setEditedRoom(prevState => ({...prevState, streamId: stream.id, customStreamUrl: null, useUserMedia: true}));
    } else if (source && !Array.isArray(source)) {
      setEditedRoom(prevState => ({...prevState, streamId: null, customStreamUrl: source.src, useUserMedia: true}));
    }
    setStreamIsValid(!!source);
  }, []);

  return (
    <IonModal
      isOpen={isOpen}
      className="edit-scheduled-room-modal"
      onWillPresent={handleWillPresent}
      onWillDismiss={handleDismiss}
    >
      <IonToolbar className="toolbar-header">
        <IonTitle>{t('vlrSchedule.edit')}</IonTitle>
      </IonToolbar>

      <form>
        <IonItem className="row-item" button id={EDIT_SCHEDULE_CALENDAR_ID}>
          <IonLabel position="stacked">
            {t('watchPartyStart.startAt')}
          </IonLabel>
          <IonInput readonly>{startAtParsed}</IonInput>
        </IonItem>

        <VlrScheduleDurations
          duration={editedRoom.duration}
          hideIcon
          onDurationChange={(duration) => handleChangeRoomValue({duration})}
        />

        <ScheduledParticipants
          hideIcon
          participants={participantsSplited}
          onAddParticipant={handleAddParticipant}
          onRemoveParticipant={handleRemoveParticipant}
        />

        <IonItem className="row-item">
          <IonLabel position="stacked">
            {t('watchPartyStart.roomId')}
          </IonLabel>
          <IonSelect
            interface="popover"
            value={editedRoom.vlrId}
            disabled={!freeRooms.length}
            onIonChange={e => handleRoomChange(e.detail.value)}
          >
            {
              freeRooms.map(({id, public_id}) => (
                <IonSelectOption key={id} value={id}>
                  {public_id}
                </IonSelectOption>
              ))
            }
          </IonSelect>
        </IonItem>

        <IonItem className="row-item" lines="none">
          <IonLabel position="stacked" color="dark">
            {t('watchPartyStart.invitation')}
          </IonLabel>
          <IonInput value={editedRoom.invitationUrl} readonly/>
        </IonItem>

        <ShareOptions
          selected={editedRoom.shareType}
          onSelect={handleShareOptionsChange}
        />

        {
          editedRoom.shareType === ShareStreamOption.Stream &&
          <MyStream
            hideSaveButton
            showCustomStream={showCustomStream}
            onSrc={handleStreamSelect}
            onValid={setStreamIsValid}
            onShowCustomUrlChange={setShowCustomStream}
          />
        }

        <SelectFsResolution
          initialValue={editedRoom.roomResolution}
          shareType={editedRoom.shareType}
          onResolutionChange={roomResolution => handleChangeRoomValue({roomResolution})}
        />

        <IonItem
          hidden={editedRoom.shareType === ShareStreamOption.Camera || editedRoom.shareType === ShareStreamOption.Stream}
          detail={false}
          className="row-item">
          <IonLabel>{t('watchPartyStart.joinWithCamMic')}</IonLabel>
          <IonCheckbox
            slot="start"
            checked={editedRoom.useUserMedia}
            onIonChange={e => handleChangeRoomValue({useUserMedia: e.detail.checked})}
          />
        </IonItem>

        <IonItem className="row-item channel-name">
          <IonLabel position="stacked">
            {t('watchPartyStart.roomName') + ' *'}
          </IonLabel>
          <IonInput
            placeholder={t('watchPartyStart.enterRoomName')}
            value={editedRoom.name}
            onIonChange={({detail: {value}}) => handleChangeRoomValue({name: value ? value.trim() : ''})}
          />
        </IonItem>

        <IonItem className="row-item" lines="none">
          <IonLabel position="stacked">
            {t('watchPartyStart.sharingMode')}
          </IonLabel>
          <IonSelect
            interface="popover"
            value={editedRoom.mode}
            onIonChange={e => handleChangeRoomValue({mode: e.detail.value})}
          >
            <IonSelectOption value="public">{t('watchPartyStart.public')}</IonSelectOption>
            <IonSelectOption value="private">{t('watchPartyStart.private')}</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem className="row-item select-item" lines="none">
          <SelectLogo
            logo={editedRoom.logo}
            logoText="watchPartyStart.roomLogo"
            selectLogoText="watchPartyStart.selectRoomLogo"
            onLogoSelected={(logo) => {
              logoFile.current = logo;
              !logo && handleChangeRoomValue({logo: null});
            }}
          />
        </IonItem>

        <IonItem className="row-item select-item" lines="none">
          <SelectLanguage
            language={editedRoom.language}
            onSelect={(language) => handleChangeRoomValue({language})}
            showInput
            inputLabel="watchPartyStart.roomLanguage"
          />
        </IonItem>

        <IonItem className="row-item select-item" lines="none">
          <SelectGenre
            genre={editedRoom.genre}
            onSelect={(genre) => handleChangeRoomValue({genre})}
            showInput
            inputLabel="watchPartyStart.roomGenre"
          />
        </IonItem>

        <IonItem className="row-item">
          <IonLabel position="stacked">
            {t('watchPartyStart.roomDescription')}
          </IonLabel>
          <IonTextarea
            rows={4}
            placeholder={t('watchPartyStart.enterRoomDescription')}
            value={editedRoom.description}
            onIonChange={(e) => handleChangeRoomValue({description: e.detail.value || ''})}
          />
        </IonItem>
      </form>

      <IonToolbar className="toolbar-footer">
        <IonButtons slot="end">
          <IonButton onClick={handleDismiss}>{t('common.cancel')}</IonButton>
          <IonButton onClick={handleSave} disabled={!editedRoom.name || !streamIsValid}>{t('common.save')}</IonButton>
        </IonButtons>
      </IonToolbar>

      <DatetimePicker
        triggerId={EDIT_SCHEDULE_CALENDAR_ID}
        value={editedRoom.startAt}
        onPickerChange={(date) => handleChangeRoomValue({startAt: date})}
      />
    </IonModal>
  );
};

export default EditScheduledRoom;
