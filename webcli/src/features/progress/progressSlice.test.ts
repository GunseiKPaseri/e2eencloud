import { configureStore } from '@reduxjs/toolkit';
import {
  describe, test, expect, beforeEach,
} from 'vitest';
import progressReducer, { setProgress, deleteProgress, progress } from './progressSlice';

const genStore = () => configureStore({
  reducer: {
    progress: progressReducer,
  },
});

describe('#progressReducer', () => {
  let store: ReturnType<typeof genStore>;
  beforeEach(() => {
    store = genStore();
  });

  test('reducer', () => {
    store.dispatch(setProgress({ progress: 0.5 }));
    expect(store.getState().progress).toEqual({ progress: { buffer: 0, real: 0.5 } });
    store.dispatch(setProgress({ progress: 0.5, progressBuffer: 0.7 }));
    expect(store.getState().progress).toEqual({ progress: { buffer: 0.7, real: 0.5 } });
    store.dispatch(deleteProgress());
    expect(store.getState().progress).toEqual({ progress: null });
  });

  test('#progress', () => {
    expect(progress(0, 5)).toEqual({ progress: 0, progressBuffer: 0.2 });
    expect(progress(1, 5)).toEqual({ progress: 0.2, progressBuffer: 0.4 });
    expect(progress(2, 5)).toEqual({ progress: 0.4, progressBuffer: 0.6 });
    expect(progress(3, 5)).toEqual({ progress: 0.6, progressBuffer: 0.8 });
    expect(progress(4, 5)).toEqual({ progress: 0.8, progressBuffer: 1 });
    expect(progress(5, 5)).toEqual({ progress: 1, progressBuffer: 1 });

    const p = progress(2, 5, 0.3);
    expect(p.progress).toBeCloseTo(0.46);
    expect(p.progressBuffer).toBeCloseTo(0.6);
    // expect(progress(2, 5, 0.3)).toEqual({
    //  progress: expect.closeTo(0.46, 5),
    //  progressBuffer: 0.6
    // });
  });
});
