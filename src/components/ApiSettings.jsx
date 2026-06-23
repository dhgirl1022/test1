import { useState } from 'react'
import { Wifi, WifiOff, Eye, EyeOff, FlaskConical, CheckCircle, XCircle, Loader } from 'lucide-react'
import { saveCredentials, testConnection } from '../api/monnit'

export default function ApiSettings({ onConnect }) {
  const [apiKeyId, setApiKeyId] = useState('')
  const [apiSecretKey, setApiSecretKey] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null) // null | 'ok' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  async function handleConnect() {
    if (!apiKeyId.trim() || !apiSecretKey.trim()) return
    setTesting(true)
    setTestResult(null)
    try {
      await testConnection(apiKeyId.trim(), apiSecretKey.trim())
      saveCredentials(apiKeyId.trim(), apiSecretKey.trim())
      setTestResult('ok')
      setTimeout(() => onConnect(apiKeyId.trim(), apiSecretKey.trim(), false), 800)
    } catch (err) {
      setTestResult('error')
      setErrorMsg(err.message || '接続に失敗しました')
    } finally {
      setTesting(false)
    }
  }

  function handleTestMode() {
    onConnect('TEST', 'TEST', true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 mb-4">
            <Wifi className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">iMONNIT ダッシュボード</h1>
          <p className="text-slate-400 mt-1 text-sm">センサー監視・可視化システム</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">API接続設定</h2>
          <p className="text-sm text-gray-500 mb-6">
            iMONNITアカウントのAPIキーを入力してください
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                APIキーID
              </label>
              <input
                type="text"
                value={apiKeyId}
                onChange={(e) => setApiKeyId(e.target.value)}
                placeholder="例: 12345678"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                APIシークレットキー
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={apiSecretKey}
                  onChange={(e) => setApiSecretKey(e.target.value)}
                  placeholder="APIシークレットキーを入力"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Result message */}
          {testResult === 'ok' && (
            <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              接続に成功しました。ダッシュボードを読み込んでいます...
            </div>
          )}
          {testResult === 'error' && (
            <div className="mt-4 flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={!apiKeyId.trim() || !apiSecretKey.trim() || testing}
            className="w-full mt-5 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <><Loader className="w-4 h-4 animate-spin" /> 接続確認中...</>
            ) : (
              <><Wifi className="w-4 h-4" /> 接続する</>
            )}
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
              または
            </div>
          </div>

          <button
            onClick={handleTestMode}
            className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <FlaskConical className="w-4 h-4" />
            テストモードで試す（デモデータ）
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            APIキーはiMONNITアカウントの設定画面で取得できます
          </p>
        </div>
      </div>
    </div>
  )
}
