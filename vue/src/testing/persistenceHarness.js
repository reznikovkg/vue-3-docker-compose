import {
  SAVE_KEY,
  SAVE_VERSION,
  buildDefaultSaveState,
} from '@/services/saveStorage';

const TEST_CASES = Object.freeze([
  {
    id: 'save-location',
    label: 'Save selected location',
    description: 'Select location and verify it is persisted.',
    expected: Object.freeze([
      'Store selectedLocationId matches selected location.',
      `Storage key ${SAVE_KEY} contains same selectedLocationId.`,
    ]),
  },
  {
    id: 'save-catch',
    label: 'Save catch result',
    description: 'Record catch and verify stats/log are persisted.',
    expected: Object.freeze([
      'Store attempts and catches increment by 1.',
      'Storage stats match store stats after catch.',
      'Storage catchLog contains latest catch record.',
    ]),
  },
  {
    id: 'save-fail',
    label: 'Save fail result',
    description: 'Record fail and verify stats/log are persisted.',
    expected: Object.freeze([
      'Store attempts and fails increment by 1.',
      'Storage stats match store stats after fail.',
      'Storage catchLog contains latest fail record.',
    ]),
  },
  {
    id: 'load-valid',
    label: 'Load valid snapshot',
    description: 'Inject valid payload and bootstrap store from it.',
    expected: Object.freeze([
      'Store progress equals injected payload.',
      'Session active location equals selectedLocationId.',
    ]),
  },
  {
    id: 'load-corrupt',
    label: 'Load corrupt snapshot',
    description: 'Inject invalid JSON and verify fallback to defaults.',
    expected: Object.freeze([
      'Store progress resets to defaults.',
      'No runtime crash while bootstrapping.',
    ]),
  },
  {
    id: 'load-wrong-version',
    label: 'Load wrong version',
    description: 'Inject mismatched version and verify fallback.',
    expected: Object.freeze([
      'Store progress resets to defaults.',
      'Version mismatch payload is ignored.',
    ]),
  },
  {
    id: 'clear-reset',
    label: 'Clear and reset',
    description: 'Reset progress and verify storage key is removed.',
    expected: Object.freeze([
      'Store progress resets to defaults.',
      `Storage key ${SAVE_KEY} is removed.`,
    ]),
  },
]);

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

const readStorageRaw = (saveKey = SAVE_KEY) => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return storage.getItem(saveKey);
};

const readStorageParsed = (saveKey = SAVE_KEY) => {
  const raw = readStorageRaw(saveKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const buildProgressSnapshot = (store) => ({
  storeProgress: {
    selectedLocationId: store.state.progress.selectedLocationId,
    stats: {
      attempts: store.state.progress.stats.attempts,
      catches: store.state.progress.stats.catches,
      fails: store.state.progress.stats.fails,
    },
    catchLog: store.state.progress.catchLog.map((item) => ({ ...item })),
  },
  storageRaw: readStorageRaw(),
  storageParsed: readStorageParsed(),
});

const getFirstLocationId = (store) => {
  const locations = store.getters['content/getLocations'] || [];
  return locations.length ? locations[0].id : null;
};

const buildResult = (testCase, pass, messages, snapshot) => ({
  id: testCase.id,
  label: testCase.label,
  pass,
  expected: testCase.expected,
  messages,
  snapshot,
});

const writeRawStorage = (rawValue) => {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(SAVE_KEY, rawValue);
    return true;
  } catch {
    return false;
  }
};

const runSaveLocationCase = (store, testCase) => {
  const locationId = getFirstLocationId(store);
  if (!locationId) {
    return buildResult(
      testCase,
      false,
      ['No locations available.'],
      buildProgressSnapshot(store),
    );
  }

  store.dispatch('progress/selectLocation', locationId);
  const snapshot = buildProgressSnapshot(store);
  const persistedLocationId =
    snapshot.storageParsed?.selectedLocationId || null;
  const pass =
    snapshot.storeProgress.selectedLocationId === locationId &&
    persistedLocationId === locationId;

  return buildResult(
    testCase,
    pass,
    [
      `selectedLocationId in store: ${snapshot.storeProgress.selectedLocationId || 'null'}`,
      `selectedLocationId in storage: ${persistedLocationId || 'null'}`,
    ],
    snapshot,
  );
};

const runSaveCatchCase = (store, testCase) => {
  const locationId = getFirstLocationId(store);
  if (!locationId) {
    return buildResult(
      testCase,
      false,
      ['No locations available.'],
      buildProgressSnapshot(store),
    );
  }

  const before = buildProgressSnapshot(store);
  store.dispatch('progress/selectLocation', locationId);
  store.dispatch('progress/recordCatch', {
    locationId,
    fishId: 'debug-catch',
    fishName: 'Debug Catch',
  });
  const snapshot = buildProgressSnapshot(store);

  const attemptsDelta =
    snapshot.storeProgress.stats.attempts - before.storeProgress.stats.attempts;
  const catchesDelta =
    snapshot.storeProgress.stats.catches - before.storeProgress.stats.catches;
  const storageStats = snapshot.storageParsed?.stats;
  const latestLog = snapshot.storageParsed?.catchLog?.[0];
  const pass =
    attemptsDelta === 1 &&
    catchesDelta === 1 &&
    storageStats?.attempts === snapshot.storeProgress.stats.attempts &&
    storageStats?.catches === snapshot.storeProgress.stats.catches &&
    latestLog?.result === 'caught';

  return buildResult(
    testCase,
    pass,
    [
      `attempts delta: ${attemptsDelta}`,
      `catches delta: ${catchesDelta}`,
      `latest storage log result: ${latestLog?.result || 'none'}`,
    ],
    snapshot,
  );
};

const runSaveFailCase = (store, testCase) => {
  const locationId = getFirstLocationId(store);
  if (!locationId) {
    return buildResult(
      testCase,
      false,
      ['No locations available.'],
      buildProgressSnapshot(store),
    );
  }

  const before = buildProgressSnapshot(store);
  store.dispatch('progress/selectLocation', locationId);
  store.dispatch('progress/recordFail', {
    locationId,
    fishId: 'debug-fail',
    fishName: 'Debug Fail',
  });
  const snapshot = buildProgressSnapshot(store);

  const attemptsDelta =
    snapshot.storeProgress.stats.attempts - before.storeProgress.stats.attempts;
  const failsDelta =
    snapshot.storeProgress.stats.fails - before.storeProgress.stats.fails;
  const storageStats = snapshot.storageParsed?.stats;
  const latestLog = snapshot.storageParsed?.catchLog?.[0];
  const pass =
    attemptsDelta === 1 &&
    failsDelta === 1 &&
    storageStats?.attempts === snapshot.storeProgress.stats.attempts &&
    storageStats?.fails === snapshot.storeProgress.stats.fails &&
    latestLog?.result === 'failed';

  return buildResult(
    testCase,
    pass,
    [
      `attempts delta: ${attemptsDelta}`,
      `fails delta: ${failsDelta}`,
      `latest storage log result: ${latestLog?.result || 'none'}`,
    ],
    snapshot,
  );
};

const runLoadValidCase = (store, testCase) => {
  const locationId = getFirstLocationId(store);
  if (!locationId) {
    return buildResult(
      testCase,
      false,
      ['No locations available.'],
      buildProgressSnapshot(store),
    );
  }

  const validPayload = {
    version: SAVE_VERSION,
    selectedLocationId: locationId,
    stats: {
      attempts: 7,
      catches: 4,
      fails: 3,
    },
    catchLog: [
      {
        locationId,
        fishId: 'valid-load-fish',
        fishName: 'Loaded Fish',
        result: 'caught',
        timestamp: 1000,
      },
    ],
  };

  writeRawStorage(JSON.stringify(validPayload));
  store.dispatch('progress/bootstrapProgress');
  const snapshot = buildProgressSnapshot(store);

  const pass =
    snapshot.storeProgress.selectedLocationId ===
      validPayload.selectedLocationId &&
    snapshot.storeProgress.stats.attempts === validPayload.stats.attempts &&
    snapshot.storeProgress.stats.catches === validPayload.stats.catches &&
    snapshot.storeProgress.stats.fails === validPayload.stats.fails &&
    store.state.gameSession.activeLocationId ===
      validPayload.selectedLocationId;

  return buildResult(
    testCase,
    pass,
    [
      `selectedLocationId in store: ${snapshot.storeProgress.selectedLocationId || 'null'}`,
      `activeLocationId in session: ${store.state.gameSession.activeLocationId || 'null'}`,
    ],
    snapshot,
  );
};

const runLoadCorruptCase = (store, testCase) => {
  const defaultState = buildDefaultSaveState();
  const writeOk = writeRawStorage('{"version":1,');
  if (!writeOk) {
    return buildResult(
      testCase,
      false,
      ['Cannot write corrupt payload to storage.'],
      buildProgressSnapshot(store),
    );
  }

  store.dispatch('progress/bootstrapProgress');
  const snapshot = buildProgressSnapshot(store);
  const pass =
    snapshot.storeProgress.selectedLocationId ===
      defaultState.selectedLocationId &&
    snapshot.storeProgress.stats.attempts === defaultState.stats.attempts &&
    snapshot.storeProgress.stats.catches === defaultState.stats.catches &&
    snapshot.storeProgress.stats.fails === defaultState.stats.fails;

  return buildResult(
    testCase,
    pass,
    ['Corrupt JSON injected and bootstrap completed.'],
    snapshot,
  );
};

const runLoadWrongVersionCase = (store, testCase) => {
  const defaultState = buildDefaultSaveState();
  const writeOk = writeRawStorage(
    JSON.stringify({
      version: SAVE_VERSION + 99,
      selectedLocationId: 'invalid-version-location',
      stats: {
        attempts: 99,
        catches: 99,
        fails: 0,
      },
      catchLog: [{ result: 'caught' }],
    }),
  );

  if (!writeOk) {
    return buildResult(
      testCase,
      false,
      ['Cannot write wrong version payload to storage.'],
      buildProgressSnapshot(store),
    );
  }

  store.dispatch('progress/bootstrapProgress');
  const snapshot = buildProgressSnapshot(store);
  const pass =
    snapshot.storeProgress.selectedLocationId ===
      defaultState.selectedLocationId &&
    snapshot.storeProgress.stats.attempts === defaultState.stats.attempts &&
    snapshot.storeProgress.stats.catches === defaultState.stats.catches &&
    snapshot.storeProgress.stats.fails === defaultState.stats.fails;

  return buildResult(
    testCase,
    pass,
    ['Wrong-version payload injected and ignored during bootstrap.'],
    snapshot,
  );
};

const runClearResetCase = (store, testCase) => {
  const locationId = getFirstLocationId(store);
  if (!locationId) {
    return buildResult(
      testCase,
      false,
      ['No locations available.'],
      buildProgressSnapshot(store),
    );
  }

  store.dispatch('progress/selectLocation', locationId);
  store.dispatch('progress/recordCatch', {
    locationId,
    fishId: 'clear-reset-fish',
    fishName: 'Clear Reset Fish',
  });
  store.dispatch('progress/resetProgress');

  const snapshot = buildProgressSnapshot(store);
  const pass =
    snapshot.storeProgress.selectedLocationId === null &&
    snapshot.storeProgress.stats.attempts === 0 &&
    snapshot.storeProgress.stats.catches === 0 &&
    snapshot.storeProgress.stats.fails === 0 &&
    snapshot.storageRaw === null;

  return buildResult(
    testCase,
    pass,
    [
      `storageRaw after reset: ${snapshot.storageRaw === null ? 'null' : 'present'}`,
    ],
    snapshot,
  );
};

const runCase = (store, caseId) => {
  const testCase = TEST_CASES.find((item) => item.id === caseId);
  if (!testCase) {
    return {
      id: caseId,
      label: 'Unknown case',
      pass: false,
      expected: [],
      messages: [`Unknown case id: ${caseId}`],
      snapshot: buildProgressSnapshot(store),
    };
  }

  if (caseId === 'save-location') {
    return runSaveLocationCase(store, testCase);
  }

  if (caseId === 'save-catch') {
    return runSaveCatchCase(store, testCase);
  }

  if (caseId === 'save-fail') {
    return runSaveFailCase(store, testCase);
  }

  if (caseId === 'load-valid') {
    return runLoadValidCase(store, testCase);
  }

  if (caseId === 'load-corrupt') {
    return runLoadCorruptCase(store, testCase);
  }

  if (caseId === 'load-wrong-version') {
    return runLoadWrongVersionCase(store, testCase);
  }

  if (caseId === 'clear-reset') {
    return runClearResetCase(store, testCase);
  }

  return {
    id: caseId,
    label: testCase.label,
    pass: false,
    expected: testCase.expected,
    messages: [`No runner implemented for case id: ${caseId}`],
    snapshot: buildProgressSnapshot(store),
  };
};

export {
  TEST_CASES,
  buildProgressSnapshot,
  readStorageParsed,
  readStorageRaw,
  runCase,
};
