import { defineConfig } from '@/utils/defineConfig'

export const TUNING = defineConfig({
  biteDelayMs: {
    min: 900,
    max: 6400,
  },
  minigame: {
    greenSpeedBase: 0.23,
    redSpeedBase: 0.11,
    maxTimeMs: 12000,
    barrierCountRange: {
      min: 1,
      max: 3,
    },
    barrierClicksByTier: {
      1: {
        min: 1,
        max: 6,
      },
      2: {
        min: 2,
        max: 6,
      },
      3: {
        min: 3,
        max: 6,
      },
    },
  },
})
