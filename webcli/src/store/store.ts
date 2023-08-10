import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { createReduxHistoryContext } from "redux-first-history";
import { createBrowserHistory } from 'history';

import authReducer from '~/features/auth/authSlice';
import contextmenuReducer from '~/features/contextmenu/contextmenuSlice';
import fileReducer, { buildFileTableAsync } from '~/features/file/fileSlice';
import languageReducer from '~/features/language/languageSlice';
import progressReducer from '~/features/progress/progressSlice';
import sessionReducer from '~/features/session/sessionSlice';
import snackbarReducer from '~/features/snackbar/snackbarSlice';
import socket, { socketIOListener } from '~/class/socketio';
import exclctrlSlice from '~/features/exclctrl/exclctrlSlice';

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({ 
  history: createBrowserHistory(),
});

const logger = createLogger({
  collapsed: true,
  diff: true,
})

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contextmenu: contextmenuReducer,
    exclctrl: exclctrlSlice,
    file: fileReducer,
    language: languageReducer,
    progress: progressReducer,
    router: routerReducer,
    session: sessionReducer,
    snackbar: snackbarReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([logger, routerMiddleware]),
  devTools: true,
});

socketIOListener(store.dispatch, {
  DECIDED_EXCLCTRL: async (args, dispatch) => {
    console.log(args);
    if(typeof args[0] === 'object' && (args[0] as {leader: unknown}).leader === socket.id){
      await dispatch(buildFileTableAsync())
    }
  }
});

export const history = createReduxHistory(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
