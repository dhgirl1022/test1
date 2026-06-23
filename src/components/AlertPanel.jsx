import { Bell, AlertTriangle, AlertOctagon, CheckCircle2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { statusOf } from '../lib/status'

export default function AlertPanel({ alerts }) {
  const active = alerts.filter((a) => !a.acknowledged)
  const done = alerts.filter((a) => a.acknowledged)

  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-ink-soft" />
        <h3 className="font-display font-bold">アラート</h3>
        {active.length > 0 && (
          <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-st-alert text-white rounded-full">{active.length}</span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-ink-soft">
          <CheckCircle2 className="w-10 h-10 mb-2 text-st-normal" />
          <p className="text-sm">アラートはありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {active.map((a) => <Item key={a.alertID} alert={a} />)}
          {done.length > 0 && (
            <>
              <p className="text-xs text-ink-soft pt-2 pb-1 font-bold">確認済み</p>
              {done.map((a) => <Item key={a.alertID} alert={a} dimmed />)}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Item({ alert, dimmed }) {
  const st = statusOf(alert.severity)
  const Icon = alert.severity === 'alert' ? AlertOctagon : AlertTriangle
  const when = formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true, locale: ja })
  return (
    <div className={`flex gap-3 p-3 rounded-xl border ${dimmed ? 'opacity-55' : ''}`}
      style={{ borderColor: 'var(--line)', background: dimmed ? '#fafcfc' : st.hex + '0f' }}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: dimmed ? '#94a3b8' : st.hex }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{alert.sensorName}</p>
        <p className="text-xs text-ink-soft mt-0.5">{alert.message}</p>
        <p className="text-[11px] text-ink-soft mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {when}</p>
      </div>
    </div>
  )
}
