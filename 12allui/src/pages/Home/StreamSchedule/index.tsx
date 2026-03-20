import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {EpgEntry} from '../../../shared/types';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {closeCircleOutline} from 'ionicons/icons';

class Show {
  id: number;
  start: string;
  end: string;
  title: string;
  day: string;

  constructor(id: number, start: string, end: string, title: string, day: string) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.title = title;
    this.day = day;
  }
}

type Schedule = {
  [id: string]: {
    day: string;
    shows: Show[];
  }
};

type Props = {
  show: boolean;
  onClose: () => void;
  streamName?: string;
  epgEntries: EpgEntry[];
  loading: boolean;
};

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const StreamSchedule: FC<Props> = ({
                                     show,
                                     onClose,
                                     streamName,
                                     epgEntries,
                                     loading
                                   }: Props) => {
  const {t} = useTranslation();
  const scheduleRef = useRef<Schedule>({});
  const epgCardRef = useRef<HTMLIonCardElement>(null);
  const daysRef = useRef<HTMLDivElement[]>();
  const segmentChangingRef = useRef<boolean>(false);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [search, setSearch] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');

  useEffect(() => {
    if (epgEntries.length) {
      const padWithZero = (value: number) => value.toString().padStart(2, '0');
      const parseDate = (date: Date) => `${padWithZero(date.getHours())}:${padWithZero(date.getMinutes())}`;

      const scheduleObj: Schedule = {};
      const now = new Date();

      epgEntries.forEach((entry: EpgEntry) => {
        const start = new Date(entry.start_date);
        const end = new Date(entry.stop_date);
        if (start >= now || now <= end) {
          const startDisplay = parseDate(start);
          const endDisplay = parseDate(end);
          const day = `${padWithZero(start.getDate())}.${padWithZero((start.getMonth() + 1))}`;
          if (!scheduleObj[WEEKDAYS[start.getDay()]]) {
            scheduleObj[WEEKDAYS[start.getDay()]] = {
              day,
              shows: []
            };
          }
          scheduleObj[WEEKDAYS[start.getDay()]].shows.push(new Show(entry.id, startDisplay, endDisplay, entry.title, day));
        }
      });

      scheduleRef.current = scheduleObj;
      const keys = Object.keys(scheduleObj);
      if (keys.length) {
        setSelectedDay(`${keys[0]}_${scheduleObj[keys[0]].day}`);
      }

      setSchedule(scheduleObj);

      setTimeout(() => {
        const elements = document.querySelectorAll<HTMLDivElement>('.epg-entities-day-container');
        daysRef.current = Array.from(elements);
      }, 250);
    }
  }, [epgEntries]);

  useEffect(() => {
    if (search) {
      const filtered: Schedule = {};
      const searchToLower = search.toLowerCase();
      Object.keys(scheduleRef.current).forEach(key => {
        const shows = scheduleRef.current[key].shows.filter(({title}) => title && title.toLowerCase().includes(searchToLower));
        if (shows.length) {
          filtered[key] = {day: scheduleRef.current[key].day, shows};
        }
      });

      setSchedule(filtered);
    } else {
      setSchedule(scheduleRef.current);
    }
  }, [search]);

  const handleSegmentButtonClick = (value: string) => {
    setSelectedDay(value);
    const element = document.getElementById(value);
    if (element) {
      segmentChangingRef.current = true;
      element.scrollIntoView({behavior: 'smooth'});
      setTimeout(() => segmentChangingRef.current = false, 1000);
    }
  };

  const onScroll = () => {
    if (daysRef.current?.length && !segmentChangingRef.current) {
      const element = daysRef.current?.find(d => d.getBoundingClientRect().top >= 160 && d.getBoundingClientRect().top <= 300);
      element && setSelectedDay(element.id);
    }
  };

  const handleDidPresent = () => {
    epgCardRef.current?.addEventListener('scroll', onScroll);
  };

  const dismissModal = () => {
    onClose();
    epgCardRef.current?.removeEventListener('scroll', onScroll);
  };

  return (
    <IonModal
      isOpen={show}
      onDidPresent={handleDidPresent}
      onDidDismiss={dismissModal}
      className="channel-schedule-modal"
    >
      <IonToolbar color="primary">
        <IonTitle>{streamName}</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={dismissModal}>
            <IonIcon slot="icon-only" icon={closeCircleOutline}/>
          </IonButton>
        </IonButtons>
      </IonToolbar>
      {
        !loading ?
          <>
            <IonSearchbar onIonChange={e => setSearch(e.detail.value!)}/>
            <IonSegment
              className="schedule-days"
              value={selectedDay}
            >
              {Object.keys(schedule).map(key => (
                <IonSegmentButton
                  key={`${key}_${schedule[key].day}`}
                  value={`${key}_${schedule[key].day}`}
                  onClick={() => handleSegmentButtonClick(`${key}_${schedule[key].day}`)}
                >
                  <IonLabel>{key}</IonLabel>
                </IonSegmentButton>
              ))}
            </IonSegment>
            <IonCard className="epg-entries-card" ref={epgCardRef} hidden={Object.keys(schedule).length === 0}>
              <IonCardContent>
                {Object.keys(schedule).map(key => (
                  <div key={`${key}_${schedule[key].day}`} id={`${key}_${schedule[key].day}`}
                       className="epg-entities-day-container">
                    <IonText color="primary" className="day">{t(`days.${key}`)} {schedule[key].day}</IonText>

                    {schedule[key].shows.map(({id, start, end, title}: Show) => (
                      <IonItem key={id} lines="none" className="program">
                        <IonText>
                          <span className="time">{start} - {end}</span>
                          <span className="title">{title}</span>
                        </IonText>
                      </IonItem>
                    ))}
                  </div>
                ))}
                {
                  !search && Object.keys(schedule).length === 0 &&
                  <IonText>{t('schedule.na')}</IonText>
                }
              </IonCardContent>
            </IonCard>
          </>
          :
          <div className="loading-epg-entries">
            <IonCard>
              <IonCardContent>
                <IonSpinner/>
              </IonCardContent>
            </IonCard>
          </div>
      }
    </IonModal>
  );
};

export default StreamSchedule;
