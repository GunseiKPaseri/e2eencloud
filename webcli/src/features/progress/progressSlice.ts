import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { WritableDraft } from 'immer/dist/internal';

export interface ProgressState {
  progress: { real: number; buffer: number } | null;
}

const initialState: ProgressState = {
  progress: null,
};

export const progressSlice = createSlice({
  initialState,
  name: 'progress',
  reducers: {
    deleteProgress: (state: WritableDraft<ProgressState>) => {
      state.progress = null;
    },
    setProgress: (
      state: WritableDraft<ProgressState>,
      action: PayloadAction<{ progress?: number; progressBuffer?: number }>,
    ) => {
      const real = action.payload.progress
        ? Math.min(Math.max(action.payload.progress, 0), 1)
        : state.progress
        ? state.progress.real
        : 0;

      const buffer = action.payload.progressBuffer
        ? Math.min(Math.max(action.payload.progressBuffer, 0), 1)
        : state.progress
        ? state.progress.buffer
        : 0;

      state.progress = { buffer, real };
    },
  },
});

export default progressSlice.reducer;

export const { setProgress, deleteProgress } = progressSlice.actions;

export const progress = (
  numberator: number,
  denominator: number,
  subprogress?: number | { loaded: number; total?: number },
) => ({
  progress:
    (numberator +
      (typeof subprogress === 'number'
        ? subprogress
        : subprogress === undefined
        ? 0
        : subprogress.loaded / (subprogress.total ?? subprogress.loaded))) /
    denominator,
  progressBuffer: Math.max(Math.min((numberator + 1) / denominator, 1), 0),
});
