import { useState, useEffect, useCallback } from 'react'
import {
  LayoutGrid, Map, Bell, Router, RefreshCw, LogOut, Activity, FlaskConical, AlertOctagon,
} from 'lucide-react'
import { getSensors, getNetworks, getGateways, getAlerts } from '../api/monnit'
import SiteHealthHero from './SiteHealthHero'
import SensorTile from './SensorTile'
import FloorPlan from './FloorPlan'
import SensorDetail from './SensorDetail'
import AlertPanel from './AlertPanel'
import GatewayStatus from './GatewayStatus'

const NAV = [
  { key: 'site',     label: '現場ビュー',   icon: LayoutGrid },
  { key: 'floor',    label: '間取りビュー', icon: Map },
  { key: 'alerts',   label: 'アラート',     icon: Bell },
  { key: 'gateways', label: 'ゲートウェイ', icon: Router },
]

export default function Dashboard({ credentials, testMode, onLogout }) {
  const [sensors, setSensors] = useState([])
  const [networks, setNetworks] = useState([])
  const [gateways, setGateways] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('site')
  const [statusFilter, setStatusFilter] = useState('all')
  const [networkFilter, setNetworkFilter] = useState(null)

  const fetchAll = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true)
    setError(null)
    try {
      const [s, n, g, a] = await Promise.all([
        getSensors(credentials.apiKeyId, credentials.apiSecretKey, testMode),
        getNetworks(credentials.apiKeyId, credentials.apiSecretKey, testMode),
        getGateways(credentials.apiKeyId, credentials.apiSecretKey, testMode),
        getAlerts(credentials.apiKeyId, credentials.apiSecretKey, testMode),
      ])
      setSensors(s); setNetworks(n); setGateways(g); setAlerts(a)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'データの取得に失敗しました')
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [credentials, testMode])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => fetchAll(true), 30000)
    return () => clearInterval(id)
  }, [autoRefresh, fetchAll])

  const counts = {
    normal: sensors.filter((s) => s.status === 'normal').length,
    warning: sensors.filter((s) => s.status === 'warning').length,
    alert: sensors.filter((s) => s.status === 'alert').length,
    offline: sensors.filter((s) => s.status === 'offline').length,
  }
  const activeAlerts = alerts.filter((a) => !a.acknowledged)
  const topAlert = activeAlerts.find((a) => a.severity === 'alert') || activeAlerts[0] || null

  const visibleSensors = sensors.filter((s) => {
    if (networkFilter !== null && s.networkID !== networkFilter) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    return true
  })
  const floorSensors = sensors.filter((s) => networkFilter === null || s.networkID === networkFilter)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* サイドバー */}
      <aside className="w-60 bg-frame flex flex-col shrink-0">
        <div className="p-5">
          <div className="flex items-center gap-2 text-white">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-accent"><Activity className="w-5 h-5" /></span>
            <div>
              <p className="font-display font-bold leading-tight">iMONNIT</p>
              <p className="text-[11px] text-white/50">センサー現場ビュー</p>
            </div>
          </div>
        </div>

        {testMode && (
          <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-amber-400/15 border border-amber-300/25 flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-amber-200 text-xs font-bold">テストモード</span>
          </div>
        )}

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setView(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                view === key ? 'bg-accent text-white' : 'text-white/70 hover:bg-frame-soft hover:text-white'
              }`}>
              <span className="relative">
                <Icon className="w-[18px] h-[18px]" />
                {key === 'alerts' && activeAlerts.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 text-[10px] font-bold bg-st-alert text-white rounded-full grid place-items-center">
                    {activeAlerts.length}
                  </span>
                )}
              </span>
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          {lastUpdated && <p className="px-3 pb-2 text-[11px] text-white/40">最終更新 {lastUpdated.toLocaleTimeString('ja-JP')}</p>}
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:bg-frame-soft hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> API設定に戻る
          </button>
        </div>
      </aside>

      {/* メイン */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* トップバー */}
        <header className="bg-panel/90 backdrop-blur border-b border-line px-6 py-3 flex items-center gap-3 flex-wrap shrink-0">
          <h1 className="font-display font-bold text-lg flex-1">{NAV.find((n) => n.key === view)?.label}</h1>

          {/* ネットワーク絞り込み */}
          {(view === 'site' || view === 'floor') && networks.length > 1 && (
            <div className="flex items-center gap-1 bg-ground rounded-xl p-1">
              <FilterPill active={networkFilter === null} onClick={() => setNetworkFilter(null)}>全拠点</FilterPill>
              {networks.map((n) => (
                <FilterPill key={n.networkID} active={networkFilter === n.networkID} onClick={() => setNetworkFilter(n.networkID)}>
                  {n.networkName}
                </FilterPill>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer select-none">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="accent-accent" />
            自動更新
          </label>
          <button onClick={() => fetchAll(true)} disabled={refreshing} className="btn-ghost flex items-center gap-1.5 text-sm">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 更新
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <Centered><RefreshCw className="w-7 h-7 animate-spin mb-3 text-ink-soft" /><p className="text-ink-soft">データを取得中…</p></Centered>
          ) : error ? (
            <Centered>
              <AlertOctagon className="w-10 h-10 text-st-alert mb-3" />
              <p className="font-bold text-st-alert">{error}</p>
              <button onClick={() => fetchAll()} className="btn-accent mt-4">再試行</button>
            </Centered>
          ) : (
            <>
              {view === 'site' && (
                <div className="space-y-6 max-w-[1400px] mx-auto">
                  <SiteHealthHero counts={counts} total={sensors.length} topAlert={topAlert}
                    activeFilter={statusFilter} onFilter={setStatusFilter} />
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold">センサー（{visibleSensors.length}台）</h2>
                    {statusFilter !== 'all' && (
                      <button onClick={() => setStatusFilter('all')} className="text-sm text-accent hover:underline">絞り込みを解除</button>
                    )}
                  </div>
                  {visibleSensors.length === 0 ? (
                    <Centered><Activity className="w-9 h-9 text-ink-soft/50 mb-2" /><p className="text-ink-soft text-sm">該当するセンサーがありません</p></Centered>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {visibleSensors.map((s) => <SensorTile key={s.sensorID} sensor={s} onClick={setSelected} />)}
                    </div>
                  )}
                </div>
              )}

              {view === 'floor' && (
                <div className="space-y-6 max-w-[1400px] mx-auto">
                  <SiteHealthHero counts={counts} total={sensors.length} topAlert={topAlert}
                    activeFilter={statusFilter} onFilter={setStatusFilter} />
                  <FloorPlan sensors={floorSensors} networks={networkFilter === null ? networks : networks.filter((n) => n.networkID === networkFilter)} onSensorClick={setSelected} />
                </div>
              )}

              {view === 'alerts' && <div className="max-w-3xl mx-auto"><AlertPanel alerts={alerts} /></div>}
              {view === 'gateways' && <div className="max-w-3xl mx-auto"><GatewayStatus gateways={gateways} networks={networks} /></div>}
            </>
          )}
        </div>
      </main>

      {selected && (
        <SensorDetail sensor={selected} credentials={credentials} testMode={testMode} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function FilterPill({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
        active ? 'bg-panel text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
      }`}>
      {children}
    </button>
  )
}

function Centered({ children }) {
  return <div className="flex flex-col items-center justify-center h-64">{children}</div>
}
