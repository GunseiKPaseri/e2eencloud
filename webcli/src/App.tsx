import React from 'react'
import './App.css'
import { Login } from './features/auth/login'
import { Setup } from './features/auth/setup'
import { Signup } from './features/auth/signup'
import { FileDropZone } from './features/file/filedrop'

function App () {
  return (
    <div className="App">
      <header className="App-header">
        <h1>APIテスト用</h1>
        <Signup />
        <Setup />
        <Login />
        <FileDropZone />
      </header>
    </div>
  )
}

export default App
