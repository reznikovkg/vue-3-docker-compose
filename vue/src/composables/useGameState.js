import { LEVELS_DATA } from '@/constants/levels'

export const createGameState = () => ({
  levels: LEVELS_DATA,
  currentLevelId: 1,
  currentPath: [],
  towerPositions: [],
  towers: [],
  enemies: [],
  totalKills: 0,
  selectedEnemyId: null,
  selectedTowerId: null
})
