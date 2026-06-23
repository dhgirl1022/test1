// ドア／窓センサー。開いているとドアが実際に手前へ開く（CSS 3D）。
export default function DoorVisual({ open, hex = '#16a34a', width = 130 }) {
  const h = width * 1.18
  return (
    <div style={{ width, height: h, perspective: 520 }} className="relative mx-auto select-none">
      {/* 戸口（奥） */}
      <div className="absolute inset-0 rounded-lg"
        style={{ background: open ? 'radial-gradient(ellipse at 70% 50%, #fde68a 0%, #1f2d33 75%)' : '#1f2d33' }} />
      {/* 床の光 */}
      {open && (
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 14, background: 'linear-gradient(#fde68a, transparent)', opacity: 0.5 }} />
      )}
      {/* ドア本体 */}
      <div className="absolute inset-0 rounded-lg border-2"
        style={{
          transformOrigin: 'left center',
          transform: open ? 'rotateY(-62deg)' : 'rotateY(0deg)',
          transition: 'transform .7s cubic-bezier(.34,1.1,.4,1)',
          background: 'linear-gradient(135deg, #f3f6f7, #dde6e8)',
          borderColor: hex,
          boxShadow: open ? '12px 0 22px rgba(22,40,46,.25)' : 'none',
        }}>
        {/* 木目パネル */}
        <div className="absolute rounded" style={{ inset: '14% 22% 50% 22%', border: '2px solid rgba(22,40,46,.12)' }} />
        <div className="absolute rounded" style={{ inset: '54% 22% 14% 22%', border: '2px solid rgba(22,40,46,.12)' }} />
        {/* ノブ */}
        <div className="absolute rounded-full" style={{ width: 9, height: 9, right: '12%', top: '50%', transform: 'translateY(-50%)', background: hex }} />
      </div>
    </div>
  )
}
