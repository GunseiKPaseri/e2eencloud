import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SnackbarProvider } from 'notistack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { store } from './app/store';

import Signup from './features/auth/Signup';
import Login from './features/auth/Login';
import Setup from './features/auth/Setup';

import composeComponents from './utils/composeComponents';

import Notifier from './features/snackbar/Notifier';

import ContextMenuProvider from './features/contextmenu/ContextMenu';
import FileExplorer from './components/fileexplorer/FileExplorer';
import ConfigurePage from './components/configpage/ConfigurePage';

const mdTheme = createTheme();

const ComposedProvider = composeComponents(
  React.StrictMode,
  (props) => <Provider {...props} store={store} />,
  (props) => <ThemeProvider {...props} theme={mdTheme} />,
  (props) => <SnackbarProvider {...props} maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />,
  (props) => <DndProvider {...props} backend={HTML5Backend} />,
);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    <ComposedProvider>
      <CssBaseline />
      <Notifier />
      <ContextMenuProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<FileExplorer />} />
              <Route path="configure">
                <Route index element={<ConfigurePage />} />
              </Route>
            </Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </ContextMenuProvider>
    </ComposedProvider>,
  );
}
