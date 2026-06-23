import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { statusOf, TYPE_AXIS } from '../lib/status'
import ThermometerGauge from './visuals/ThermometerGauge'
import HumidityRing from './visuals/HumidityRing'
import DoorVisual from './visuals/DoorVisual'
import MotionRadar from './visuals/MotionRadar'
import WaterLevel from './visuals/WaterLevel'
import BatteryGlyph from './visuals/BatteryGlyph'

// センサー種別ごとの直観ビジュアルと読み取り文言を返す
export function renderVisual(sensor, hex, size) {
  switch (sensor.typeCode) {
    case 'TEMP':
      return <ThermometerGauge value={sensor.currentReading} axis={TYPE_AXIS.TEMP} hex={hex}
        thresholdMin={sensor.thresholdMin} thresholdMax={sensor.thresholdMax} width={size?.thermo ?? 78} />
    case 'HUM':
      return <HumidityRing value={sensor.currentReading} hex={hex} width={size?.ring ?? 132} />
    case 'DOOR':
      return <DoorVisual open={sensor.currentReading === 1} hex={hex} width={size?.door ?? 112} />
    case 'MOTION':
      return <MotionRadar active={sensor.currentReading === 1} hex={hex} width={size?.radar ?? 118} />
    case 'WATER':
      return <WaterLevel wet={sensor.currentReading === 1} hex={hex} width={size?.water ?? 130} />
    default:
      return null
  }
}

export function readingText(sensor) {
  switch (sensor.typeCode) {
    case 'TEMP': return `${sensor.currentReading}°C`
    case 'HUM':  return `${sensor.currentReading}%`
    case 'DOOR': return sensor.currentReading === 1 ? '開いています' : '閉まっています'
    case 'MOTION': return sensor.currentReading === 1 ? '動きを検知中' : '動きなし'
    case 'WATER': return sensor.currentReading === 1 ? '漏水を検知' : '乾燥（正常）'
    default: return '—'
  }
}

export default function SensorTile({ sensor, onClick }) {
  const st = statusOf(sensor.status)
  const lastSeen = formatDistanceToNow(new Date(sensor.lastCommunicationDate), { addSuffix: true, locale: ja })
  const isCritical = sensor.status === 'alert'

  return (
    <button
      onClick={() => onClick(sensor)}
      className="panel anim-float-in text-left w-full overflow-hidden transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{ borderTopColor: st.color, borderTopWidth: 3 }}
    >
      <div className="p-4 pb-3">
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-[11px] text-ink-soft">{sensor.sensorType}</p>
            <p className="text-sm font-bold truncate">{sensor.sensorName}</p>
          </div>
          <span className={`chip chip-${sensor.status} ${isCritical ? 'anim-alert-glow' : ''}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
            {st.label}
          </span>
        </div>

        {/* ビジュアル */}
        <div className="flex items-center justify-center h-[150px] my-1">
          {renderVisual(sensor, st.hex)}
        </div>

        {/* 読み取り文言 */}
        <p className="text-center font-readout text-lg font-semibold" style={{ color: st.color }}>
          {readingText(sensor)}
        </p>
      </div>

      {/* フッター */}
      <div className="px-4 py-2.5 border-t border-line bg-[#fafcfc] flex items-center justify-between">
        <BatteryGlyph level={sensor.batteryLevel} />
        <span className="text-[11px] text-ink-soft">{lastSeen}</span>
      </div>
    </button>
  )
}
