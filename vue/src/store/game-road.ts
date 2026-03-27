export const ROAD_CONFIG = {
  WIDTH: 400,
  LANE_COUNT: 3,
  ONCOMING_LANE: 0,
  TUNNEL_TOP_RATIO: 0.52,
}

export const GAME_CONFIG = {
  INITIAL_SPEED: 3,
  BASE_RECOVERY_ACCEL: 0.06,
  SPEED_INCREASE: 0.0005,
  COLLISION_SLOWDOWN_FACTOR: 0.45,
  COLLISION_ACCEL_RECOVERY_STEP: 0.003,
  INITIAL_LIVES: 3,
  ENEMY_WIDTH: 40,
  ENEMY_HEIGHT: 70,
  ENEMY_SPEED_FACTOR: 0.9,
  ONCOMING_ENEMY_SPEED_FACTOR: 1.55,
  ENEMY_SPAWN_DISTANCE_STEP: 40,
  ROAD_ITEM_SPAWN_DISTANCE_STEP: 90,
  BOOST_DURATION_MS: 5000,
  BOOST_SPEED_BONUS: 2.6,
  GAME_OVER_REDIRECT_DELAY: 800,
}

export const ROAD_ITEM_TYPES = {
  PIT: 'pit',
  BARRIER: 'barrier',
  EXTRA_LIFE: 'extraLife',
  SPEED_BOOST: 'speedBoost',
} as const

export interface Car {
  id?: number
  x: number
  y: number
  width: number
  height: number
  speed: number
  lane?: number
  color?: string
  isOncoming?: boolean
}

export type RoadItemType = typeof ROAD_ITEM_TYPES[keyof typeof ROAD_ITEM_TYPES]

export interface RoadItem {
  id: number
  x: number
  y: number
  width: number
  height: number
  lane: number
  speed: number
  type: RoadItemType
}

export interface GameState {
  playerCar: Car
  enemies: Car[]
  roadItems: RoadItem[]
  speed: number
  speedPenaltyFactor: number
  boostRemainingMs: number
  distance: number
  lives: number
  keys: {
    left: boolean
    right: boolean
  }
}

export const GAME_ROAD_MUTATIONS = {
  RESET_GAME_STATE: 'RESET_GAME_STATE',
} as const

export const getLaneCenterX = (laneIndex: number) => {
  const laneWidth = ROAD_CONFIG.WIDTH / ROAD_CONFIG.LANE_COUNT

  return laneWidth * laneIndex + laneWidth / 2
}

export const getRandomLane = (allowedLanes: number[]) => {
  const randomIndex = Math.floor(Math.random() * allowedLanes.length)

  return allowedLanes[randomIndex]
}

export const createInitialGameState = (): GameState => ({
  playerCar: {
    x: getLaneCenterX(1),
    y: 0,
    width: 40,
    height: 70,
    speed: 0,
  },
  enemies: [],
  roadItems: [],
  speed: GAME_CONFIG.INITIAL_SPEED,
  speedPenaltyFactor: 1,
  boostRemainingMs: 0,
  distance: 0,
  lives: GAME_CONFIG.INITIAL_LIVES,
  keys: {
    left: false,
    right: false,
  },
})

const gameRoadModule = {
  namespaced: true,
  state: () => createInitialGameState(),
  getters: {
    getGameState: (state: GameState) => state,
  },
  mutations: {
    [GAME_ROAD_MUTATIONS.RESET_GAME_STATE]: (state: GameState) => {
      const initialState = createInitialGameState()

      state.playerCar = initialState.playerCar
      state.enemies = initialState.enemies
      state.roadItems = initialState.roadItems
      state.speed = initialState.speed
      state.speedPenaltyFactor = initialState.speedPenaltyFactor
      state.boostRemainingMs = initialState.boostRemainingMs
      state.distance = initialState.distance
      state.lives = initialState.lives
      state.keys = initialState.keys
    },
  },
}

export default gameRoadModule
