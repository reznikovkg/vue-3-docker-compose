import { defineConfig } from '@/utils/defineConfig'

export const LANDING_NET_DEFINITIONS = defineConfig([
  {
    id: 'landing-net-small',
    name: 'Small Landing Net',
    capacityKg: 1,
    price: 45,
  },
  {
    id: 'landing-net-big',
    name: 'Big Landing Net',
    capacityKg: 2,
    price: 85,
  },
])
