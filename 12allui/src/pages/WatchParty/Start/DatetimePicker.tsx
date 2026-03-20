import React, {FC, useRef} from 'react';
import {IonButton, IonDatetime, IonPopover} from '@ionic/react';
import {useTranslation} from 'react-i18next';

type Props = {
  triggerId: string;
  value: string | null;
  min?: string;
  onPickerChange: (date: string) => void;
}

export const toISOFormat = (date: Date = new Date()) => {
  const tzo = -date.getTimezoneOffset(),
    dif = tzo >= 0 ? '+' : '-',
    pad = (num: number) => num.toString().padStart(2, '0');

  return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds()) +
    dif + pad(Math.floor(Math.abs(tzo) / 60)) +
    ':' + pad(Math.abs(tzo) % 60);
};

const initialFormatValue = (utc: string | null) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);

  if (utc) {
    const valueAsDate = new Date(utc);
    if (valueAsDate > now) {
      return toISOFormat(valueAsDate);
    }
  }

  return toISOFormat(now);
};

const DatetimePicker: FC<Props> = ({triggerId, value, min, onPickerChange}: Props) => {
  const {t} = useTranslation();
  const popoverRef = useRef<HTMLIonPopoverElement>(null);
  const minDate = useRef(min || toISOFormat());
  const datetimeInitial = useRef(initialFormatValue(value));

  return (
    <IonPopover
      ref={popoverRef}
      trigger={triggerId}
      keepContentsMounted
      className="vlr-select-date-time-popover">
      <IonDatetime
        min={minDate.current}
        value={datetimeInitial.current}
        hourCycle="h23"
        firstDayOfWeek={1}
        color="primary"
        presentation="date-time"
        onIonChange={(e) => {
          datetimeInitial.current = e.detail.value as string;
          onPickerChange( e.detail.value as string);
        }}
      />
      <IonButton onClick={() => popoverRef.current?.dismiss()}>{t('common.done')}</IonButton>
    </IonPopover>
  );
};

export default DatetimePicker;
