import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { WritableDraft } from 'immer/dist/internal';

import i18n from 'i18next';

import initI18N from './init_i18n';

import { initialState, type LanguageState } from './languageState';

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
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
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

export const { changeLanguage } = languageSlice.actions;
