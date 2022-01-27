import React from 'react'
import { Login } from './features/auth/login'
import { FileDropZone } from './features/file/filedrop'

function App () {
  return (
    <div className="App">
      <header className="App-header">
        <h1>APIテスト用</h1>
        <Login />
        <FileDropZone />
      </header>
    </div>
  )
}

export default App
