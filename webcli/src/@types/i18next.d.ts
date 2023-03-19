// import the original type declarations
import 'i18next';

declare module 'i18next' {
  // and extend them!
  interface CustomTypeOptions {
    // custom namespace type if you changed it
    defaultNS: 'translations';
    // custom resources type
    resources: {
      'translations': {
        admin: {
          authority: string
          capacity: string
          cancel: string
          ChangeSuccessful: string
          ChangeFailed: string
          delete: string
          edit: string
          issue: string
          IssueCoupon: string
          on: string
          off: string
          usage: string
        }
        auth: {
          delete: string
          edit: string
          email: string
          login: string
          loginfailed: string
          logout: string
          password: string
          registifyoudonothaveanaccount: string
          multifactorauth: string
          totptoken: string
          youalreadyloggined: string
        }
        language: {
          jaJP: string
          enUS: string
          zhCN: string
        }
        conf:{
          dateFnsLocale: 'ja' | 'zhCN' | 'enUS'
        }
      }
    };
  }
}
