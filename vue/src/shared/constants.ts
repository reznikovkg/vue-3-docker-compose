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
  },
  {
    id: 2,
    zones: [
      new ZoneModel([
        new Point(0, 0),
        new Point(90, 0),
        new Point(60, 30),
        new Point(40, 95),
        new Point(0, 95),
      ]),
      new ZoneModel([
        new Point(90, 10),
        new Point(92, 10),
        new Point(100, 9),
        new Point(100, 100),
        new Point(92, 100),
        new Point(92, 40),
        new Point(88, 30),
      ]),
      new ZoneModel([
        new Point(80, 30),
        new Point(88, 50),
        new Point(75, 90),
        new Point(60, 90),
      ]),
    ],
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
