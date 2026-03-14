import { LOCATIONS } from '@/game-config/locations'
import { FISH_DEFINITIONS, FISH_TABLES } from '@/game-config/fish'
import { GEAR_DEFINITIONS } from '@/game-config/gear'
import { TUNING } from '@/game-config/tuning'
import { defineConfig } from '@/utils/defineConfig'

export const GAME_CONFIG = defineConfig({
  locations: LOCATIONS,
  fishDefinitions: FISH_DEFINITIONS,
  fishTables: FISH_TABLES,
  gearDefinitions: GEAR_DEFINITIONS,
  tuning: TUNING,
})
