const SAVE_KEY = 'fishing_game_save_v1';
const SAVE_VERSION = 1;

const buildDefaultSaveState = () => ({
  version: SAVE_VERSION,
  selectedLocationId: null,
  stats: {
    attempts: 0,
    catches: 0,
    fails: 0,
  },
  catchLog: [],
});

const toSafeNumber = (value) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value < 0) {
    return 0;
  }

  return Math.floor(value);
};

const normalizeSaveState = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (payload.version !== SAVE_VERSION) {
    return null;
  }

  const selectedLocationId =
    typeof payload.selectedLocationId === 'string'
      ? payload.selectedLocationId
      : null;
  const catchLog = Array.isArray(payload.catchLog)
    ? payload.catchLog.filter((item) => item && typeof item === 'object')
    : [];

  return {
    version: SAVE_VERSION,
    selectedLocationId,
    stats: {
      attempts: toSafeNumber(payload.stats?.attempts),
      catches: toSafeNumber(payload.stats?.catches),
      fails: toSafeNumber(payload.stats?.fails),
    },
    catchLog,
  };
};

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const load = () => {
  const storage = getStorage();
  if (!storage) {
    return buildDefaultSaveState();
  }

  const raw = storage.getItem(SAVE_KEY);
  if (!raw) {
    return buildDefaultSaveState();
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeSaveState(parsed);
    return normalized || buildDefaultSaveState();
  } catch {
    return buildDefaultSaveState();
  }
};

const save = (payload) => {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  const normalized = normalizeSaveState(payload);
  if (!normalized) {
    return false;
  }

  try {
    storage.setItem(SAVE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
};

const clear = () => {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
};

export { SAVE_KEY, SAVE_VERSION, buildDefaultSaveState, load, save, clear };
