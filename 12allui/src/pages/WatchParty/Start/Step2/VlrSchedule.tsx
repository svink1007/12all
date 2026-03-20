import React, { FC, useEffect, useRef, useState } from 'react';
import './VlrSchedule.scss';
import { VlrScheduleService } from '../../../../services';
import { IonButton, IonCardContent, IonIcon, IonItem, IonSpinner, IonText, IonToolbar } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { parseVlrScheduleStartAt } from '../../../../shared/constants';
import SaveTemplate from '../SaveTemplate';
import { addVlrLogo } from './index';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from '../../../../redux/shared/types';
import { patchSelectedVlrTemplateSchedule } from '../../../../redux/actions/vlrTemplateActions';
import { setErrorToast, setInfoToast } from '../../../../redux/actions/toastActions';
import DatetimePicker from '../DatetimePicker';
import ScheduledParticipants from '../ScheduledParticipants';
import setLivingRoom from '../../../../redux/actions/livingRoomActions';
import { parseVlrScheduledDTO } from '../ScheduledRooms';
import axios, { AxiosError } from 'axios';
import VlrScheduleDurations from '../VlrScheduleDurations';

const VLR_CALENDAR_ID = 'vlr-calendar-id';

const VlrSchedule: FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    channelName,
    language,
    description,
    genre,
    logoUrl,
    room,
    logoFile,
    schedule,
    useMedia,
    mode,
    share,
    streamId,
    customStreamUrl,
    roomResolution
  } = useSelector(({ vlrTemplate }: ReduxSelectors) => vlrTemplate.selected);
  const { invitationUrl, scheduledRooms } = useSelector(({ livingRoom }: ReduxSelectors) => livingRoom);
  const scheduledDateRef = useRef(schedule.date);
  // eslint-disable-next-line
  const [startAt, setStartAt] = useState<string>();
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    if (scheduledDateRef.current) {
      const valueAsDate = new Date(scheduledDateRef.current);
      if (valueAsDate > now) {
        setStartAt(parseVlrScheduleStartAt(scheduledDateRef.current));
        return;
      }
    }

    const iso = now.toISOString();
    dispatch(patchSelectedVlrTemplateSchedule({ date: iso }));
    setStartAt(parseVlrScheduleStartAt(iso));
  }, [dispatch]);

  const handleAddParticipant = (participant: string) => {
    dispatch(patchSelectedVlrTemplateSchedule({ participants: [...schedule.participants, participant] }));
  };

  const handleRemoveParticipant = (participant: string) => {
    const filteredParticipants = schedule.participants.filter(existingParticipant => existingParticipant !== participant);
    dispatch(patchSelectedVlrTemplateSchedule({ participants: filteredParticipants }));
  };

  const handleDurationChange = (duration: number) => {
    dispatch(patchSelectedVlrTemplateSchedule({ duration }));
  }

  const handleSchedule = async () => {
    let channelLogo = logoUrl;

    if (logoFile) {
      channelLogo = await addVlrLogo(logoFile);
    }

    if (!schedule.date) {
      return;
    }

    setScheduling(true);
    VlrScheduleService.createScheduledRoom({
      startAt: schedule.date,
      vlrId: room.id,
      participants: schedule.participants.length ? schedule.participants.join(',') : undefined,
      duration: schedule.duration,
      name: channelName,
      genre,
      language,
      description,
      logo: channelLogo,
      useUserMedia: useMedia,
      mode,
      shareType: share,
      invitationUrl,
      streamId,
      customStreamUrl,
      roomResolution,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
      .then(({ data }) => {
        const rooms = [...scheduledRooms, parseVlrScheduledDTO(data)].sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at));
        dispatch(setLivingRoom({ scheduledRooms: rooms }));
        dispatch(setInfoToast('watchPartyStart.scheduled'));
      })
      .catch((err: Error | AxiosError) => {
        let message = 'common.unexpectedError';
        if (axios.isAxiosError(err)) {
          switch ((err.response?.data as any).message) {
            case 'vlr_already_scheduled':
              message = 'vlrSchedule.vlrAlreadyBooked';
              break;
            case 'date_must_be_in_future':
              message = 'vlrSchedule.dateMustBeInTheFuture';
              break;
            case 'duration_required':
              message = 'vlrSchedule.durationRequired';
              break;
          }
        }
        dispatch(setErrorToast(message));
      })
      .finally(() => setScheduling(false));
  };

  function convertDateFormat(inputDate: string): string {
    const date = new Date(inputDate);

    const day: number = date.getUTCDate();
    const month: number = date.getUTCMonth() + 1;
    const year: number = date.getUTCFullYear();
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();

    const formattedDay: string = (day < 10 ? '0' : '') + day;
    const formattedMonth: string = (month < 10 ? '0' : '') + month;
    const formattedHours: string = (hours < 10 ? '0' : '') + hours;
    const formattedMinutes: string = (minutes < 10 ? '0' : '') + minutes;

    const formattedDate: string = `${formattedDay}-${formattedMonth}-${year} ${formattedHours}:${formattedMinutes}`;

    return formattedDate;
}

  return (
    <>
      <IonCardContent className="vlr-schedule-card-content">
        <IonItem className="start" button id={VLR_CALENDAR_ID}>
          <IonIcon icon={calendarOutline} slot="start" color="dark" />
          <IonText>{schedule.date && convertDateFormat(schedule.date)}</IonText>
        </IonItem>

        <VlrScheduleDurations
          duration={schedule.duration}
          onDurationChange={handleDurationChange}
        />

        <ScheduledParticipants
          participants={schedule.participants}
          onAddParticipant={handleAddParticipant}
          onRemoveParticipant={handleRemoveParticipant}
        />
      </IonCardContent>

      <IonToolbar color="light" className="vlr-schedule-toolbar">
        <IonButton onClick={handleSchedule} disabled={!schedule.date || scheduling}>
          {scheduling && <IonSpinner />}
          {t('vlrSchedule.schedule')}
        </IonButton>
        <SaveTemplate />
      </IonToolbar>

      <DatetimePicker
        triggerId={VLR_CALENDAR_ID}
        value={schedule.date}
        onPickerChange={(date) => dispatch(patchSelectedVlrTemplateSchedule({ date }))}
      />
    </>
  );
};

export default VlrSchedule;
