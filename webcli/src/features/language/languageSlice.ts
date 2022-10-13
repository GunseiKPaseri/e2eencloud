import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { WritableDraft } from 'immer/dist/internal';

import i18n from 'i18next';

export const langSet = {
  ja: '日本語',
  en: 'English',
  zh: '汉文',
} as const;

export interface LanguageState {
  language: keyof typeof langSet,
}

const initialState: LanguageState = {
  language: 'ja',
};

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    changeLanguage: (
      state: WritableDraft<LanguageState>,
      action: PayloadAction<LanguageState['language']>,
    ) => {
      i18n.changeLanguage(action.payload);
      state.language = action.payload;
    },
  },
});

export default languageSlice.reducer;

export const { changeLanguage } = languageSlice.actions;
