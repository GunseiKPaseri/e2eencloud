import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { store } from './app/store'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { SnackbarProvider } from 'notistack'

import { Signup } from './features/auth/signup'
import { Login } from './features/auth/login'
import { Setup } from './features/auth/setup'
import { SessionConfig } from './features/session/sessionConfing'

import { composeComponents } from './utils/composeComponents'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Notifier } from './features/snackbar/Notifier'

import { ContextMenuProvider } from './features/contextmenu/ContextMenu'

const mdTheme = createTheme()

const ComposedProvider = composeComponents(
  React.StrictMode,
  (props) => <Provider {...props} store={store} />,
  (props) => <ThemeProvider {...props} theme={mdTheme} />,
  (props) => <SnackbarProvider {...props} maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />,
  (props) => <DndProvider {...props} backend={HTML5Backend} />
)

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = createRoot(rootElement)

  root.render(
    <ComposedProvider>
      <CssBaseline />
      <Notifier />
      <ContextMenuProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/signup" element={<Signup />}/>
            <Route path="/setup" element={<Setup />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/session" element={<SessionConfig />}/>
          </Routes>
        </BrowserRouter>
      </ContextMenuProvider>
    </ComposedProvider>
  )
}
