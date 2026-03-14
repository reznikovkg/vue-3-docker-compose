import { defineConfig } from '@/utils/defineConfig'

const RODS = defineConfig([
  {
    id: 'spinning',
    name: 'Spinning Rod',
    slot: 'rods',
    price: 0,
    isDefault: true,
    isUnlimited: true,
    affinityByFishId: {
      roach: 0.95,
      perch: 1.15,
      pike: 1.05,
    },
    difficultyMultiplier: 1,
  },
  {
    id: 'fly',
    name: 'Fly Rod',
    slot: 'rods',
    price: 260,
    isDefault: false,
    isUnlimited: false,
    affinityByFishId: {
      roach: 1.35,
      perch: 1,
      pike: 0.75,
    },
    difficultyMultiplier: 0.96,
  },
  {
    id: 'baitcast',
    name: 'Baitcast Rod',
    slot: 'rods',
    price: 420,
    isDefault: false,
    isUnlimited: false,
    affinityByFishId: {
      roach: 0.78,
      perch: 1,
      pike: 1.38,
    },
    difficultyMultiplier: 0.92,
  },
])

const LINES = defineConfig([
  {
    id: 'monofilament',
    name: 'Monofilament Line',
    slot: 'lines',
    price: 0,
    isDefault: true,
    isUnlimited: true,
    affinityByFishId: {
      roach: 1.18,
      perch: 1,
      pike: 0.9,
    },
    difficultyMultiplier: 1,
  },
  {
    id: 'fluorocarbon',
    name: 'Fluorocarbon Line',
    slot: 'lines',
    price: 24,
    isDefault: false,
    isUnlimited: false,
    affinityByFishId: {
      roach: 0.94,
      perch: 1.22,
      pike: 1.02,
    },
    difficultyMultiplier: 0.97,
  },
  {
    id: 'braided',
    name: 'Braided Line',
    slot: 'lines',
    price: 35,
    isDefault: false,
    isUnlimited: false,
    affinityByFishId: {
      roach: 0.82,
      perch: 1.05,
      pike: 1.3,
    },
    difficultyMultiplier: 0.93,
  },
])

const BAIT = defineConfig([
  {
    id: 'worm',
    name: 'Worm',
    slot: 'bait',
    price: 0,
    isDefault: true,
    isUnlimited: true,
    affinityByFishId: {
      roach: 1.4,
      perch: 1.02,
      pike: 0.62,
    },
    difficultyMultiplier: 1.02,
  },
  {
    id: 'spinner-lure',
    name: 'Spinner Lure',
    slot: 'bait',
    price: 19,
    isDefault: false,
    isUnlimited: false,
    affinityByFishId: {
      roach: 0.8,
      perch: 1.32,
      pike: 1.12,
    },
    difficultyMultiplier: 0.98,
  },
  {
    id: 'minnow',
    name: 'Minnow',
    slot: 'bait',
    price: 27,
    isDefault: false,
    isUnlimited: false,
    affinityByFishId: {
      roach: 0.7,
      perch: 1.02,
      pike: 1.45,
    },
    difficultyMultiplier: 0.94,
  },
])

export const GEAR_DEFINITIONS = defineConfig({
  rods: RODS,
  lines: LINES,
  bait: BAIT,
})
