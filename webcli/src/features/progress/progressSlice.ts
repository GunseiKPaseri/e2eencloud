import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/internal'

export interface ProgressState {
  progress: {real: number, buffer: number} | null,
};

const initialState: ProgressState = {
  progress: null
}

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setProgress: (state: WritableDraft<ProgressState>, action: PayloadAction<{progress?: number, progressBuffer?: number}>) => {
      const real = action.payload.progress
        ? Math.min(Math.max(action.payload.progress, 0), 1)
        : state.progress
          ? state.progress.real
          : 0

      const buffer = action.payload.progressBuffer
        ? Math.min(Math.max(action.payload.progressBuffer, 0), 1)
        : state.progress
          ? state.progress.buffer
          : 0

      state.progress = { real, buffer }
    },
    deleteProgress: (state: WritableDraft<ProgressState>) => {
      state.progress = null
    }
  }
})

export default progressSlice.reducer

export const { setProgress, deleteProgress } = progressSlice.actions

export const progress = (numberator: number, denominator: number, subprogress?: number) =>
  ({ progress: (numberator + (subprogress ?? 0)) / denominator, progressBuffer: (numberator + 1) / denominator })
