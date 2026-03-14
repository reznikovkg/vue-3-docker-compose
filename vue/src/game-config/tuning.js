export const TUNING = Object.freeze({
  biteDelayMs: Object.freeze({
    min: 900,
    max: 6400,
  }),
  minigame: Object.freeze({
    greenSpeedBase: 0.23,
    redSpeedBase: 0.11,
    maxTimeMs: 12000,
    barrierCountRange: Object.freeze({
      min: 1,
      max: 3,
    }),
    barrierClicksByTier: Object.freeze({
      1: Object.freeze({
        min: 4,
        max: 7,
      }),
      2: Object.freeze({
        min: 7,
        max: 12,
      }),
      3: Object.freeze({
        min: 12,
        max: 19,
      }),
    }),
  }),
})
