import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import authReducer from '../features/auth/authSlice'
import fileReducer from '../features/file/fileSlice'
import sessionReducer from '../features/session/sessionSlice'
import progressReducer from '../features/progress/progressSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    file: fileReducer,
    session: sessionReducer,
    progress: progressReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: true
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
