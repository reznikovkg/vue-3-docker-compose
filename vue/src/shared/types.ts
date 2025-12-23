import { MOVEMENT_KEY_OFFSETS } from './constants';

export type Arrows = keyof typeof MOVEMENT_KEY_OFFSETS;

export type EnemyType = 'common' | 'medium' | 'hard';

export type ShooterEnemyType =
  | 'shooter_light'
  | 'shooter_medium'
  | 'shooter_heavy';

export type AllyType = 'soldier' | 'heavy_soldier';

export type BarricadeType = 'wooden' | 'stone' | 'metal';
