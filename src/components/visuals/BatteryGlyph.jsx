// 電池残量グリフ。残量で色が変わる。
export default function BatteryGlyph({ level, showLabel = true }) {
  const lv = Math.max(0, Math.min(100, level))
  const color = lv > 50 ? '#16a34a' : lv > 20 ? '#d97706' : '#dc2626'
  return (
    <span className="inline-flex items-center gap-1.5" title={`電池残量 ${lv}%`}>
      <svg viewBox="0 0 30 16" width="26" aria-hidden="true">
        <rect x="1" y="2" width="24" height="12" rx="3" fill="none" stroke="#aab6ba" strokeWidth="1.5" />
        <rect x="26" y="5.5" width="3" height="5" rx="1" fill="#aab6ba" />
        <rect x="3" y="4" width={Math.max(2, (lv / 100) * 20)} height="8" rx="1.5" fill={color}
          style={{ transition: 'width .5s' }} />
      </svg>
      {showLabel && <span className="text-xs font-readout" style={{ color }}>{lv}%</span>}
    </span>
  )
}
