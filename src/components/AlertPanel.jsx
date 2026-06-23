import { Bell, AlertTriangle, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function AlertPanel({ alerts }) {
  const active = alerts.filter((a) => !a.acknowledged)
  const acknowledged = alerts.filter((a) => a.acknowledged)

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-800">アラート</h3>
        {active.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
            {active.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <CheckCircle className="w-10 h-10 mb-2 text-green-400" />
          <p className="text-sm">アラートはありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {active.map((alert) => (
            <AlertItem key={alert.alertID} alert={alert} />
          ))}
          {acknowledged.length > 0 && (
            <>
              <p className="text-xs text-gray-400 pt-2 pb-1 font-medium">確認済み</p>
              {acknowledged.map((alert) => (
                <AlertItem key={alert.alertID} alert={alert} dimmed />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function AlertItem({ alert, dimmed }) {
  const isAlert = alert.severity === 'alert'
  const lastSeen = formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true, locale: ja })

  return (
    <div className={`flex gap-3 p-3 rounded-lg border ${
      dimmed ? 'bg-gray-50 border-gray-100 opacity-60' :
      isAlert ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
    }`}>
      {isAlert
        ? <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${dimmed ? 'text-gray-400' : 'text-red-500'}`} />
        : <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${dimmed ? 'text-gray-400' : 'text-yellow-500'}`} />
      }
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${dimmed ? 'text-gray-500' : 'text-gray-800'}`}>
          {alert.sensorName}
        </p>
        <p className={`text-xs mt-0.5 ${dimmed ? 'text-gray-400' : 'text-gray-600'}`}>
          {alert.message}
        </p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {lastSeen}
        </p>
      </div>
    </div>
  )
}
