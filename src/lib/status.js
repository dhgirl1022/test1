// 状態の定義を一元管理。色 = 情報。
export const STATUS = {
  normal:  { label: '正常',       color: 'var(--st-normal)',  bg: 'var(--st-normal-bg)',  hex: '#16a34a' },
  warning: { label: '注意',       color: 'var(--st-warning)', bg: 'var(--st-warning-bg)', hex: '#d97706' },
  alert:   { label: '異常',       color: 'var(--st-alert)',   bg: 'var(--st-alert-bg)',   hex: '#dc2626' },
  offline: { label: 'オフライン', color: 'var(--st-offline)', bg: 'var(--st-offline-bg)', hex: '#94a3b8' },
}

export function statusOf(key) {
  return STATUS[key] || STATUS.offline
}

// 各センサー種別の表示軸（サーモメーター等の正規化に使用）
export const TYPE_AXIS = {
  TEMP: { min: 0, max: 40, unit: '°C', label: '温度' },
  HUM:  { min: 0, max: 100, unit: '%', label: '湿度' },
}

// 値を 0–1 に正規化（軸範囲でクランプ）
export function normalize(value, axis) {
  if (!axis) return 0
  const t = (value - axis.min) / (axis.max - axis.min)
  return Math.max(0, Math.min(1, t))
}
