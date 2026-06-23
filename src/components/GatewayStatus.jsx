import { Router, Wifi, WifiOff, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function GatewayStatus({ gateways, networks }) {
  const netMap = Object.fromEntries(networks.map((n) => [n.networkID, n.networkName]))

  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Router className="w-4 h-4 text-ink-soft" />
        <h3 className="font-display font-bold">ゲートウェイ</h3>
        <span className="ml-auto text-xs text-ink-soft">{gateways.length} 台</span>
      </div>
      <div className="space-y-3">
        {gateways.map((gw) => {
          const online = gw.status === 1
          const when = formatDistanceToNow(new Date(gw.lastCommunicationDate), { addSuffix: true, locale: ja })
          return (
            <div key={gw.gatewayID} className="flex items-center gap-3 p-3 rounded-xl border border-line bg-[#fafcfc]">
              <span className="grid place-items-center w-10 h-10 rounded-xl"
                style={{ background: online ? 'var(--st-normal-bg)' : 'var(--st-alert-bg)', color: online ? 'var(--st-normal)' : 'var(--st-alert)' }}>
                {online ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{gw.gatewayName}</p>
                <p className="text-xs text-ink-soft">{netMap[gw.networkID] || `ネットワーク ${gw.networkID}`}・FW {gw.firmwareVersion}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`chip ${online ? 'chip-normal' : 'chip-alert'}`}>{online ? 'オンライン' : 'オフライン'}</span>
                <p className="text-[11px] text-ink-soft mt-1 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> {when}</p>
              </div>
            </div>
          )
        })}
        {gateways.length === 0 && <p className="text-sm text-ink-soft text-center py-6">ゲートウェイが見つかりません</p>}
      </div>
    </div>
  )
}
