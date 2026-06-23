import { useState, useEffect, useCallback } from 'react'
import {
  Activity, RefreshCw, Settings, FlaskConical, CheckCircle,
  AlertTriangle, AlertCircle, WifiOff, LayoutDashboard, LogOut
} from 'lucide-react'
import { getSensors, getNetworks, getGateways, getAlerts } from '../api/monnit'
import SensorCard from './SensorCard'
import SensorChart from './SensorChart'
import NetworkList from './NetworkList'
import GatewayStatus from './GatewayStatus'
import AlertPanel from './AlertPanel'

const VIEWS = {
  dashboard: 'ダッシュボード',
  sensors: 'センサー一覧',
  gateways: 'ゲートウェイ',
  alerts: 'アラート',
}

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
  const [selectedSensor, setSelectedSensor] = useState(null)
  const [activeNetwork, setActiveNetwork] = useState(null)
  const [activeView, setActiveView] = useState('dashboard')
  const [sensorFilter, setSensorFilter] = useState('all')

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const [s, n, g, a] = await Promise.all([
        getSensors(credentials.apiKeyId, credentials.apiSecretKey, testMode),
        getNetworks(credentials.apiKeyId, credentials.apiSecretKey, testMode),
        getGateways(credentials.apiKeyId, credentials.apiSecretKey, testMode),
        getAlerts(credentials.apiKeyId, credentials.apiSecretKey, testMode),
      ])
      setSensors(s)
      setNetworks(n)
      setGateways(g)
      setAlerts(a)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'データの取得に失敗しました')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [credentials, testMode])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => fetchAll(true), 30000)
    return () => clearInterval(id)
  }, [autoRefresh, fetchAll])

  const displayedSensors = sensors.filter((s) => {
    if (activeNetwork !== null && s.networkID !== activeNetwork) return false
    if (sensorFilter === 'alert') return s.status === 'alert'
    if (sensorFilter === 'warning') return s.status === 'warning' || s.status === 'alert'
    if (sensorFilter === 'offline') return s.status === 'offline'
    return true
  })

  const statusCounts = {
    normal: sensors.filter((s) => s.status === 'normal').length,
    warning: sensors.filter((s) => s.status === 'warning').length,
    alert: sensors.filter((s) => s.status === 'alert').length,
    offline: sensors.filter((s) => s.status === 'offline').length,
  }
  const activeAlerts = alerts.filter((a) => !a.acknowledged)

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-800 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-white font-bold text-lg">iMONNIT</span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">センサー監視システム</p>
        </div>

        {testMode && (
          <div className="mx-3 mt-3 px-3 py-2 bg-amber-500/20 border border-amber-400/30 rounded-lg flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-amber-300 text-xs font-medium">テストモード</span>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {Object.entries(VIEWS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeView === key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {key === 'dashboard' && <LayoutDashboard className="w-4 h-4" />}
              {key === 'sensors' && <Activity className="w-4 h-4" />}
              {key === 'gateways' && <WifiOff className="w-4 h-4" />}
              {key === 'alerts' && (
                <span className="relative">
                  <AlertCircle className="w-4 h-4" />
                  {activeAlerts.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                      {activeAlerts.length}
                    </span>
                  )}
                </span>
              )}
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700 space-y-2">
          <div className="px-3 py-2 text-xs text-slate-400">
            {lastUpdated && (
              <p>最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}</p>
            )}
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            API設定に戻る
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <h2 className="font-semibold text-gray-800 text-lg flex-1">
            {VIEWS[activeView]}
          </h2>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            自動更新 (30秒)
          </label>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 py-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            更新
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-3" />
              <p>データを取得中...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
              <p className="text-red-600 font-medium">{error}</p>
              <button onClick={() => fetchAll()} className="btn-primary mt-4">再試行</button>
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && (
                <DashboardView
                  sensors={sensors}
                  networks={networks}
                  gateways={gateways}
                  alerts={alerts}
                  statusCounts={statusCounts}
                  activeNetwork={activeNetwork}
                  sensorFilter={sensorFilter}
                  displayedSensors={displayedSensors}
                  onSelectNetwork={setActiveNetwork}
                  onFilterChange={setSensorFilter}
                  onSensorClick={setSelectedSensor}
                />
              )}
              {activeView === 'sensors' && (
                <SensorsView
                  sensors={sensors}
                  networks={networks}
                  activeNetwork={activeNetwork}
                  sensorFilter={sensorFilter}
                  displayedSensors={displayedSensors}
                  onSelectNetwork={setActiveNetwork}
                  onFilterChange={setSensorFilter}
                  onSensorClick={setSelectedSensor}
                />
              )}
              {activeView === 'gateways' && (
                <GatewayStatus gateways={gateways} networks={networks} />
              )}
              {activeView === 'alerts' && (
                <AlertPanel alerts={alerts} />
              )}
            </>
          )}
        </div>
      </main>

      {selectedSensor && (
        <SensorChart
          sensor={selectedSensor}
          credentials={credentials}
          testMode={testMode}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  )
}

function StatCard({ label, count, color, icon: Icon, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`card text-left hover:shadow-md transition-all ${active ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </button>
  )
}

function DashboardView({ sensors, networks, gateways, alerts, statusCounts, activeNetwork, sensorFilter, displayedSensors, onSelectNetwork, onFilterChange, onSensorClick }) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="正常" count={statusCounts.normal} color="bg-green-100 text-green-600" icon={CheckCircle}
          onClick={() => onFilterChange(sensorFilter === 'normal' ? 'all' : 'normal')}
          active={sensorFilter === 'normal'} />
        <StatCard label="警告" count={statusCounts.warning} color="bg-yellow-100 text-yellow-600" icon={AlertTriangle}
          onClick={() => onFilterChange(sensorFilter === 'warning' ? 'all' : 'warning')}
          active={sensorFilter === 'warning'} />
        <StatCard label="エラー" count={statusCounts.alert} color="bg-red-100 text-red-600" icon={AlertCircle}
          onClick={() => onFilterChange(sensorFilter === 'alert' ? 'all' : 'alert')}
          active={sensorFilter === 'alert'} />
        <StatCard label="オフライン" count={statusCounts.offline} color="bg-gray-100 text-gray-500" icon={WifiOff}
          onClick={() => onFilterChange(sensorFilter === 'offline' ? 'all' : 'offline')}
          active={sensorFilter === 'offline'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left column */}
        <div className="xl:col-span-1 space-y-4">
          <NetworkList
            networks={networks}
            sensors={sensors}
            activeNetwork={activeNetwork}
            onSelect={onSelectNetwork}
          />
          <AlertPanel alerts={alerts} />
        </div>

        {/* Sensor grid */}
        <div className="xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">
              センサー一覧 <span className="text-gray-400 font-normal text-sm">({displayedSensors.length}件)</span>
            </h3>
            {sensorFilter !== 'all' && (
              <button onClick={() => onFilterChange('all')} className="text-xs text-blue-600 hover:underline">
                フィルター解除
              </button>
            )}
          </div>
          {displayedSensors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Activity className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">該当するセンサーがありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
              {displayedSensors.map((sensor) => (
                <SensorCard key={sensor.sensorID} sensor={sensor} onClick={onSensorClick} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SensorsView({ sensors, networks, activeNetwork, sensorFilter, displayedSensors, onSelectNetwork, onFilterChange, onSensorClick }) {
  const filterOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'normal', label: '正常のみ' },
    { value: 'warning', label: '警告以上' },
    { value: 'alert', label: 'エラーのみ' },
    { value: 'offline', label: 'オフライン' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={activeNetwork ?? ''}
          onChange={(e) => onSelectNetwork(e.target.value === '' ? null : Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">すべてのネットワーク</option>
          {networks.map((n) => (
            <option key={n.networkID} value={n.networkID}>{n.networkName}</option>
          ))}
        </select>

        <div className="flex gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sensorFilter === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="text-sm text-gray-400 ml-auto">{displayedSensors.length} / {sensors.length} 件表示</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedSensors.map((sensor) => (
          <SensorCard key={sensor.sensorID} sensor={sensor} onClick={onSensorClick} />
        ))}
        {displayedSensors.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center h-48 text-gray-400">
            <Activity className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">該当するセンサーがありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
