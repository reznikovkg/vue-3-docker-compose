const SAVE_KEY = 'fishing_game_save_v1'
const SAVE_VERSION = 1
const DEFAULT_ROD_ID = 'default-rod'

const buildDefaultSaveState = () => ({
  version: SAVE_VERSION,
  selectedLocationId: null,
  currentRodId: DEFAULT_ROD_ID,
  money: 0,
  stats: {
    attempts: 0,
    catches: 0,
    fails: 0,
  },
  catchLog: [],
  inventoryFish: [],
})

const toSafeNumber = (value) => {
  if (!Number.isFinite(value)) {
    return 0
  }

  if (value < 0) {
    return 0
  }

  return Math.floor(value)
}

const toSafeFloat = (value) => {
  if (!Number.isFinite(value)) {
    return 0
  }

  if (value < 0) {
    return 0
  }

  return Number(value.toFixed(2))
}

const normalizeFishInventoryEntry = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  if (typeof payload.id !== 'string' || !payload.id) {
    return null
  }

  if (typeof payload.fishId !== 'string' || !payload.fishId) {
    return null
  }

  return {
    id: payload.id,
    fishId: payload.fishId,
    fishName:
      typeof payload.fishName === 'string' ? payload.fishName : payload.fishId,
    tier: toSafeNumber(payload.tier),
    size: toSafeFloat(payload.size),
    quality: toSafeFloat(payload.quality),
    sellPrice: toSafeNumber(payload.sellPrice),
    caughtAt: toSafeNumber(payload.caughtAt),
  }
}

const normalizeSaveState = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  if (payload.version !== SAVE_VERSION) {
    return null
  }

  const selectedLocationId =
    typeof payload.selectedLocationId === 'string'
      ? payload.selectedLocationId
      : null
  const currentRodId =
    typeof payload.currentRodId === 'string'
      ? payload.currentRodId
      : DEFAULT_ROD_ID
  const catchLog = Array.isArray(payload.catchLog)
    ? payload.catchLog.filter((item) => item && typeof item === 'object')
    : []
  const inventoryFish = Array.isArray(payload.inventoryFish)
    ? payload.inventoryFish
        .map((item) => normalizeFishInventoryEntry(item))
        .filter((item) => Boolean(item))
    : []

  return {
    version: SAVE_VERSION,
    selectedLocationId,
    currentRodId,
    money: toSafeNumber(payload.money),
    stats: {
      attempts: toSafeNumber(payload.stats?.attempts),
      catches: toSafeNumber(payload.stats?.catches),
      fails: toSafeNumber(payload.stats?.fails),
    },
    catchLog,
    inventoryFish,
  }
}

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

const load = () => {
  const storage = getStorage()
  if (!storage) {
    return buildDefaultSaveState()
  }

  const raw = storage.getItem(SAVE_KEY)
  if (!raw) {
    return buildDefaultSaveState()
  }

  try {
    const parsed = JSON.parse(raw)
    const normalized = normalizeSaveState(parsed)
    return normalized || buildDefaultSaveState()
  } catch {
    return buildDefaultSaveState()
  }
}

const save = (payload) => {
  const storage = getStorage()
  if (!storage) {
    return false
  }

  const normalized = normalizeSaveState(payload)
  if (!normalized) {
    return false
  }

  try {
    storage.setItem(SAVE_KEY, JSON.stringify(normalized))
    return true
  } catch {
    return false
  }
}

const clear = () => {
  const storage = getStorage()
  if (!storage) {
    return false
  }

  try {
    storage.removeItem(SAVE_KEY)
    return true
  } catch {
    return false
  }
}

export { SAVE_KEY, SAVE_VERSION, buildDefaultSaveState, load, save, clear }
