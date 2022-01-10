import './App.css'
import { Login } from './features/auth/login'
import { Setup } from './features/auth/setup'
import { Signup } from './features/auth/signup'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>APIテスト用</h1>
        <Signup />
        <Setup />
        <Login />
      </header>
    </div>
  )
}

export default App
