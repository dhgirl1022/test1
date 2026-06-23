import { useRef } from 'react'
import { normalize } from '../../lib/status'

// 縦型サーモメーター。水銀が状態色で立ち上がる。
// interactive=true のとき、閾値ハンドルをドラッグして設定できる。
const VB_W = 80
const VB_H = 232
const Y_TOP = 30      // 水銀の最上端
const Y_BOT = 186     // 水銀の最下端（球の中心付近）

export default function ThermometerGauge({
  value, axis, hex = '#16a34a', thresholdMin = null, thresholdMax = null,
  width = 86, interactive = false, onThresholdChange,
}) {
  const svgRef = useRef(null)
  const t = normalize(value, axis)
  const fillTopY = Y_BOT - t * (Y_BOT - Y_TOP)
  const yOf = (v) => Y_BOT - normalize(v, axis) * (Y_BOT - Y_TOP)

  function dragHandle(which) {
    if (!interactive || !onThresholdChange) return undefined
    return (e) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture?.(e.pointerId)
      const move = (ev) => {
        const rect = svgRef.current.getBoundingClientRect()
        const vbY = ((ev.clientY - rect.top) / rect.height) * VB_H
        let v = axis.min + ((Y_BOT - vbY) / (Y_BOT - Y_TOP)) * (axis.max - axis.min)
        v = Math.round(Math.max(axis.min, Math.min(axis.max, v)))
        onThresholdChange(which, v)
      }
      const up = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    }
  }

  return (
    <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} width={width} style={{ touchAction: 'none' }}>
      <defs>
        <clipPath id={`thermo-clip-${hex.replace('#', '')}`}>
          <rect x="34" y="26" width="12" height="162" rx="6" />
          <circle cx="40" cy="196" r="18" />
        </clipPath>
        <linearGradient id="thermo-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#f1f5f6" />
          <stop offset="1" stopColor="#dfe7e9" />
        </linearGradient>
      </defs>

      {/* ガラス筐体 */}
      <rect x="30" y="22" width="20" height="176" rx="10" fill="url(#thermo-glass)" stroke="#cdd7da" strokeWidth="1.5" />
      <circle cx="40" cy="196" r="22" fill="url(#thermo-glass)" stroke="#cdd7da" strokeWidth="1.5" />

      {/* 水銀（状態色） */}
      <g clipPath={`url(#thermo-clip-${hex.replace('#', '')})`}>
        <rect x="0" y={fillTopY} width={VB_W} height={VB_H - fillTopY} fill={hex}
          style={{ transition: 'y .6s cubic-bezier(.22,.61,.36,1), height .6s cubic-bezier(.22,.61,.36,1)' }} />
        <rect x="34" y="26" width="4" height="162" fill="#ffffff" opacity="0.25" />
      </g>

      {/* 目盛り */}
      {[0, 0.25, 0.5, 0.75, 1].map((g) => {
        const y = Y_BOT - g * (Y_BOT - Y_TOP)
        return <line key={g} x1="50" y1={y} x2="55" y2={y} stroke="#aab6ba" strokeWidth="1.4" />
      })}

      {/* 閾値マーカー */}
      {thresholdMax !== null && (
        <ThresholdMark y={yOf(thresholdMax)} color="#dc2626" label="上限" value={thresholdMax} unit={axis.unit}
          interactive={interactive} onPointerDown={dragHandle('max')} />
      )}
      {thresholdMin !== null && (
        <ThresholdMark y={yOf(thresholdMin)} color="#2563eb" label="下限" value={thresholdMin} unit={axis.unit}
          interactive={interactive} onPointerDown={dragHandle('min')} />
      )}
    </svg>
  )
}

function ThresholdMark({ y, color, label, value, unit, interactive, onPointerDown }) {
  return (
    <g style={{ cursor: interactive ? 'ns-resize' : 'default' }} onPointerDown={onPointerDown}>
      <line x1="30" y1={y} x2="58" y2={y} stroke={color} strokeWidth="1.6" strokeDasharray="3 2" />
      {interactive && (
        <rect x="56" y={y - 7} width="22" height="14" rx="4" fill={color} />
      )}
      {interactive ? (
        <text x="67" y={y + 3.5} fontSize="7.5" fill="#fff" textAnchor="middle" fontWeight="700">{value}</text>
      ) : (
        <text x="60" y={y + 3} fontSize="7" fill={color} fontWeight="700">{label}</text>
      )}
    </g>
  )
}
