const SAVE_KEY = 'fishing_game_save_v1'
const SAVE_VERSION = 5
const DEFAULT_ROD_ID = 'spinning'
const DEFAULT_LINE_ID = 'monofilament'
const DEFAULT_BAIT_ID = 'worm'

const buildDefaultSaveState = () => ({
  version: SAVE_VERSION,
  selectedLocationId: null,
  currentRodId: DEFAULT_ROD_ID,
  currentLineId: DEFAULT_LINE_ID,
  currentBaitId: DEFAULT_BAIT_ID,
  currentLandingNetId: null,
  money: 0,
  stats: {
    attempts: 0,
    catches: 0,
    fails: 0,
  },
  catchLog: [],
  inventoryFish: [],
  inventoryRods: {},
  inventoryLines: {},
  inventoryBait: {},
  inventoryGroundbait: {},
  inventoryLandingNets: {},
  boostedLocationId: null,
  boostedCastsRemaining: 0,
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

const normalizeInventoryMap = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return {}
  }

  return Object.entries(payload).reduce((result, [id, value]) => {
    if (typeof id !== 'string' || !id) {
      return result
    }

    const count = toSafeNumber(value)
    if (!count) {
      return result
    }

    return {
      ...result,
      [id]: count,
    }
  }, {})
}

const normalizeSaveStateV4 = (payload) => {
  const selectedLocationId =
    typeof payload.selectedLocationId === 'string'
      ? payload.selectedLocationId
      : null
  const savedRodId =
    typeof payload.currentRodId === 'string'
      ? payload.currentRodId
      : DEFAULT_ROD_ID
  const currentRodId =
    savedRodId === 'default-rod' ? DEFAULT_ROD_ID : savedRodId
  const currentLineId =
    typeof payload.currentLineId === 'string'
      ? payload.currentLineId
      : DEFAULT_LINE_ID
  const currentBaitId =
    typeof payload.currentBaitId === 'string'
      ? payload.currentBaitId
      : DEFAULT_BAIT_ID
  const currentLandingNetId =
    typeof payload.currentLandingNetId === 'string'
      ? payload.currentLandingNetId
      : null
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
    currentLineId,
    currentBaitId,
    currentLandingNetId,
    money: toSafeNumber(payload.money),
    stats: {
      attempts: toSafeNumber(payload.stats?.attempts),
      catches: toSafeNumber(payload.stats?.catches),
      fails: toSafeNumber(payload.stats?.fails),
    },
    catchLog,
    inventoryFish,
    inventoryRods: normalizeInventoryMap(payload.inventoryRods),
    inventoryLines: normalizeInventoryMap(payload.inventoryLines),
    inventoryBait: normalizeInventoryMap(payload.inventoryBait),
    inventoryGroundbait: normalizeInventoryMap(payload.inventoryGroundbait),
    inventoryLandingNets: normalizeInventoryMap(payload.inventoryLandingNets),
    boostedLocationId:
      typeof payload.boostedLocationId === 'string'
        ? payload.boostedLocationId
        : null,
    boostedCastsRemaining: toSafeNumber(payload.boostedCastsRemaining),
  }
}

const normalizeSaveStateV3 = (payload) => {
  const v4State = normalizeSaveStateV4(payload)
  return {
    ...v4State,
    inventoryGroundbait: {},
    inventoryLandingNets: {},
    currentLandingNetId: null,
  }
}

const normalizeSaveStateV4AsV5 = (payload) => {
  const v5State = normalizeSaveStateV4(payload)
  return {
    ...v5State,
    inventoryLandingNets: {},
    currentLandingNetId: null,
  }
}

const normalizeSaveState = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  if (payload.version === SAVE_VERSION) {
    return normalizeSaveStateV4(payload)
  }

  if (payload.version === 3) {
    return normalizeSaveStateV3(payload)
  }

  if (payload.version === 4) {
    return normalizeSaveStateV4AsV5(payload)
  }

  return null
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
