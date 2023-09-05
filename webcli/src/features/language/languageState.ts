export const langSet = {
  jaJP: '日本語',
  enUS: 'English',
  zhCN: '汉文',
} as const;

export interface LanguageState {
  language: keyof typeof langSet;
}

export const initialState: LanguageState = {
  language: 'jaJP',
};

export const defaultLanguage = initialState.language;
