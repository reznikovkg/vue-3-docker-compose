import { LEVELS_DATA } from '@/constants/levels'

const TOWER_COST = 100

export const createGameState = () => ({
  levels: LEVELS_DATA,
  currentLevelId: 1,
  currentPath: [],
  towerPositions: [],
  towers: [],
  enemies: [],
  shots: [],
  totalKills: 0,
  selectedTowerId: null,
  enemiesSpawned: 0,
  points: 200,
  
  gameOver: false,
  victory: false,
  maxEnemies: 0,
  
  gameLoop: null,
  spawnInterval: null,
  showInsufficientFunds: false,
  
  TOWER_COST
})
