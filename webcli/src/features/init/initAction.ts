import { createAsyncThunk } from '@reduxjs/toolkit';
import { initI18NAsync } from '~/features/language/languageSlice';

const initAction = createAsyncThunk<void, void>(
  'init/caller',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(initI18NAsync()),
    ]);
  },
);

export default initAction;
