export const LOCATIONS = Object.freeze([
  {
    id: 'pine-lake',
    name: 'Pine Lake',
    bgImage: '/images/locations/pine-lake.webp',
    bobberAnchor: Object.freeze({
      x: 61,
      y: 63,
    }),
    fishTableId: 'freshwater-basic',
    biteRateBase: 1,
    difficultyMultiplier: 1,
  },
  {
    id: 'stone-river',
    name: 'Stone River',
    bgImage: '/images/locations/stone-river.webp',
    bobberAnchor: Object.freeze({
      x: 56,
      y: 66,
    }),
    fishTableId: 'river-mixed',
    biteRateBase: 1.12,
    difficultyMultiplier: 0.8,
  },
  {
    id: 'foggy-marsh',
    name: 'Foggy Marsh',
    bgImage: '/images/locations/foggy-marsh.webp',
    bobberAnchor: Object.freeze({
      x: 52,
      y: 68,
    }),
    fishTableId: 'marsh-predators',
    biteRateBase: 0.92,
    difficultyMultiplier: 0.8,
  },
]);
