const ENEMY_TYPES = {
  light: { health: 60, reward: 50, speed: 0.11, color: '#4CAF50' },
  medium: { health: 120, reward: 80, speed: 0.09, color: '#FF9800' },
  heavy: { health: 180, reward: 150, speed: 0.07, color: '#f44336' }
}

export const LEVELS_DATA = [
  {
    id: 1,
    path: [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 300 },
      { x: 500, y: 300 },
      { x: 500, y: 500 },
      { x: 700, y: 500 }
    ],
    maxEnemies: 10,
    spawnRate: 2000,
    startCapital: 200,
    towerPositions: [
      { id: 'pos1', x: 150, y: 150 },
      { id: 'pos2', x: 250, y: 150 },
      { id: 'pos3', x: 350, y: 250 },
      { id: 'pos4', x: 450, y: 350 },
      { id: 'pos5', x: 550, y: 450 },
      { id: 'pos6', x: 650, y: 450 }
    ],
    enemyTypes: [
      { type: 'light', chance: 0.5, ...ENEMY_TYPES.light },
      { type: 'medium', chance: 0.5, ...ENEMY_TYPES.medium },
      { type: 'heavy', chance: 0, ...ENEMY_TYPES.heavy }
    ]
  },
  {
    id: 2,
    path: [
      { x: 200, y: 200 },
      { x: 400, y: 200 },
      { x: 400, y: 400 },
      { x: 600, y: 400 },
      { x: 600, y: 200 },
      { x: 700, y: 100 }
    ],
    maxEnemies: 15,
    spawnRate: 1800,
    startCapital: 250,
    towerPositions: [
      { id: 'pos1', x: 250, y: 150 },
      { id: 'pos2', x: 350, y: 250 },
      { id: 'pos3', x: 450, y: 350 },
      { id: 'pos4', x: 550, y: 250 },
      { id: 'pos5', x: 720, y: 150 }
    ],
    enemyTypes: [
      { type: 'light', chance: 0.4, ...ENEMY_TYPES.light },
      { type: 'medium', chance: 0.4, ...ENEMY_TYPES.medium },
      { type: 'heavy', chance: 0.2, ...ENEMY_TYPES.heavy }
    ]
  },
  {
    id: 3,
    path: [
      { x: 50, y: 300 },
      { x: 200, y: 300 },
      { x: 200, y: 100 },
      { x: 400, y: 100 },
      { x: 400, y: 450 },
      { x: 650, y: 450 },
      { x: 750, y: 200 }
    ],
    maxEnemies: 20,
    spawnRate: 1600,
    startCapital: 300,
    towerPositions: [
      { id: 'pos1', x: 100, y: 250 },
      { id: 'pos2', x: 150, y: 150 },
      { id: 'pos3', x: 300, y: 150 },
      { id: 'pos4', x: 330, y: 300 },
      { id: 'pos5', x: 500, y: 380 },
      { id: 'pos6', x: 600, y: 380 },
      { id: 'pos7', x: 760, y: 300 }
    ],
    enemyTypes: [
      { type: 'light', chance: 0.3, ...ENEMY_TYPES.light },
      { type: 'medium', chance: 0.4, ...ENEMY_TYPES.medium },
      { type: 'heavy', chance: 0.3, ...ENEMY_TYPES.heavy }
    ]
  }
]