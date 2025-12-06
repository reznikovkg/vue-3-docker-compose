import { ActionContext } from 'vuex/types';

import { Point, ZoneModel, TowerModel, EnemyModel } from '@/shared/models';
import { EnemyType } from '@/shared/types';

export interface ZoneSize {
  width: number;
  height: number;
}

export interface SpawnEnemyItem {
  health?: number;
  speed?: number;
  reward?: number;
  type?: EnemyType;
}

export interface SpawnConfig {
  interval: number;
  count?: number;
  speed: number;
  health: number;
  reward: number;
  type: EnemyType;
  enemies?: SpawnEnemyItem[];
}

export interface SpawnState {
  timer: number;
  remaining: number;
  index: number;
}

export type GameResult = 'win' | 'lose';

export interface State {
  money: number;
  isPlaying: boolean;
  gameOver: boolean;
  gameResult: GameResult | null;

  currentLevelId: number;

  zoneSize: ZoneSize | null;

  buildZones: ZoneModel[];
  path: Point[];
  pathPixel: Point[];

  towers: TowerModel[];
  enemies: EnemyModel[];
  selectedEnemyIndex: number | null;

  spawnConfig: SpawnConfig | null;
  spawnState: SpawnState;
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
  SET_MONEY: Mutation<number>;
  ADD_MONEY: Mutation<number>;
  REDUCE_MONEY: Mutation<number>;

  SET_IS_PLAYING: Mutation<boolean>;
  SET_GAME_OVER: Mutation<boolean>;
  SET_GAME_RESULT: Mutation<GameResult | null>;
  SET_LEVEL_ID: Mutation<number>;
  SET_ZONE_SIZE: Mutation<ZoneSize | null>;

  SET_BUILD_ZONES: Mutation<ZoneModel[]>;
  SET_PATH: Mutation<Point[]>;
  SET_PATH_PIXEL: Mutation<Point[]>;

  SET_TOWERS: Mutation<TowerModel[]>;
  SET_ENEMIES: Mutation<EnemyModel[]>;
  SET_SELECTED_ENEMY_INDEX: Mutation<number | null>;

  SET_SPAWN_CONFIG: Mutation<SpawnConfig | null>;
  SET_SPAWN_STATE: Mutation<SpawnState>;

  RESET_LEVEL_STATE: Mutation<{
    money: number;
    spawnConfig: SpawnConfig;
    buildZones: ZoneModel[];
    path: Point[];
  }>;
}

export interface Actions {
  initLevel: Action<number | undefined, void>;
  setZoneSize: Action<ZoneSize, void>;
  recomputePathPixel: Action<void, void>;
  placeTowerAt: Action<Point, boolean>;
  deleteObjectAt: Action<Point, void>;
  spawnEnemy: Action<void, void>;
  updateGame: Action<number, void>;
  startGameLoop: Action<void, void>;
  stopGameLoop: Action<void, void>;
}
