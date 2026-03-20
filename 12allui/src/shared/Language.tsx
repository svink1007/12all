export interface ILanguage {
  key: string;
  name: string;
  initial: string;
  dir: string;
}

class Language implements ILanguage {
  key: string;
  name: string;
  initial: string;
  dir: 'ltr' | 'rtl';

  constructor(key: string, name: string, initial: string, dir: 'ltr' | 'rtl' = 'ltr') {
    this.key = key;
    this.name = name;
    this.initial = initial;
    this.dir = dir;
  }
}

export const LANGUAGES = [
  new Language('en', 'English', 'EN'),
  // new Language('ru', 'Русский', 'РУ'),
  new Language('ar', 'عربى', 'عربى', 'rtl'),
  new Language('bg','български','BG'),
  new Language('es','española','ES')
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];
