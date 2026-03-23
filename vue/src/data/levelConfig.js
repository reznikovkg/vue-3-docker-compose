import { LEVEL_KEYS } from '@/constants/gameConstants'

export const levelConfig = {
  [LEVEL_KEYS.FIRST]: {
    id: LEVEL_KEYS.FIRST,
    title: 'First Level',
    startGold: 300,
    size: {
      w: 900,
      h: 520
    },
    enemySpawn: {
      x: 90,
      y: 260
    },
    path: [
      { x: 90, y: 260 },
      { x: 300, y: 260 },
      { x: 300, y: 120 },
      { x: 700, y: 120 },
      { x: 700, y: 400 }
    ],
    slots: [
      {
        id: 'slotA',
        pos: { x: 200, y: 180 }
      },
      {
        id: 'slotB',
        pos: { x: 400, y: 300 }
      },
      {
        id: 'slotC',
        pos: { x: 600, y: 200 }
      }
    ]
  },

  [LEVEL_KEYS.SECOND]: {
    id: LEVEL_KEYS.SECOND,
    title: 'Second Level',
    startGold: 350,
    size: {
      w: 900,
      h: 520
    },
    enemySpawn: {
      x: 100,
      y: 100
    },
    path: [
      { x: 100, y: 100 },
      { x: 800, y: 100 },
      { x: 800, y: 400 },
      { x: 200, y: 400 }
    ],
    slots: [
      {
        id: 'slot1',
        pos: { x: 300, y: 200 }
      },
      {
        id: 'slot2',
        pos: { x: 500, y: 300 }
      },
      {
        id: 'slot3',
        pos: { x: 650, y: 180 }
      },
      {
        id: 'slot4',
        pos: { x: 250, y: 350 }
      }
    ]
  }
}