import { defineConfig } from '@/utils/defineConfig'

export const GROUNDBAIT_DEFINITIONS = defineConfig([
  {
    id: 'perch-mix',
    name: 'Perch Mix',
    targetFishId: 'perch',
    price: 18,
    usesPerPurchase: 3,
  },
  {
    id: 'pike-mix',
    name: 'Pike Mix',
    targetFishId: 'pike',
    price: 27,
    usesPerPurchase: 3,
  },
])
