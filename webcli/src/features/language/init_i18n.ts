import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import type { TFunction } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { load } from 'js-yaml';
import { defaultLanguage } from './languageState';

const lngDetector = new LanguageDetector();

const initI18N = (): Promise<TFunction> =>
  i18n
    .use(Backend)
    .use(lngDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: defaultLanguage,
      ns: ['translations'],
      defaultNS: 'translations',
      debug: true,
      detection: {
        order: [
          'querystring',
          'cookie',
          'localStorage',
          'navigator',
          'htmlTag',
        ],
      },
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: '/locales/{{lng}}-{{ns}}.yaml',
        parse: (data: string) => load(data) as Record<string, string>,
      },
    });

export default initI18N;
