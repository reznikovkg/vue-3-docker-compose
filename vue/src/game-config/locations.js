export const LOCATIONS = Object.freeze([
  {
    id: 'pine-lake',
    name: 'Pine Lake',
    bgImage: '/images/locations/pine-lake.png',
    fishTableId: 'freshwater-basic',
    biteRateBase: 1,
    difficultyMultiplier: 1,
  },
  {
    id: 'stone-river',
    name: 'Stone River',
    bgImage: '/images/locations/stone-river.png',
    fishTableId: 'river-mixed',
    biteRateBase: 1.12,
    difficultyMultiplier: 0.8,
  },
  {
    id: 'foggy-marsh',
    name: 'Foggy Marsh',
    bgImage: '/images/locations/foggy-marsh.png',
    fishTableId: 'marsh-predators',
    biteRateBase: 0.92,
    difficultyMultiplier: 0.8,
  },
]);
