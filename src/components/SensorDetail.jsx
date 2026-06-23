import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar,
} from 'recharts'
import { X, Battery, Signal, Clock, Hand, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { statusOf, TYPE_AXIS } from '../lib/status'
import { getSensorHistory } from '../api/monnit'
import ThermometerGauge from './visuals/ThermometerGauge'
import HumidityRing from './visuals/HumidityRing'
import DoorVisual from './visuals/DoorVisual'
import MotionRadar from './visuals/MotionRadar'
import WaterLevel from './visuals/WaterLevel'
import BatteryGlyph from './visuals/BatteryGlyph'
import { readingText } from './SensorTile'

export default function SensorDetail({ sensor, credentials, testMode, onClose }) {
  const st = statusOf(sensor.status)
  const isBinary = ['DOOR', 'MOTION', 'WATER'].includes(sensor.typeCode)
  const [thresholds, setThresholds] = useState({ min: sensor.thresholdMin, max: sensor.thresholdMax })
  const [history, setHistory] = useState(sensor.history || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (history.length) return
      setLoading(true)
      try {
        const data = await getSensorHistory(credentials.apiKeyId, credentials.apiSecretKey, sensor.sensorID, testMode)
        if (!cancelled) setHistory(data)
      } catch { /* 履歴なし */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [sensor.sensorID]) // eslint-disable-line react-hooks/exhaustive-deps

  function setThreshold(which, value) {
    setThresholds((prev) => {
      if (which === 'min') return { ...prev, min: Math.min(value, (prev.max ?? value)) }
      return { ...prev, max: Math.max(value, (prev.min ?? value)) }
    })
  }

  const bigVisual = (() => {
    switch (sensor.typeCode) {
      case 'TEMP':
        return <ThermometerGauge value={sensor.currentReading} axis={TYPE_AXIS.TEMP} hex={st.hex}
          thresholdMin={thresholds.min} thresholdMax={thresholds.max} width={140} interactive onThresholdChange={setThreshold} />
      case 'HUM':  return <HumidityRing value={sensor.currentReading} hex={st.hex} width={210} />
      case 'DOOR': return <DoorVisual open={sensor.currentReading === 1} hex={st.hex} width={180} />
      case 'MOTION': return <MotionRadar active={sensor.currentReading === 1} hex={st.hex} width={190} />
      case 'WATER': return <WaterLevel wet={sensor.currentReading === 1} hex={st.hex} width={210} />
      default: return null
    }
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-frame/55 backdrop-blur-sm" onClick={onClose}>
      <div className="panel w-full max-w-3xl max-h-[92vh] overflow-y-auto anim-float-in" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-5 border-b border-line" style={{ borderTopColor: st.color }}>
          <div className="flex items-center gap-3">
            <span className={`chip chip-${sensor.status}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} /> {st.label}
            </span>
            <div>
              <h3 className="font-display font-bold text-lg leading-tight">{sensor.sensorName}</h3>
              <p className="text-xs text-ink-soft">{sensor.sensorType}・ID {sensor.sensorID}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#f1f5f6] text-ink-soft" aria-label="閉じる">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 上段：ビジュアル + 状態 */}
        <div className="grid md:grid-cols-2 gap-5 p-5">
          <div className="flex flex-col items-center justify-center bg-[#f7fafb] rounded-2xl p-5 border border-line">
            <div className="flex items-center justify-center min-h-[210px]">{bigVisual}</div>
            <p className="mt-2 font-readout text-xl font-bold" style={{ color: st.color }}>{readingText(sensor)}</p>
            {sensor.typeCode === 'TEMP' && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-accent">
                <Hand className="w-3.5 h-3.5" /> 点線をドラッグして閾値を調整できます
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Stat label="現在値" value={readingText(sensor)} color={st.color} />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line p-3">
                <p className="text-xs text-ink-soft flex items-center gap-1 mb-1"><Battery className="w-3.5 h-3.5" /> 電池残量</p>
                <BatteryGlyph level={sensor.batteryLevel} />
              </div>
              <div className="rounded-xl border border-line p-3">
                <p className="text-xs text-ink-soft flex items-center gap-1 mb-1"><Signal className="w-3.5 h-3.5" /> 信号強度</p>
                <p className="font-readout font-bold">{sensor.signalStrength} <span className="text-xs font-normal text-ink-soft">dBm</span></p>
              </div>
            </div>
            {!isBinary && (
              <div className="rounded-xl border border-line p-3">
                <p className="text-xs text-ink-soft mb-2">閾値（基準範囲）</p>
                <div className="flex items-center gap-4 text-sm">
                  <span><span className="font-bold" style={{ color: '#2563eb' }}>下限</span> {thresholds.min}{TYPE_AXIS[sensor.typeCode]?.unit}</span>
                  <span><span className="font-bold" style={{ color: '#dc2626' }}>上限</span> {thresholds.max}{TYPE_AXIS[sensor.typeCode]?.unit}</span>
                </div>
              </div>
            )}
            <div className="rounded-xl border border-line p-3 flex items-center gap-2 text-sm text-ink-soft">
              <Clock className="w-4 h-4" />
              最終更新：{formatDistanceToNow(new Date(sensor.lastCommunicationDate), { addSuffix: true, locale: ja })}
            </div>
          </div>
        </div>

        {/* 下段：履歴（補助） */}
        <div className="px-5 pb-5">
          <h4 className="text-sm font-bold mb-3 text-ink-soft">過去24時間の推移</h4>
          {loading ? (
            <div className="flex items-center justify-center h-44 text-ink-soft"><Loader2 className="w-5 h-5 animate-spin mr-2" /> 読み込み中…</div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-ink-soft text-sm">履歴データがありません</div>
          ) : isBinary ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={history} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f4" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#8b9a9f' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 10, fill: '#8b9a9f' }} />
                <Tooltip />
                <Bar dataKey="value" fill={st.hex} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={history} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f4" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#8b9a9f' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#8b9a9f' }} />
                <Tooltip />
                {thresholds.max != null && <ReferenceLine y={thresholds.max} stroke="#dc2626" strokeDasharray="4 4" />}
                {thresholds.min != null && <ReferenceLine y={thresholds.min} stroke="#2563eb" strokeDasharray="4 4" />}
                <Line type="monotone" dataKey="value" stroke={st.hex} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="text-xs text-ink-soft mb-0.5">{label}</p>
      <p className="font-readout text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  )
}
