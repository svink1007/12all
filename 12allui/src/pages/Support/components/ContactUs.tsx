import React, {FormEvent, useEffect, useState} from 'react';

import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  IonTextarea
} from '@ionic/react';

import {SupportService} from '../../../services';

import {EMAIL_REGEX} from '../../../shared/constants';
import {InputChangeEventDetail} from '@ionic/core';
import {useTranslation} from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from '../../../redux/shared/types';
import { setErrorToast, setSuccessToast } from '../../../redux/actions/toastActions';

class Field {
  value: string;
  error: boolean;
  valid: boolean;
  pure: boolean

  constructor(value: string = '', error: boolean = false, valid: boolean = true, pure: boolean = true) {
    this.value = value;
    this.error = error;
    this.valid = valid;
    this.pure = pure;
  }
}

const ContactUs: React.FC = () => {
  const {t} = useTranslation();

  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const dispatch = useDispatch();

  const [from, setFrom] = useState<Field>(new Field());
  const [subject, setSubject] = useState<Field>(new Field());
  const [message, setMessage] = useState<Field>(new Field());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setFrom(new Field(
        (!!profile.email && !profile.email?.includes("12all.anon")) ? profile.email : profile.phoneNumber,
        !((profile.email && !profile.email.includes("12all.anon")) || profile.phoneNumber),
        !!((profile.email && !profile.email.includes("12all.anon")) || profile.phoneNumber)
    ));
    setSubject(new Field(""))
    setMessage(new Field(""))
  }, [profile.email, profile.phoneNumber])

  const onEmailChange = ({detail: {value}}: CustomEvent<InputChangeEventDetail>) => {
    if (!value || !EMAIL_REGEX.test(value)) {
      setFrom(new Field(value || '', true, false, from.pure));
    } else {
      setFrom(new Field(value || '', false, true, from.pure));
    }
  };

  const onEmailBlur = () => {
    if (!from.value || !EMAIL_REGEX.test(from.value)) {
      setFrom(new Field(from.value, true, false, false));
    } else {
      setFrom(new Field(from.value, false, true, false));
    }
  };

  const onSend = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    SupportService.contactUs(from.value, subject.value, message.value)
      .then(({data}) => {console.log(data); setIsLoading(false); dispatch(setSuccessToast("Sent to the Support Team. Please wait for a moment"));})
      .catch((err) => {console.error(err); setIsLoading(false); dispatch(setErrorToast("Something went wrong"))});
  };

  return (
    <IonCard className="contact-us-container">
      <IonCardHeader>
        <IonCardTitle>{t('contactUs.header')}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <form noValidate onSubmit={onSend}>
          <IonItem>
            <IonLabel position="floating"
                      color={(from.error && !from.pure) ? 'danger' : 'dark'}>{t('contactUs.email')}</IonLabel>
            <IonInput type="email"
                      inputMode="email"
                      name="email"
                      autocomplete="off"
                      color={from.error ? 'danger' : 'dark'}
                      value={from.value}
                      onIonChange={onEmailChange}
                      onIonBlur={() => onEmailBlur()}
                      required
                      disabled={true}
                    />
          </IonItem>
          <IonItem>
            <IonLabel position="floating"
                      color={subject.error ? 'danger' : 'dark'}>{t('contactUs.subject')}</IonLabel>
            <IonInput type="text"
                      inputMode="text"
                      name="name"
                      autocomplete="off"
                      value={subject.value}
                      onIonChange={({detail}) => setSubject(new Field(detail.value || '', !detail.value, !!detail.value))}
                      required/>
          </IonItem>
          <IonItem>
            <IonLabel position="floating"
                      color={message.error ? 'danger' : 'dark'}>{t('contactUs.message')}</IonLabel>
            <IonTextarea
              name="message"
              value={message.value}
              onIonChange={({detail}) => setMessage(new Field(detail.value || '', !detail.value, !!detail.value))}
              required/>
          </IonItem>
          {/*<IonButton type="submit" className="ion-margin-top"*/}
          {/*           disabled={!from.valid || !subject.valid || !message.valid}>{t('contactUs.send')}</IonButton>*/}
          <IonButton type="submit" className="ion-margin-top coming-soon-btn">{isLoading ? <IonSpinner /> : t('contactUs.send')}</IonButton>
        </form>
      </IonCardContent>
    </IonCard>
  );
};

export default ContactUs;
