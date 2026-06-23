import { Network, ChevronRight } from 'lucide-react'

export default function NetworkList({ networks, sensors, activeNetwork, onSelect }) {
  function countByStatus(networkId, status) {
    return sensors.filter((s) => s.networkID === networkId && s.status === status).length
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-800">ネットワーク</h3>
      </div>
      <div className="space-y-2">
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
            activeNetwork === null
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">すべてのネットワーク</p>
            <p className="text-xs text-gray-500">{sensors.length} センサー</p>
          </div>
          <ChevronRight className="w-4 h-4 opacity-40" />
        </button>

        {networks.map((network) => {
          const total = sensors.filter((s) => s.networkID === network.networkID).length
          const alertCount = countByStatus(network.networkID, 'alert') + countByStatus(network.networkID, 'warning')
          return (
            <button
              key={network.networkID}
              onClick={() => onSelect(network.networkID)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                activeNetwork === network.networkID
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{network.networkName}</p>
                  {alertCount > 0 && (
                    <span className="flex-shrink-0 text-xs font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5">
                      {alertCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{network.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{total} センサー</p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40 flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
