import { ShieldCheck, AlertTriangle, AlertOctagon, WifiOff } from 'lucide-react'
import { STATUS } from '../lib/status'

// 現場全体の状態を一目で伝えるヒーロー。
// ステータス比率のドーナツ + 最も深刻な状態の言葉 + 内訳ピル。
export default function SiteHealthHero({ counts, total, topAlert, activeFilter, onFilter }) {
  const order = ['normal', 'warning', 'alert', 'offline']
  const worst = counts.alert > 0 ? 'alert'
    : counts.warning > 0 ? 'warning'
    : counts.offline > 0 && counts.normal === 0 ? 'offline'
    : 'normal'

  const need = counts.alert + counts.warning
  const headline = worst === 'alert' ? '対応が必要です'
    : worst === 'warning' ? '注意してください'
    : worst === 'offline' ? '接続を確認' : 'すべて正常です'
  const sub = need > 0
    ? `${need} 件のセンサーが基準を外れています`
    : `${total} 台すべてが正常に稼働しています`
  const WorstIcon = worst === 'alert' ? AlertOctagon : worst === 'warning' ? AlertTriangle : worst === 'offline' ? WifiOff : ShieldCheck

  // ドーナツ
  const R = 52, C = 2 * Math.PI * R
  let offset = 0
  const segs = order.map((k) => {
    const frac = total ? counts[k] / total : 0
    const seg = { k, len: C * frac, off: offset }
    offset += C * frac
    return seg
  })

  return (
    <div className="panel p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* エンブレム */}
        <div className="relative shrink-0 mx-auto md:mx-0" style={{ width: 132, height: 132 }}>
          <svg viewBox="0 0 132 132" width="132" height="132">
            <circle cx="66" cy="66" r={R} fill="none" stroke="#eef2f4" strokeWidth="14" />
            {total > 0 && segs.map((s) => s.len > 0 && (
              <circle key={s.k} cx="66" cy="66" r={R} fill="none"
                stroke={STATUS[s.k].hex} strokeWidth="14" strokeLinecap="butt"
                strokeDasharray={`${Math.max(0, s.len - 1)} ${C}`}
                strokeDashoffset={-s.off}
                transform="rotate(-90 66 66)"
                style={{ transition: 'stroke-dasharray .6s, stroke-dashoffset .6s' }} />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-readout text-3xl font-bold" style={{ color: STATUS[worst].hex }}>{total}</span>
            <span className="text-[11px] text-ink-soft">センサー</span>
          </div>
        </div>

        {/* 見出し */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 mb-1" style={{ color: STATUS[worst].hex }}>
            <WorstIcon className="w-5 h-5" />
            <span className="text-xs font-bold tracking-wide">現場の状態</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">{headline}</h2>
          <p className="text-ink-soft text-sm mt-1">{sub}</p>
          {topAlert && (
            <div className="mt-3 inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2"
              style={{ background: STATUS[topAlert.severity].hex + '14', color: STATUS[topAlert.severity].hex }}>
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span className="font-medium">{topAlert.sensorName}：</span>
              <span className="text-ink truncate max-w-[42ch]">{topAlert.message}</span>
            </div>
          )}
        </div>

        {/* 内訳ピル（クリックで絞り込み） */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 shrink-0">
          {order.map((k) => (
            <button key={k} onClick={() => onFilter(activeFilter === k ? 'all' : k)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                activeFilter === k ? 'border-accent ring-1 ring-accent' : 'border-line hover:bg-[#f3f6f7]'
              }`}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS[k].hex }} />
              <span className="text-sm text-ink-soft">{STATUS[k].label}</span>
              <span className="font-readout text-lg font-bold ml-auto" style={{ color: STATUS[k].hex }}>{counts[k]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
