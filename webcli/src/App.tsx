import React from 'react'
import { Login } from './features/auth/login'
import { FileDropZone } from './features/file/filedrop'

import { SideMenu } from './components/sidemenu/SideMenu'

import Box from '@mui/material/Box'

function App () {
  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu/>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <div className="App">
          <header className="App-header">
            <h1>APIテスト用</h1>
            <Login />
            <FileDropZone />
          </header>
        </div>
      </Box>
    </Box>
  )
}

export default App
