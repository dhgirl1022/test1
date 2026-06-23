// 漏水センサー。検知時は水位が上がり波打つ。
export default function WaterLevel({ wet, hex = '#16a34a', width = 140 }) {
  const blue = '#2f74d0'
  const surfY = wet ? 58 : 104   // 水面の高さ（小さいほど高い）
  const fill = wet ? blue : '#e2e8ea'
  return (
    <svg viewBox="0 0 140 120" width={width}>
      <defs>
        <clipPath id="tray-clip">
          <path d="M16 40 h108 a6 6 0 0 1 6 6 v54 a8 8 0 0 1 -8 8 H18 a8 8 0 0 1 -8 -8 V46 a6 6 0 0 1 6 -6 Z" />
        </clipPath>
      </defs>

      {/* トレイ筐体 */}
      <path d="M16 40 h108 a6 6 0 0 1 6 6 v54 a8 8 0 0 1 -8 8 H18 a8 8 0 0 1 -8 -8 V46 a6 6 0 0 1 6 -6 Z"
        fill="#f1f5f6" stroke="#cdd7da" strokeWidth="2" />

      {/* 水 */}
      <g clipPath="url(#tray-clip)">
        <rect x="0" y={surfY} width="140" height="120" fill={fill}
          style={{ transition: 'y .7s cubic-bezier(.22,.61,.36,1)' }} />
        {wet && (
          <g>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="-60 0" dur="3s" repeatCount="indefinite" />
            <path d={`M-40 ${surfY} q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 v80 h-220 Z`} fill={blue} opacity="0.55" />
          </g>
        )}
      </g>

      {/* センサー本体（プローブ） */}
      <rect x="60" y="20" width="20" height="28" rx="4" fill="#20383f" />
      <rect x="64" y="46" width="3" height="18" fill="#20383f" />
      <rect x="73" y="46" width="3" height="18" fill="#20383f" />

      {/* 状態ラベル */}
      <text x="70" y="100" textAnchor="middle" fontSize="13" fontWeight="700"
        fill={wet ? '#fff' : 'var(--text-soft)'}>
        {wet ? '漏水' : '乾燥'}
      </text>
    </svg>
  )
}
