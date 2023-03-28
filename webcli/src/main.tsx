import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

import './index.css';

import App from './pages/App';
import Signup from './features/auth/components/Signup';
import Login from './features/auth/components/login/Login';
import Setup from './features/auth/components/Setup';

import Notifier from './features/snackbar/Notifier';

import ContextMenuProvider from './features/contextmenu/ContextMenuProvider';
import FileExplorer from './pages/components/FileExplorer';

import ComposedProvider from './pages/ComposedProvider';
import RequireAuth from './features/auth/components/RequireAuth';
import RequireAdmin from './features/auth/components/RequireAdmin';
import APIConfigure from './pages/components/configure/APIConfigure';
import AuthConfigure from './pages/components/configure/AuthConfigure';
import AdminConfigure from './pages/components/configure/AdminConfigure';

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
                <Route path="admin" element={<RequireAdmin><AdminConfigure /></RequireAdmin>} />
                <Route path="api" element={<RequireAuth><APIConfigure /></RequireAuth>} />
                <Route path="auth" element={<RequireAuth><AuthConfigure /></RequireAuth>} />
              </Route>
            </Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/confirm" element={<Setup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </ContextMenuProvider>
    </ComposedProvider>,
  );
}
