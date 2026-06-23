import { useState, useEffect } from 'react'
import ApiSettings from './components/ApiSettings'
import Dashboard from './components/Dashboard'
import { loadCredentials, clearCredentials } from './api/monnit'

export default function App() {
  const [credentials, setCredentials] = useState(null)
  const [testMode, setTestMode] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const saved = loadCredentials()
    if (saved) {
      setCredentials(saved)
      setTestMode(false)
    }
    setInitializing(false)
  }, [])

  function handleConnect(apiKeyId, apiSecretKey, isTest) {
    setCredentials({ apiKeyId, apiSecretKey })
    setTestMode(isTest)
  }

  function handleLogout() {
    clearCredentials()
    setCredentials(null)
    setTestMode(false)
  }

  if (initializing) return null

  if (!credentials) {
    return <ApiSettings onConnect={handleConnect} />
  }

  return (
    <Dashboard
      credentials={credentials}
      testMode={testMode}
      onLogout={handleLogout}
    />
  )
}
