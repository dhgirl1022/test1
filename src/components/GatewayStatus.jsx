import { Router, Wifi, WifiOff, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function GatewayStatus({ gateways, networks }) {
  const networkMap = Object.fromEntries(networks.map((n) => [n.networkID, n.networkName]))

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Router className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-800">ゲートウェイ状態</h3>
        <span className="ml-auto text-xs text-gray-400">{gateways.length} 台</span>
      </div>
      <div className="space-y-3">
        {gateways.map((gw) => {
          const isOnline = gw.status === 1
          const lastSeen = formatDistanceToNow(new Date(gw.lastCommunicationDate), {
            addSuffix: true,
            locale: ja,
          })
          return (
            <div key={gw.gatewayID} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{gw.gatewayName}</p>
                <p className="text-xs text-gray-500">{networkMap[gw.networkID] || `ネットワーク ${gw.networkID}`}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isOnline ? 'status-normal' : 'status-alert'}`}>
                  {isOnline ? 'オンライン' : 'オフライン'}
                </span>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" />
                  {lastSeen}
                </p>
              </div>
            </div>
          )
        })}
        {gateways.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">ゲートウェイが見つかりません</p>
        )}
      </div>
    </div>
  )
}
