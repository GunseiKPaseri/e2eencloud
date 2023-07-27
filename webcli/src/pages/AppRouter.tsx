import { HistoryRouter } from 'redux-first-history/rr6';
import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

import FileExplorer from './components/FileExplorer';

import { history } from '~/store/store';

import App from './App';

import RequireAuth from '~/features/auth/components/RequireAuth';
import RequireAdmin from '~/features/auth/components/RequireAdmin';

const Login = lazy(() => import('~/features/auth/components/login/Login'))
const Setup = lazy(() => import('~/features/auth/components/Setup'))
const Signup = lazy(() => import('~/features/auth/components/Signup'))
const APIConfigure = lazy(() => import('./components/configure/APIConfigure'))
const AdminConfigure = lazy(() => import('./components/configure/AdminConfigure'))
const AuthConfigure = lazy(() => import('./components/configure/AuthConfigure'))

export default function AppRouter (){
  return (
    <HistoryRouter history={history}>
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
    </HistoryRouter>
  )
}