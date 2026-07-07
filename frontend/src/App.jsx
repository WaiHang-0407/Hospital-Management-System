import { useEffect, useState } from 'react'
import { API_BASE_URL } from './api/config'
import AuthPage from './auth/AuthPage'
import { clearStoredAuth, readStoredAuth } from './auth/authStorage'
import Dashboard from './dashboard/Dashboard'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking API')
  const [auth, setAuth] = useState(() => readStoredAuth())

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500)

    fetch(`${API_BASE_URL}/health`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('API unavailable')
        }
        return response.text()
      })
      .then(() => setApiStatus('API Online'))
      .catch(() => setApiStatus('API Offline'))
      .finally(() => clearTimeout(timeoutId))

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [])

  function logout() {
    setAuth(null)
    clearStoredAuth()
  }

  if (!auth) {
    return <AuthPage apiStatus={apiStatus} onAuthenticated={setAuth} />
  }

  return <Dashboard auth={auth} onLogout={logout} />
}

export default App
