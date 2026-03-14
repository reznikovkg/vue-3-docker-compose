export const FISH_DEFINITIONS = Object.freeze([
  {
    id: 'roach',
    name: 'Roach',
    tier: 1,
    qualityRange: [45, 88],
    sizeRange: [0.2, 1.1],
    baseDifficulty: 0.9,
    sellValueBase: 6,
    gearModifiers: {},
    baitAffinity: {},
    stressProfile: {
      pull: 0.8,
      surge: 0.7,
    },
  },
  {
    id: 'perch',
    name: 'Perch',
    tier: 2,
    qualityRange: [50, 92],
    sizeRange: [0.3, 1.6],
    baseDifficulty: 1.1,
    sellValueBase: 10,
    gearModifiers: {},
    baitAffinity: {},
    stressProfile: {
      pull: 1,
      surge: 1,
    },
  },
  {
    id: 'pike',
    name: 'Pike',
    tier: 3,
    qualityRange: [58, 98],
    sizeRange: [1.4, 8.7],
    baseDifficulty: 1.45,
    sellValueBase: 18,
    gearModifiers: {},
    baitAffinity: {},
    stressProfile: {
      pull: 1.25,
      surge: 1.3,
    },
  },
])

export const FISH_TABLES = Object.freeze({
  'freshwater-basic': Object.freeze([
    {
      fishId: 'roach',
      weight: 0.62,
    },
    {
      fishId: 'perch',
      weight: 0.3,
    },
    {
      fishId: 'pike',
      weight: 0.08,
    },
  ]),
  'river-mixed': Object.freeze([
    {
      fishId: 'roach',
      weight: 0.42,
    },
    {
      fishId: 'perch',
      weight: 0.43,
    },
    {
      fishId: 'pike',
      weight: 0.15,
    },
  ]),
  'marsh-predators': Object.freeze([
    {
      fishId: 'roach',
      weight: 0.28,
    },
    {
      fishId: 'perch',
      weight: 0.38,
    },
    {
      fishId: 'pike',
      weight: 0.34,
    },
  ]),
})
