import { Thermometer, Droplets, DoorOpen, Activity, Waves, Battery, Signal, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

const STATUS_LABELS = {
  normal: '正常',
  warning: '警告',
  alert: 'エラー',
  offline: 'オフライン',
}

const TYPE_ICONS = {
  TEMP: Thermometer,
  HUM: Droplets,
  DOOR: DoorOpen,
  MOTION: Activity,
  WATER: Waves,
}

function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
      status === 'normal' ? 'status-normal' :
      status === 'warning' ? 'status-warning' :
      status === 'alert' ? 'status-alert' :
      'status-offline'
    }`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function BatteryBar({ level }) {
  const color = level > 50 ? 'bg-green-500' : level > 20 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-1.5">
      <Battery className={`w-3.5 h-3.5 ${level <= 20 ? 'text-red-500' : 'text-gray-400'}`} />
      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs text-gray-500">{level}%</span>
    </div>
  )
}

function ReadingDisplay({ sensor }) {
  if (sensor.typeCode === 'DOOR') {
    return (
      <div className="text-2xl font-bold text-gray-800">
        {sensor.currentReading === 1 ? '開' : '閉'}
        <span className="text-sm font-normal text-gray-500 ml-1">
          {sensor.currentReading === 1 ? '（開放中）' : '（施錠中）'}
        </span>
      </div>
    )
  }
  if (sensor.typeCode === 'MOTION') {
    return (
      <div className="text-2xl font-bold text-gray-800">
        {sensor.currentReading === 1 ? '検知' : '未検知'}
      </div>
    )
  }
  if (sensor.typeCode === 'WATER') {
    return (
      <div className="text-2xl font-bold text-gray-800">
        {sensor.currentReading === 1 ? '水あり' : '異常なし'}
      </div>
    )
  }
  return (
    <div className="text-2xl font-bold text-gray-800">
      {sensor.currentReading}
      <span className="text-base font-normal text-gray-500 ml-1">{sensor.unit}</span>
    </div>
  )
}

export default function SensorCard({ sensor, onClick }) {
  const Icon = TYPE_ICONS[sensor.typeCode] || Activity
  const lastSeen = formatDistanceToNow(new Date(sensor.lastCommunicationDate), {
    addSuffix: true,
    locale: ja,
  })

  const borderColor = {
    normal: 'border-l-green-400',
    warning: 'border-l-yellow-400',
    alert: 'border-l-red-400',
    offline: 'border-l-gray-300',
  }[sensor.status]

  return (
    <button
      onClick={() => onClick(sensor)}
      className={`card border-l-4 ${borderColor} text-left w-full hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            sensor.status === 'normal' ? 'bg-green-50 text-green-600' :
            sensor.status === 'warning' ? 'bg-yellow-50 text-yellow-600' :
            sensor.status === 'alert' ? 'bg-red-50 text-red-600' :
            'bg-gray-50 text-gray-400'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{sensor.sensorType}</p>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{sensor.sensorName}</p>
          </div>
        </div>
        <StatusBadge status={sensor.status} />
      </div>

      <ReadingDisplay sensor={sensor} />

      {sensor.thresholdMin !== null && (
        <p className="text-xs text-gray-400 mt-1">
          閾値: {sensor.thresholdMin}{sensor.unit} 〜 {sensor.thresholdMax}{sensor.unit}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <BatteryBar level={sensor.batteryLevel} />
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Signal className="w-3 h-3" />
          {sensor.signalStrength} dBm
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        最終更新: {lastSeen}
      </div>
    </button>
  )
}
