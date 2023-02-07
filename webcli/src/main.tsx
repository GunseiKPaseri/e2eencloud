import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

import './index.css';

import App from './App';
import Signup from './features/auth/components/Signup';
import Login from './features/auth/components/Login';
import Setup from './features/auth/components/Setup';

import Notifier from './features/snackbar/Notifier';

import ContextMenuProvider from './features/contextmenu/ContextMenu';
import FileExplorer from './components/fileexplorer/FileExplorer';
import ConfigurePage from './components/configpage/ConfigurePage';

import ComposedProvider from './components/ComposedProvider';

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
