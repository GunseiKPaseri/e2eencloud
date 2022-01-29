import React from 'react'
import { Login } from './features/auth/login'
import { FileDropZone } from './features/file/filedrop'

import { SideMenu } from './components/sidemenu/SideMenu'

import Box from '@mui/material/Box'

function App () {
  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu/>
      <div className="App">
        <header className="App-header">
          <h1>APIテスト用</h1>
          <Login />
          <FileDropZone />
        </header>
      </div>
    </Box>
  )
}

export default App
