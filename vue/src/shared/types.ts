import { MOVEMENT_KEY_OFFSETS } from './constants';

export type Arrows = keyof typeof MOVEMENT_KEY_OFFSETS;

export type EnemyType = 'common' | 'medium' | 'hard';
