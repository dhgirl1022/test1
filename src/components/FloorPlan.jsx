import { useState, useRef, useEffect, useCallback } from 'react'
import { Move, MousePointerClick, RotateCcw } from 'lucide-react'
import { statusOf } from '../lib/status'
import { renderVisual, readingText } from './SensorTile'

const LS_KEY = 'imonnit_floor_layout'

// ネットワークごとに帯状ゾーンへ自動配置するデフォルト座標
function defaultLayout(sensors, networks) {
  const layout = {}
  const nets = networks.length ? networks : [{ networkID: 0 }]
  nets.forEach((net, ni) => {
    const bandW = 100 / nets.length
    const inBand = sensors.filter((s) => s.networkID === net.networkID)
    const cols = Math.ceil(Math.sqrt(inBand.length)) || 1
    inBand.forEach((s, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      layout[s.sensorID] = {
        x: bandW * ni + bandW * ((col + 1) / (cols + 1)),
        y: 24 + row * 30,
      }
    })
  })
  return layout
}

export default function FloorPlan({ sensors, networks, onSensorClick }) {
  const boxRef = useRef(null)
  const [editMode, setEditMode] = useState(false)
  const [layout, setLayout] = useState({})
  const dragId = useRef(null)
  const moved = useRef(false)

  // 初期化：保存済みレイアウト or 自動配置
  useEffect(() => {
    let saved = {}
    try { saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { saved = {} }
    const base = defaultLayout(sensors, networks)
    const merged = { ...base }
    for (const id of Object.keys(saved)) if (merged[id] || sensors.find((s) => s.sensorID === id)) merged[id] = saved[id]
    setLayout(merged)
  }, [sensors, networks])

  const persist = useCallback((next) => {
    setLayout(next)
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* noop */ }
  }, [])

  function onPointerDown(e, id) {
    if (!editMode) return
    e.preventDefault()
    dragId.current = id
    moved.current = false
  }

  useEffect(() => {
    if (!editMode) return
    function move(e) {
      if (!dragId.current || !boxRef.current) return
      moved.current = true
      const rect = boxRef.current.getBoundingClientRect()
      const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
      const y = Math.max(8, Math.min(92, ((e.clientY - rect.top) / rect.height) * 100))
      setLayout((prev) => ({ ...prev, [dragId.current]: { x, y } }))
    }
    function up() {
      if (dragId.current) {
        setLayout((prev) => { try { localStorage.setItem(LS_KEY, JSON.stringify(prev)) } catch { /* noop */ } return prev })
      }
      dragId.current = null
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  }, [editMode])

  function resetLayout() {
    const base = defaultLayout(sensors, networks)
    persist(base)
  }

  return (
    <div className="panel p-4 md:p-5">
      {/* ツールバー */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div>
          <h3 className="font-display font-bold text-lg">間取りビュー</h3>
          <p className="text-xs text-ink-soft">
            {editMode ? 'センサーをドラッグして実際の設置場所に合わせて配置できます' : 'センサーをタップすると詳細を表示します'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editMode && (
            <button onClick={resetLayout} className="btn-ghost flex items-center gap-1.5 text-sm">
              <RotateCcw className="w-4 h-4" /> 初期配置
            </button>
          )}
          <button onClick={() => setEditMode((v) => !v)}
            className={editMode ? 'btn-accent flex items-center gap-1.5 text-sm' : 'btn-ghost flex items-center gap-1.5 text-sm'}>
            {editMode ? <><MousePointerClick className="w-4 h-4" /> 配置を確定</> : <><Move className="w-4 h-4" /> 配置を編集</>}
          </button>
        </div>
      </div>

      {/* 平面図キャンバス */}
      <div ref={boxRef}
        className="relative w-full rounded-2xl overflow-hidden border border-line"
        style={{
          aspectRatio: '16 / 9',
          background:
            'linear-gradient(#eef3f4, #e4eaec), ' +
            'repeating-linear-gradient(0deg, transparent 0 31px, rgba(22,40,46,.05) 31px 32px), ' +
            'repeating-linear-gradient(90deg, transparent 0 31px, rgba(22,40,46,.05) 31px 32px)',
          backgroundBlendMode: 'normal',
          touchAction: editMode ? 'none' : 'auto',
        }}>
        {/* ネットワークのゾーン */}
        {networks.map((net, ni) => {
          const bandW = 100 / networks.length
          return (
            <div key={net.networkID} className="absolute top-0 bottom-0 flex items-start justify-center"
              style={{ left: `${bandW * ni}%`, width: `${bandW}%`, borderRight: ni < networks.length - 1 ? '2px dashed rgba(22,40,46,.14)' : 'none' }}>
              <span className="mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/70 text-ink-soft border border-line">
                {net.networkName}
              </span>
            </div>
          )
        })}

        {/* センサーのピン */}
        {sensors.map((s) => {
          const pos = layout[s.sensorID] || { x: 50, y: 50 }
          const st = statusOf(s.status)
          return (
            <button key={s.sensorID}
              onPointerDown={(e) => onPointerDown(e, s.sensorID)}
              onClick={() => { if (!editMode || !moved.current) onSensorClick(s) }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, cursor: editMode ? 'grab' : 'pointer' }}>
              <div className="flex flex-col items-center">
                <div className={`relative rounded-2xl bg-white shadow-md border-2 p-1.5 ${s.status === 'alert' ? 'anim-alert-glow' : ''} group-hover:shadow-lg transition-shadow`}
                  style={{ borderColor: st.color }}>
                  <div className="flex items-center justify-center" style={{ width: 64, height: 64 }}>
                    {renderVisual(s, st.hex, { thermo: 30, ring: 60, door: 46, radar: 58, water: 62 })}
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                    style={{ background: st.color }} />
                </div>
                <span className="mt-1 max-w-[92px] truncate text-[11px] font-bold bg-white/85 px-1.5 py-0.5 rounded-md border border-line">
                  {s.sensorName}
                </span>
                <span className="text-[10px] font-readout font-semibold" style={{ color: st.color }}>
                  {readingText(s)}
                </span>
              </div>
            </button>
          )
        })}

        {sensors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-ink-soft text-sm">
            表示するセンサーがありません
          </div>
        )}
      </div>
    </div>
  )
}
