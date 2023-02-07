import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { WritableDraft } from 'immer/dist/internal';

import i18n from 'i18next';

// eslint-disable-next-line import/no-cycle
import initI18N from './init_i18n';

export const langSet = {
  jaJP: '日本語',
  enUS: 'English',
  zhCN: '汉文',
} as const;

export interface LanguageState {
  language: keyof typeof langSet,
}

const initialState: LanguageState = {
  language: 'jaJP',
};

export const initI18NAsync = createAsyncThunk<{ language: string }>(
  'language/init18n',
  async () => {
    await initI18N();
    return { language: i18n.language };
  },
);

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
  extraReducers: (builder) => {
    builder
      .addCase(initI18NAsync.fulfilled, (state: LanguageState, action) => {
        state.language = action.payload.language as LanguageState['language'];
      });
  },
});

export default languageSlice.reducer;

export const defaultLanguage = initialState.language;

export const { changeLanguage } = languageSlice.actions;
