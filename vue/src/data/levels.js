export const levels = [
  {
    id: 1, 
    startPoints: 80,
    path: [{x: 0, y: 50}, {x: 50, y: 50}, {x: 50, y: 100}],
    slots: [{id: 's1', x: 35, y: 35}, {id: 's2', x: 58, y: 80}],
    barrierSlots: [{id: 'b1', x: 50, y: 80, angle: 90}],
    enemies: [
      {id: 'e1', typeId: 1, delay: 8000},
      {id: 'e2', typeId: 1, delay: 10000},
      {id: 'e3', typeId: 2, delay: 4000},
      {id: 'e4', typeId: 3, delay: 6000},
      {id: 'e5', typeId: 5, delay: 0},
      {id: 'e6', typeId: 5, delay: 2000},
    ],
    allies: [
      {id: 'a1', typeId: 1}
    ]
  }, 
  {
    id: 2, 
    startPoints: 100,
    path: [{x: 0, y: 90}, {x: 30, y: 90}, {x: 30, y: 50}, {x: 70, y: 50}, {x: 70, y: 90}, {x: 100, y: 90}],
    slots: [{id: 's1', x: 38, y: 80}, {id: 's2', x: 50, y: 35}, {id: 's3', x: 78, y: 70}],
    barrierSlots: [{id: 'b1', x: 40, y: 50, angle: 0}, {id: 'b2', x: 70, y: 75, angle: 90}],
    enemies: [
      {id: 'e1', typeId: 1, delay: 5200},
      {id: 'e2', typeId: 1, delay: 9800},
      {id: 'e3', typeId: 2, delay: 2400},
      {id: 'e4', typeId: 2, delay: 7000},
      {id: 'e5', typeId: 5, delay: 11600},
      {id: 'e6', typeId: 3, delay: 1200},
      {id: 'e7', typeId: 3, delay: 8400},
      {id: 'e8', typeId: 6, delay: 0},
      {id: 'e9', typeId: 6, delay: 3800},
    ],
    allies: [
      {id: 'a1', typeId: 1}, {id: 'a2', typeId: 2}, 
    ]
  },
  {
    id: 3, 
    startPoints: 130,
    path: [{x: 0, y: 30}, {x: 30, y: 30}, {x: 30, y: 60}, {x: 70, y: 60}, {x: 70, y: 90}, {x: 100, y: 90}],
    slots: [{id: 's1', x: 20, y: 15}, {id: 's2', x: 38, y: 45}, {id: 's3', x: 50, y: 75}, {id: 's4', x: 78, y: 70}],
    barrierSlots: [{id: 'b1', x: 40, y: 60, angle: 0}, {id: 'b2', x: 75, y: 90, angle: 0}],
    enemies: [
      {id: 'e1', typeId: 1, delay: 10000},
      {id: 'e2', typeId: 5, delay: 12000},
      {id: 'e3', typeId: 5, delay: 10000},
      {id: 'e4', typeId: 2, delay: 7000},
      {id: 'e5', typeId: 2, delay: 9000},
      {id: 'e6', typeId: 3, delay: 3000},
      {id: 'e7', typeId: 3, delay: 6000},
      {id: 'e8', typeId: 6, delay: 1000},
      {id: 'e9', typeId: 3, delay: 8000},
      {id: 'e10', typeId: 4, delay: 11000},
      {id: 'e11', typeId: 7, delay: 5000},
      {id: 'e12', typeId: 4, delay: 0},
    ],
    allies: [
      {id: 'a1', typeId: 1}, {id: 'a2', typeId: 2}, {id: 'a3', typeId: 3}
    ]
  }
]