export const ENEMY_TYPES = {
  light: {
    health: 60,
    reward: 50,
    speed: 0.11,
    color: '#4CAF50',
    type: 'melee'
  },
  medium: {
    health: 120,
    reward: 80,
    speed: 0.09,
    color: '#FF9800',
    type: 'melee'
  },
  heavy: {
    health: 180,
    reward: 150,
    speed: 0.07,
    color: '#f44336',
    type: 'melee'
  },
  shooter_light: {
    health: 80,
    reward: 100,
    speed: 0.06,
    color: '#9C27B0',
    type: 'shooter',
    shootDamage: 15,
    shootRange: 90,
    shootCooldown: 1000
  },
  shooter_medium: {
    health: 150,
    reward: 200,
    speed: 0.05,
    color: '#673AB7',
    type: 'shooter',
    shootDamage: 25,
    shootRange: 100,
    shootCooldown: 800
  },
  shooter_heavy: {
    health: 250,
    reward: 350,
    speed: 0.04,
    color: '#3F51B5',
    type: 'shooter',
    shootDamage: 40,
    shootRange: 110,
    shootCooldown: 1200
  }
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
      { type: 'light', chance: 0.4 },
      { type: 'medium', chance: 0.4 },
      { type: 'shooter_light', chance: 0.2 }
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
      { type: 'light', chance: 0.3 },
      { type: 'medium', chance: 0.3 },
      { type: 'shooter_light', chance: 0.2 },
      { type: 'shooter_medium', chance: 0.2 }
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
      { id: 'pos4', x: 350, y: 300 },
      { id: 'pos5', x: 500, y: 400 },
      { id: 'pos6', x: 600, y: 400 },
      { id: 'pos7', x: 760, y: 300 }
    ],
    enemyTypes: [
      { type: 'light', chance: 0.4 },
      { type: 'medium', chance: 0.2 },
      { type: 'heavy', chance: 0.2 },
      { type: 'shooter_light', chance: 0.1 },
      { type: 'shooter_heavy', chance: 0.1 }
    ]
  }
]