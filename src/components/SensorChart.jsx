import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar
} from 'recharts'
import { X, Thermometer, Droplets, DoorOpen, Activity, Waves, Battery, Signal, Loader } from 'lucide-react'
import { getSensorHistory } from '../api/monnit'

const TYPE_ICONS = {
  TEMP: Thermometer,
  HUM: Droplets,
  DOOR: DoorOpen,
  MOTION: Activity,
  WATER: Waves,
}

const STATUS_COLORS = {
  normal: '#22c55e',
  warning: '#eab308',
  alert: '#ef4444',
  offline: '#9ca3af',
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-semibold text-gray-800">
        {payload[0].value}{unit}
      </p>
    </div>
  )
}

export default function SensorChart({ sensor, credentials, testMode, onClose }) {
  const [history, setHistory] = useState(sensor.history || [])
  const [loading, setLoading] = useState(false)
  const Icon = TYPE_ICONS[sensor.typeCode] || Activity
  const statusColor = STATUS_COLORS[sensor.status]
  const isBinary = ['DOOR', 'MOTION', 'WATER'].includes(sensor.typeCode)

  useEffect(() => {
    async function load() {
      if (history.length) return
      setLoading(true)
      try {
        const data = await getSensorHistory(credentials.apiKeyId, credentials.apiSecretKey, sensor.sensorID, testMode)
        setHistory(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sensor.sensorID])

  const yDomain = isBinary ? [0, 1] : ['auto', 'auto']

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: statusColor + '20', color: statusColor }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{sensor.sensorName}</h3>
              <p className="text-sm text-gray-500">{sensor.sensorType} — ID: {sensor.sensorID}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">現在値</p>
            <p className="text-2xl font-bold text-gray-900">
              {isBinary
                ? (sensor.typeCode === 'DOOR' ? (sensor.currentReading ? '開' : '閉') :
                   sensor.typeCode === 'MOTION' ? (sensor.currentReading ? '検知' : '未検知') :
                   (sensor.currentReading ? '水あり' : '異常なし'))
                : `${sensor.currentReading}${sensor.unit}`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">電池残量</p>
            <div className="flex items-center justify-center gap-1">
              <Battery className={`w-4 h-4 ${sensor.batteryLevel <= 20 ? 'text-red-500' : 'text-gray-400'}`} />
              <p className={`text-2xl font-bold ${sensor.batteryLevel <= 20 ? 'text-red-600' : 'text-gray-900'}`}>
                {sensor.batteryLevel}%
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">信号強度</p>
            <div className="flex items-center justify-center gap-1">
              <Signal className="w-4 h-4 text-gray-400" />
              <p className="text-2xl font-bold text-gray-900">{sensor.signalStrength}</p>
              <span className="text-sm text-gray-500">dBm</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">過去24時間の推移</h4>
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <Loader className="w-5 h-5 animate-spin mr-2" /> データ取得中...
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              履歴データがありません
            </div>
          ) : isBinary ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip unit="" />} />
                <Bar dataKey="value" fill={statusColor} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" />
                <YAxis domain={yDomain} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip unit={sensor.unit} />} />
                {sensor.thresholdMax !== null && (
                  <ReferenceLine y={sensor.thresholdMax} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '上限', fontSize: 10, fill: '#ef4444' }} />
                )}
                {sensor.thresholdMin !== null && (
                  <ReferenceLine y={sensor.thresholdMin} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: '下限', fontSize: 10, fill: '#3b82f6' }} />
                )}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={statusColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: statusColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Threshold info */}
        {sensor.thresholdMin !== null && (
          <div className="mx-6 mb-6 bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">閾値設定</p>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-blue-600 font-medium">下限: </span>
                <span>{sensor.thresholdMin}{sensor.unit}</span>
              </div>
              <div>
                <span className="text-red-600 font-medium">上限: </span>
                <span>{sensor.thresholdMax}{sensor.unit}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
