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
    startEnemies: Array.from({ length: 8 }, () => ({ x: 100, y: 100 })),
    towerPositions: [
      { id: 'pos1', x: 150, y: 150 },
      { id: 'pos2', x: 250, y: 150 },
      { id: 'pos3', x: 350, y: 250 },
      { id: 'pos4', x: 450, y: 350 },
      { id: 'pos5', x: 550, y: 450 },
      { id: 'pos6', x: 650, y: 450 }
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
    startEnemies: Array.from({ length: 7 }, () => ({ x: 200, y: 200 })),
    towerPositions: [
      { id: 'pos1', x: 250, y: 150 },
      { id: 'pos2', x: 350, y: 250 },
      { id: 'pos3', x: 450, y: 350 },
      { id: 'pos4', x: 550, y: 250 },
      { id: 'pos5', x: 720, y: 150 }
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
    startEnemies: Array.from({ length: 10 }, () => ({ x: 50, y: 300 })),
    towerPositions: [
      { id: 'pos1', x: 100, y: 250 },
      { id: 'pos2', x: 150, y: 150 },
      { id: 'pos3', x: 300, y: 150 },
      { id: 'pos4', x: 330, y: 300 },
      { id: 'pos5', x: 500, y: 380 },
      { id: 'pos6', x: 600, y: 380 },
      { id: 'pos7', x: 760, y: 300 }
    ]
  }
]