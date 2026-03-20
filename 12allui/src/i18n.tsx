import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';
import {DEFAULT_LANGUAGE} from './shared/Language';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: DEFAULT_LANGUAGE.key,
    fallbackLng: DEFAULT_LANGUAGE.key,
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })
  .then();

export default i18n;
