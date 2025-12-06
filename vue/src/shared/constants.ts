import { Point, ZoneModel } from './models';

export const LEVELS = [
  { id: 1, isAvailable: true },
  { id: 2, isAvailable: true },
  { id: 3, isAvailable: false },
  { id: 4, isAvailable: false },
  { id: 5, isAvailable: false },
  { id: 6, isAvailable: false },
  { id: 7, isAvailable: false },
  { id: 8, isAvailable: false },
  { id: 9, isAvailable: false },
  { id: 10, isAvailable: false },
  { id: 11, isAvailable: false },
  { id: 12, isAvailable: false },
  { id: 13, isAvailable: false },
  { id: 14, isAvailable: false },
  { id: 15, isAvailable: false },
  { id: 16, isAvailable: false },
  { id: 17, isAvailable: false },
  { id: 18, isAvailable: false },
  { id: 19, isAvailable: false },
  { id: 20, isAvailable: false },
];

export const MAPS = [
  {
    id: 1,
    zones: [
      new ZoneModel([
        new Point(0, 0),
        new Point(100, 0),
        new Point(100, 40),
        new Point(0, 40),
      ]),
      new ZoneModel([
        new Point(0, 55),
        new Point(100, 50),
        new Point(100, 100),
        new Point(0, 100),
      ]),
    ],
    path: [new Point(0, 47.5), new Point(100, 47.5)],
    money: 100,
    spawn: {
      interval: 1000,
      count: 15,
      speed: 80,
      health: 100,
      reward: 10,
      type: 'common',
    },
  },
  {
    id: 2,
    zones: [
      new ZoneModel([
        new Point(0, 0),
        new Point(100, 0),
        new Point(100, 91),
        new Point(88, 91),
        new Point(88, 55),
        new Point(73, 55),
        new Point(73, 15),
        new Point(32, 15),
        new Point(32, 45),
        new Point(0, 45),
      ]),
      new ZoneModel([
        new Point(0, 55),
        new Point(38, 55),
        new Point(38, 25),
        new Point(67, 25),
        new Point(67, 65),
        new Point(82, 65),
        new Point(82, 100),
        new Point(0, 100),
      ]),
    ],
    path: [
      new Point(0, 50),
      new Point(35, 50),
      new Point(35, 20),
      new Point(70, 20),
      new Point(70, 60),
      new Point(85, 60),
      new Point(85, 95),
      new Point(100, 95),
    ],
    money: 200,
    spawn: {
      interval: 1500,
      speed: 85,
      enemies: [
        { health: 100, reward: 8, type: 'common' },
        { health: 100, reward: 8, type: 'common' },
        { health: 100, reward: 8, type: 'common' },
        { health: 100, reward: 8, type: 'common' },
        { health: 200, speed: 80, reward: 12, type: 'medium' },
        { health: 500, speed: 70, reward: 20, type: 'hard' },
      ],
    },
  },
];

export const MOVEMENT_KEY_OFFSETS = {
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: +1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: +1, dy: 0 },
};

// Время до удаления (в мс)
export const LONG_PRESS_DURATION = 500;
