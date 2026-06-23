// 動体センサー。検知時はパルスが広がり、レーダーが回転する。
export default function MotionRadar({ active, hex = '#16a34a', width = 130 }) {
  const uid = hex.replace('#', '')
  return (
    <svg viewBox="0 0 120 120" width={width}>
      <defs>
        <radialGradient id={`radar-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={hex} stopOpacity="0.55" />
          <stop offset="100%" stopColor={hex} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 同心円 */}
      {[18, 34, 50].map((r) => (
        <circle key={r} cx="60" cy="60" r={r} fill="none" stroke={hex}
          strokeWidth="1.5" opacity={active ? 0.35 : 0.16} />
      ))}

      {/* 拡散パルス（検知時） */}
      {active && [0, 0.7, 1.4].map((d) => (
        <circle key={d} cx="60" cy="60" r="20" fill="none" stroke={hex} strokeWidth="2.5"
          style={{ transformOrigin: '60px 60px', animation: `pulse-ring 2.1s ${d}s ease-out infinite` }} />
      ))}

      {/* 回転スイープ（検知時） */}
      {active && (
        <g style={{ transformOrigin: '60px 60px', animation: 'radar-sweep 2.4s linear infinite' }}>
          <path d="M60 60 L60 8 A52 52 0 0 1 104 40 Z" fill={`url(#radar-${uid})`} />
        </g>
      )}

      {/* 中心 */}
      <circle cx="60" cy="60" r={active ? 9 : 7} fill={hex}
        className={active ? 'anim-alert-glow' : ''} />
      <circle cx="60" cy="60" r="3.2" fill="#fff" opacity="0.85" />
    </svg>
  )
}
