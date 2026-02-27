import { LOCATIONS } from '@/game-config/locations';
import { FISH_DEFINITIONS, FISH_TABLES } from '@/game-config/fish';
import { TUNING } from '@/game-config/tuning';
import { validateGameConfig } from '@/game-config/validation';

const configErrors = validateGameConfig({
  locations: LOCATIONS,
  fishDefinitions: FISH_DEFINITIONS,
  fishTables: FISH_TABLES,
  tuning: TUNING,
});

if (import.meta.env.DEV && configErrors.length) {
  console.warn('Invalid game config:', configErrors);
}

export const GAME_CONFIG = Object.freeze({
  locations: LOCATIONS,
  fishDefinitions: FISH_DEFINITIONS,
  fishTables: FISH_TABLES,
  tuning: TUNING,
});
