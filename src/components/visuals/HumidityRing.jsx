// 円形リングゲージ + 中央の水滴が水位まで満ちる。
export default function HumidityRing({ value, hex = '#16a34a', width = 150 }) {
  const pct = Math.max(0, Math.min(100, value))
  const R = 80
  const C = 2 * Math.PI * R
  const sweep = 0.75            // 270°
  const dash = C * sweep
  const filled = dash * (pct / 100)
  const uid = hex.replace('#', '')

  // 中央水滴の水位（dropの内部 y 範囲: 約 78〜150）
  const dropTop = 78, dropBot = 150
  const waterY = dropBot - (pct / 100) * (dropBot - dropTop)

  return (
    <svg viewBox="0 0 200 200" width={width}>
      <defs>
        <clipPath id={`drop-${uid}`}>
          <path d="M100 70 C118 96 132 116 132 134 a32 32 0 1 1 -64 0 C68 116 82 96 100 70 Z" />
        </clipPath>
      </defs>

      {/* トラック */}
      <circle cx="100" cy="100" r={R} fill="none" stroke="#e2e8ea" strokeWidth="14"
        strokeLinecap="round" strokeDasharray={`${dash} ${C}`}
        transform="rotate(135 100 100)" />
      {/* 値アーク */}
      <circle cx="100" cy="100" r={R} fill="none" stroke={hex} strokeWidth="14"
        strokeLinecap="round" strokeDasharray={`${filled} ${C}`}
        transform="rotate(135 100 100)"
        style={{ transition: 'stroke-dasharray .7s cubic-bezier(.22,.61,.36,1)' }} />

      {/* 中央の水滴 */}
      <path d="M100 70 C118 96 132 116 132 134 a32 32 0 1 1 -64 0 C68 116 82 96 100 70 Z"
        fill="#eef4f6" stroke="#cfdbde" strokeWidth="2" />
      <g clipPath={`url(#drop-${uid})`}>
        <rect x="60" y={waterY} width="80" height="100" fill={hex} opacity="0.85"
          style={{ transition: 'y .7s cubic-bezier(.22,.61,.36,1)' }} />
        {/* 波（横方向にゆっくり流れる。周期60で-60平行移動しシームレス） */}
        <g>
          <animateTransform attributeName="transform" type="translate" from="0 0" to="-60 0" dur="3.5s" repeatCount="indefinite" />
          <path d={`M40 ${waterY} q15 -7 30 0 t30 0 t30 0 t30 0 t30 0 v60 h-180 Z`} fill={hex} opacity="0.5" />
        </g>
      </g>

      {/* 読み取り値 */}
      <text x="100" y="106" textAnchor="middle" className="font-readout" fontSize="40" fontWeight="600" fill="var(--text)">{Math.round(pct)}</text>
      <text x="100" y="126" textAnchor="middle" fontSize="13" fill="var(--text-soft)">%</text>
    </svg>
  )
}
