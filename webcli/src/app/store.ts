import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import authReducer from '../features/auth/authSlice';
import contextmenuReducer from '../features/contextmenu/contextmenuSlice';
import fileReducer from '../features/file/fileSlice';
import progressReducer from '../features/progress/progressSlice';
import sessionReducer from '../features/session/sessionSlice';
import snackbarReducer from '../features/snackbar/snackbarSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contextmenu: contextmenuReducer,
    file: fileReducer,
    progress: progressReducer,
    session: sessionReducer,
    snackbar: snackbarReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: true,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
