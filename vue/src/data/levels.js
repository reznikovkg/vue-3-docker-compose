export const levels = [
  {
    id: 1, 
    path: [{x: 5, y: 25}, {x: 70, y: 25}, {x: 70, y: 85}, {x: 140, y: 85}],
    slots: [{id: 's1', x: 35, y: 8}, {id: 's2', x: 70, y: 65}],
    enemySpawn: [{ hp: 15, reward: 10 }, { hp: 25, reward: 15 }, { hp: 40, reward: 25 }]
  }, 
  {
    id: 2, 
    path: [{x: 5, y: 25}, {x: 35, y: 25}, {x: 35, y: 60}, {x: 70, y: 60}, {x: 70, y: 85}, {x: 140, y: 85}],
    slots: [{id: 's1', x: 35, y: 10}, {id: 's2', x: 52, y: 42}, {id: 's3', x: 88, y: 65}],
    enemySpawn: [{ hp: 20, reward: 12 }, { hp: 35, reward: 20 }, { hp: 50, reward: 30 }, { hp: 60, reward: 35 }]
  },
  {
    id: 3,
    path: [{x: 5, y: 15}, {x: 45, y: 15}, {x: 45, y: 65}, {x: 15, y: 65}, {x: 15, y: 85}, {x: 75, y: 85}, {x: 75, y: 40}, {x: 140, y: 40}],
    slots: [{id: 's1', x: 25, y: 5}, {id: 's2', x: 65, y: 60}],
    enemySpawn: [{ hp: 25, reward: 15 }, { hp: 45, reward: 25 }, { hp: 70, reward: 40 }, { hp: 90, reward: 50 }, { hp: 100, reward: 60 }]
  }
]