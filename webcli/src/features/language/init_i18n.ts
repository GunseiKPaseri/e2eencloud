import i18n from 'i18next';
import type { TFunction } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { load } from 'js-yaml';
import { initReactI18next } from 'react-i18next';
import { defaultLanguage } from './languageState';

const lngDetector = new LanguageDetector();

const initI18N = (): Promise<TFunction> =>
  i18n
    .use(Backend)
    .use(lngDetector)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: '/locales/{{lng}}-{{ns}}.yaml',
        parse: (data: string) => load(data) as Record<string, string>,
      },
      debug: true,
      defaultNS: 'translations',
      detection: {
        order: [
          'querystring',
          'cookie',
          'localStorage',
          'navigator',
          'htmlTag',
        ],
      },
      fallbackLng: defaultLanguage,
      interpolation: {
        escapeValue: false,
      },
      ns: ['translations'],
    });

export default initI18N;
