import { ActionContext } from 'vuex/types';

export type TowerType = 'basic' | 'sniper' | 'heavy';

export interface State {
  money: number;
  lives: number;
  towers: Tower[];
  selectedTowerType: TowerType | null;
  wave: number;
  isPlaying: boolean;
  path: PathPoint[];
  enemies: Enemy[];
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  lastShot?: number;
}

export interface Enemy {
  id: string;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
}

export type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

type Mutation<P = undefined> = (state: State, payload: P) => void;
type Action<P = undefined, R = void> = (
  context: AugmentedActionContext,
  payload: P
) => R;

export interface Mutations {
  ADD_MONEY: Mutation<number>;
  REDUCE_MONEY: Mutation<number>;
  REDUCE_LIVES: Mutation;
  SET_TOWER: Mutation<Tower>;
  REMOVE_TOWER: Mutation<string>;
  SET_SELECTED_TOWER_TYPE: Mutation<TowerType | null>;
  SET_NEXT_WAVE: Mutation;
  SET_PLAYING_STATE: Mutation<boolean>;
  RESET_GAME: Mutation<State>;
  SET_ENEMY: Mutation<Enemy>;
  REMOVE_ENEMY: Mutation<string>;
  DAMAGE_ENEMY: Mutation<{ id: string; damage: number }>;
  UPDATE_ENEMY_POSITION: Mutation<{ id: string; x: number; y: number }>;
}

export interface Actions {
  reduceMoney: Action<number, boolean>;
  placeTower: Action<{ x: number; y: number; type: TowerType }, boolean>;
  startWave: Action;
  spawnEnemy: Action;
}
