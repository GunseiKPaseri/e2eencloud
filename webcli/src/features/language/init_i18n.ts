import i18n from 'i18next';
import type { TFunction } from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { load } from 'js-yaml';

// eslint-disable-next-line import/no-cycle
import { defaultLanguage } from './languageSlice';

const lngDetector = new LanguageDetector();

const initI18N = (): Promise<TFunction> => new Promise((resolve, reject) => {
  i18n.use(Backend)
    .use(lngDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: defaultLanguage,
      ns: ['translations'],
      defaultNS: 'translations',
      debug: true,
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      },
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: '/locales/{{lng}}-{{ns}}.yaml',
        parse: (data) => (load(data) as { [key: string]: string }),
      },
    }, (err, t) => {
      if (err) reject(err);
      else resolve(t);
    });
});

export default initI18N;
