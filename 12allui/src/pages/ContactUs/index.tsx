import React, {FormEvent, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea
} from '@ionic/react';
import Layout from '../../components/Layout';
import {API_URL, EMAIL_REGEX} from '../../shared/constants';
import {InputChangeEventDetail} from '@ionic/core';
import axios from 'axios';
import {useTranslation} from 'react-i18next';

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

  const [from, setFrom] = useState<Field>(new Field());
  const [subject, setSubject] = useState<Field>(new Field());
  const [message, setMessage] = useState<Field>(new Field());

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
    axios.post(`${API_URL}/contact-us`, {from: from.value, subject: subject.value, message: message.value})
      .then(({data}) => console.log(data))
      .catch((err) => console.error(err));
  };

  return (
    <Layout className="center">
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
                        required/>
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
            <IonButton type="submit" className="ion-margin-top"
                       disabled>{t('contactUs.send')} (Coming soon)</IonButton>
          </form>
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};

export default ContactUs;
