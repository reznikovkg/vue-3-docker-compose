import { defineConfig } from '@/utils/defineConfig'

export const LOCATIONS = defineConfig([
  {
    id: 'pine-lake',
    name: 'Pine Lake',
    bgImage: '/images/locations/pine-lake.webp',
    bobberAnchor: {
      x: 61,
      y: 63
    },
    fishTableId: 'freshwater-basic',
    difficultyMultiplier: 1
  },
  {
    id: 'stone-river',
    name: 'Stone River',
    bgImage: '/images/locations/stone-river.webp',
    bobberAnchor: {
      x: 56,
      y: 66
    },
    fishTableId: 'river-mixed',
    difficultyMultiplier: 0.8
  },
  {
    id: 'foggy-marsh',
    name: 'Foggy Marsh',
    bgImage: '/images/locations/foggy-marsh.webp',
    bobberAnchor: {
      x: 52,
      y: 68
    },
    fishTableId: 'marsh-predators',
    difficultyMultiplier: 0.8
  }
])
