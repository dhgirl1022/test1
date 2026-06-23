import axios from 'axios'
import { mockSensors, mockNetworks, mockGateways, mockAlerts } from '../data/mockData'

const STORAGE_KEY = 'imonnit_credentials'

export function saveCredentials(apiKeyId, apiSecretKey) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKeyId, apiSecretKey }))
}

export function loadCredentials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearCredentials() {
  localStorage.removeItem(STORAGE_KEY)
}

function createClient(apiKeyId, apiSecretKey) {
  return axios.create({
    baseURL: '/api',
    headers: {
      APIKeyID: apiKeyId,
      APISecretKey: apiSecretKey,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  })
}

async function apiPost(client, endpoint, params = {}) {
  const response = await client.post(`/${endpoint}`, params)
  if (response.data?.Result === 'SUCCESS') {
    return response.data.payload
  }
  throw new Error(response.data?.ErrorMessage || 'APIエラーが発生しました')
}

// --- Public API ---

export async function testConnection(apiKeyId, apiSecretKey) {
  const client = createClient(apiKeyId, apiSecretKey)
  await apiPost(client, 'NetworkList')
}

export async function getNetworks(apiKeyId, apiSecretKey, testMode) {
  if (testMode) return mockNetworks
  const client = createClient(apiKeyId, apiSecretKey)
  return await apiPost(client, 'NetworkList')
}

export async function getGateways(apiKeyId, apiSecretKey, testMode) {
  if (testMode) return mockGateways
  const client = createClient(apiKeyId, apiSecretKey)
  return await apiPost(client, 'GatewayList')
}

export async function getSensors(apiKeyId, apiSecretKey, testMode) {
  if (testMode) return mockSensors
  const client = createClient(apiKeyId, apiSecretKey)
  const raw = await apiPost(client, 'SensorList')
  return (raw || []).map((s) => ({
    sensorID: s.SensorID,
    sensorName: s.SensorName,
    networkID: s.NetworkID,
    gatewayID: s.GatewayID,
    sensorType: s.SensorType,
    typeCode: s.SensorType,
    unit: s.MeasurementUnit || '',
    currentReading: s.LastDataReadingValue,
    batteryLevel: s.BatteryLevel,
    signalStrength: s.SignalStrength,
    status: mapStatus(s.AlertStateID),
    lastCommunicationDate: s.LastCommunicationDate,
    thresholdMin: s.MinimumThreshold,
    thresholdMax: s.MaximumThreshold,
    history: [],
  }))
}

export async function getSensorHistory(apiKeyId, apiSecretKey, sensorId, testMode) {
  if (testMode) {
    const sensor = mockSensors.find((s) => s.sensorID === sensorId)
    return sensor?.history || []
  }
  const client = createClient(apiKeyId, apiSecretKey)
  const raw = await apiPost(client, 'SensorDataMessages', {
    sensorID: sensorId,
    lastCount: 48,
  })
  return (raw || []).map((d) => ({
    time: new Date(d.MessageDate).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    value: parseFloat(d.DataValue),
  }))
}

export async function getAlerts(apiKeyId, apiSecretKey, testMode) {
  if (testMode) return mockAlerts
  const client = createClient(apiKeyId, apiSecretKey)
  try {
    return await apiPost(client, 'SensorAlertList')
  } catch {
    return []
  }
}

function mapStatus(alertStateID) {
  switch (alertStateID) {
    case 0: return 'normal'
    case 1: return 'warning'
    case 2: return 'alert'
    case 3: return 'offline'
    default: return 'normal'
  }
}
