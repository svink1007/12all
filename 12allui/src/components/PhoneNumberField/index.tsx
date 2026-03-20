import React, {FC, useRef, useState} from 'react';
import './styles.scss';
import {IonInput, IonItem, IonLabel, IonText, useIonViewWillEnter} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {UserManagementService} from '../../services';
import SelectCountryCode from '../SelectCountryCode';

type Props = {
  onPhoneNumber: (phoneNumber: string | null) => void;
}

const PhoneNumberField: FC<Props> = ({onPhoneNumber}: Props) => {
  const {t} = useTranslation();
  const phoneNumberRef = useRef<HTMLIonInputElement>(null);
  const [phoneNumber, setPhoneNumber] = useState<number | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [validNumber, setValidNumber] = useState<boolean | null>(null);

  useIonViewWillEnter(() => {
    setPhoneNumber(null);
    setCountryCode(null);
    setValidNumber(null);
  }, []);

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
    setTimeout(() => phoneNumberRef.current?.setFocus(), 400);
  };

  const validatePhoneNumber = () => {
    if (countryCode && phoneNumber) {
      UserManagementService.validatePhoneNumber(`${countryCode}${phoneNumber}`)
        .then(({data}) => {
          if (data.status === 'ok') {
            onPhoneNumber(`${countryCode}${phoneNumber}`);
          } else {
            onPhoneNumber(null);
          }
          setValidNumber(data.status === 'ok');
        });
    }
  };

  const handlePhoneNumberChange = (value?: string | null) => {
    if (!value) {
      phoneNumberRef.current?.getInputElement().then(el => setPhoneNumber(parseInt(el.value)))
    } else {
      setPhoneNumber(parseInt(value));
    }
  };

  return (
    <section className="phone-number-section">
      <div className={countryCode ? 'country-code code-selected' : 'country-code'}>
        <SelectCountryCode
          onSelect={handleCountryCodeChange}
        />
      </div>

      <IonItem color="secondary" className="phone-number-item">
        <IonLabel position="stacked">
          {`${t('signup.phoneNumber')} *`}
        </IonLabel>
        <IonInput
          type="number"
          name="phoneNumber"
          autocomplete="off"
          placeholder={t('signup.enterPhoneNumber')}
          value={phoneNumber}
          onIonChange={(e) => handlePhoneNumberChange(e.detail.value)}
          onIonBlur={validatePhoneNumber}
          required
          hidden={!countryCode}
          ref={phoneNumberRef}
          className="phone-number-input"
        />
      </IonItem>

      {validNumber === false && (
        <IonText color="danger" className="invalid-message">
          {t('signup.enterValidPhoneNumber')}
        </IonText>
      )}
    </section>
  );
};
export default PhoneNumberField;
