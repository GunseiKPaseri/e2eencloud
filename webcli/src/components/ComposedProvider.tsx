import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SnackbarProvider } from 'notistack';
import { store } from '../global/store';

import composeComponents from '../utils/composeComponents';

import Initialize from '../features/init/Initialize';
import ThemeWithLocalizeProvider from './ThemeWithLocalizeProvider';

const ComposedProvider = composeComponents(
  React.StrictMode,
  (props) => <ReduxProvider {...props} store={store} />,
  (props) => <Initialize {...props} />,
  (props) => <ThemeWithLocalizeProvider {...props} />,
  (props) => <SnackbarProvider {...props} maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />,
  (props) => <DndProvider {...props} backend={HTML5Backend} />,
);

export default ComposedProvider;
