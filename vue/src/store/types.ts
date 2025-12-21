import { ActionContext } from 'vuex/types';

import {
  Point,
  ZoneModel,
  TowerModel,
  EnemyModel,
  ShooterEnemyModel,
  AllyModel,
  BarricadeModel,
  ArtilleryStrikeModel,
} from '@/shared/models';
import { EnemyType } from '@/shared/types';

export interface ZoneSize {
  width: number;
  height: number;
}

export interface SpawnEnemyItem {
  health?: number;
  speed?: number;
  reward?: number;
  type?: EnemyType | 'shooter_light' | 'shooter_medium' | 'shooter_heavy';
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
  reversePath: Point[]; // обратный путь для союзников
  reversePathPixel: Point[];

  towers: TowerModel[];
  enemies: EnemyModel[];
  shooterEnemies: ShooterEnemyModel[];
  allies: AllyModel[];
  barricades: BarricadeModel[];
  artilleryStrikes: ArtilleryStrikeModel[];
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
  SET_REVERSE_PATH: Mutation<Point[]>;
  SET_REVERSE_PATH_PIXEL: Mutation<Point[]>;

  SET_TOWERS: Mutation<TowerModel[]>;
  SET_ENEMIES: Mutation<EnemyModel[]>;
  SET_SHOOTER_ENEMIES: Mutation<ShooterEnemyModel[]>;
  SET_ALLIES: Mutation<AllyModel[]>;
  SET_BARRICADES: Mutation<BarricadeModel[]>;
  SET_ARTILLERY_STRIKES: Mutation<ArtilleryStrikeModel[]>;
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

export interface Getters {
  money: (state: State) => number;
  isPlaying: (state: State) => boolean;
  gameOver: (state: State) => boolean;
  gameResult: (state: State) => GameResult | null;
  currentLevelId: (state: State) => number;

  zoneSize: (state: State) => ZoneSize | null;
  buildZones: (state: State) => ZoneModel[];
  path: (state: State) => Point[];
  pathPixel: (state: State) => Point[];
  reversePath: (state: State) => Point[];
  reversePathPixel: (state: State) => Point[];

  towers: (state: State) => TowerModel[];
  enemies: (state: State) => EnemyModel[];
  shooterEnemies: (state: State) => ShooterEnemyModel[];
  allies: (state: State) => AllyModel[];
  barricades: (state: State) => BarricadeModel[];
  artilleryStrikes: (state: State) => ArtilleryStrikeModel[];
  selectedEnemyIndex: (state: State) => number | null;

  spawnConfig: (state: State) => SpawnConfig | null;
  spawnState: (state: State) => SpawnState;
}

export interface Actions {
  initLevel: Action<number | undefined, void>;
  setZoneSize: Action<ZoneSize, void>;
  recomputePathPixel: Action<void, void>;
  placeTowerAt: Action<Point, boolean>;
  placeBarricadeAt: Action<
    {
      startPoint: Point;
      endPoint: Point;
      barricadeType: 'wooden' | 'stone' | 'metal';
    },
    boolean
  >;
  callArtilleryStrike: Action<Point, boolean>;
  spawnAlly: Action<void, void>;
  deleteObjectAt: Action<Point, void>;
  spawnEnemy: Action<void, void>;
  updateGame: Action<number, void>;
  startGameLoop: Action<void, void>;
  stopGameLoop: Action<void, void>;
}
