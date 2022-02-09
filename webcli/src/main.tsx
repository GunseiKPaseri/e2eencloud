import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { store } from './app/store'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { Signup } from './features/auth/signup'
import { Login } from './features/auth/login'
import { Setup } from './features/auth/setup'
import { SessionConfig } from './features/session/sessionConfing'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const mdTheme = createTheme()

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={mdTheme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/signup" element={<Signup />}/>
              <Route path="/setup" element={<Setup />}/>
              <Route path="/login" element={<Login />}/>
              <Route path="/session" element={<SessionConfig />}/>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </DndProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
