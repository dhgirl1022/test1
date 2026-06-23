import { useState } from 'react'
import { Wifi, Eye, EyeOff, FlaskConical, CheckCircle2, XCircle, Loader2, Activity } from 'lucide-react'
import { saveCredentials, testConnection } from '../api/monnit'

export default function ApiSettings({ onConnect }) {
  const [apiKeyId, setApiKeyId] = useState('')
  const [apiSecretKey, setApiSecretKey] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState(null) // null | 'ok' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  async function handleConnect() {
    if (!apiKeyId.trim() || !apiSecretKey.trim()) return
    setTesting(true); setResult(null)
    try {
      await testConnection(apiKeyId.trim(), apiSecretKey.trim())
      saveCredentials(apiKeyId.trim(), apiSecretKey.trim())
      setResult('ok')
      setTimeout(() => onConnect(apiKeyId.trim(), apiSecretKey.trim(), false), 700)
    } catch (err) {
      setResult('error'); setErrorMsg(err.message || '接続に失敗しました')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* 左：ブランドパネル */}
      <div className="hidden lg:flex flex-col justify-between bg-frame p-12 text-white relative overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-accent"><Activity className="w-5 h-5" /></span>
          <span className="font-display font-bold text-lg">iMONNIT</span>
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold leading-tight">現場の今を、<br />ひと目で。</h1>
          <p className="text-white/60 mt-4 max-w-sm leading-relaxed">
            温度・湿度・ドア・人感・漏水——あらゆるセンサーを、数字ではなく直感的なイメージで監視できます。
          </p>
        </div>
        <p className="text-white/40 text-sm relative z-10">センサー現場ビュー・モニタリングシステム</p>
        {/* 装飾グロー */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(79,70,229,.35), transparent)' }} />
      </div>

      {/* 右：入力 */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-accent text-white"><Activity className="w-5 h-5" /></span>
            <span className="font-display font-bold text-lg">iMONNIT</span>
          </div>

          <h2 className="font-display text-2xl font-bold">接続設定</h2>
          <p className="text-ink-soft text-sm mt-1 mb-6">iMONNITアカウントのAPIキーを入力してください。</p>

          <label className="block text-sm font-bold mb-1">APIキーID</label>
          <input value={apiKeyId} onChange={(e) => setApiKeyId(e.target.value)} placeholder="例: 12345678"
            className="w-full border border-line rounded-xl px-3.5 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-accent" />

          <label className="block text-sm font-bold mb-1">APIシークレットキー</label>
          <div className="relative mb-1">
            <input type={showSecret ? 'text' : 'password'} value={apiSecretKey} onChange={(e) => setApiSecretKey(e.target.value)}
              placeholder="シークレットキーを入力"
              className="w-full border border-line rounded-xl px-3.5 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            <button type="button" onClick={() => setShowSecret((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink" aria-label="表示切替">
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {result === 'ok' && (
            <div className="mt-3 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm" style={{ background: 'var(--st-normal-bg)', color: '#0f7a37' }}>
              <CheckCircle2 className="w-4 h-4 shrink-0" /> 接続に成功しました。読み込んでいます…
            </div>
          )}
          {result === 'error' && (
            <div className="mt-3 flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm" style={{ background: 'var(--st-alert-bg)', color: '#b51d1d' }}>
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{errorMsg}</span>
            </div>
          )}

          <button onClick={handleConnect} disabled={!apiKeyId.trim() || !apiSecretKey.trim() || testing}
            className="btn-accent w-full mt-5 flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {testing ? <><Loader2 className="w-4 h-4 animate-spin" /> 接続確認中…</> : <><Wifi className="w-4 h-4" /> 接続する</>}
          </button>

          <div className="flex items-center gap-3 my-5 text-xs text-ink-soft">
            <div className="flex-1 border-t border-line" /> または <div className="flex-1 border-t border-line" />
          </div>

          <button onClick={() => onConnect('TEST', 'TEST', true)}
            className="btn-ghost w-full flex items-center justify-center gap-2 py-3">
            <FlaskConical className="w-4 h-4" /> テストモードで試す（デモデータ）
          </button>

          <p className="text-xs text-ink-soft mt-4 text-center">APIキーはiMONNITアカウントの設定画面で取得できます。</p>
        </div>
      </div>
    </div>
  )
}
