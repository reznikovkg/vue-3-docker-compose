import { createStore } from 'vuex';
import { MutationTree, ActionTree } from 'vuex/types';

import { LEVELS, MAPS } from '@/shared/constants';
import { Point, ZoneModel } from '@/shared/models';
import { createGameLoop } from '@/shared/utils';
import { TOWER_BASE_COST } from '@/store/constants';
import {
  computePathPixel,
  placeTowerIfAllowed,
  deleteObjectAt as engineDeleteObjectAt,
  spawnOneEnemy,
  computeNextTick,
  upgradeTowerAt,
} from '@/store/gameEngine';
import { Actions, Mutations, SpawnConfig, State } from '@/store/types';

let gameLoop: ReturnType<typeof createGameLoop> | null = null;

const initialState: State = {
  money: 0,
  isPlaying: false,
  gameOver: false,
  gameResult: null,

  currentLevelId: LEVELS[0]?.id ?? 1,

  zoneSize: null,

  buildZones: [],
  path: [],
  pathPixel: [],

  towers: [],
  enemies: [],
  selectedEnemyIndex: null,

  spawnConfig: null,
  spawnState: { timer: 0, remaining: 0, index: 0 },
};
const mutations: MutationTree<State> & Mutations = {
  SET_MONEY(state, value) {
    state.money = value;
  },
  ADD_MONEY(state, value) {
    state.money += value;
  },
  REDUCE_MONEY(state, value) {
    state.money = Math.max(0, state.money - value);
  },

  SET_IS_PLAYING(state, value) {
    state.isPlaying = value;
  },
  SET_GAME_OVER(state, value) {
    state.gameOver = value;
  },
  SET_GAME_RESULT(state, value) {
    state.gameResult = value;
  },
  SET_LEVEL_ID(state, value) {
    state.currentLevelId = value;
  },
  SET_ZONE_SIZE(state, value) {
    state.zoneSize = value;
  },

  SET_BUILD_ZONES(state, zones) {
    state.buildZones = zones;
  },
  SET_PATH(state, path) {
    state.path = path;
  },
  SET_PATH_PIXEL(state, path) {
    state.pathPixel = path;
  },

  SET_TOWERS(state, towers) {
    state.towers = towers;
  },
  SET_ENEMIES(state, enemies) {
    state.enemies = enemies;
  },
  SET_SELECTED_ENEMY_INDEX(state, index) {
    state.selectedEnemyIndex = index;
  },

  SET_SPAWN_CONFIG(state, cfg) {
    state.spawnConfig = cfg;
  },
  SET_SPAWN_STATE(state, spawnState) {
    state.spawnState = spawnState;
  },

  RESET_LEVEL_STATE(state, payload) {
    state.money = payload.money;
    state.isPlaying = false;
    state.gameOver = false;
    state.gameResult = null;

    state.buildZones = payload.buildZones;
    state.path = payload.path;
    state.pathPixel = [];

    state.towers = [];
    state.enemies = [];
    state.selectedEnemyIndex = null;

    state.spawnConfig = payload.spawnConfig;
    const remaining =
      payload.spawnConfig?.enemies?.length ?? payload.spawnConfig?.count ?? 0;
    state.spawnState = { timer: 0, remaining, index: 0 };
  },
};

const actions: ActionTree<State, State> & Actions = {
  initLevel({ state, commit, dispatch }, levelId) {
    const targetId =
      typeof levelId === 'number' ? levelId : state.currentLevelId;
    const level =
      MAPS.find((m) => m.id === targetId) ??
      MAPS.find((m) => m.id === LEVELS[0]?.id)!;

    commit('SET_LEVEL_ID', level.id);

    const money = level.money ?? 0;
    const spawnConfig: SpawnConfig = level.spawn as SpawnConfig;
    const zones: ZoneModel[] = level.zones;
    const path: Point[] = level.path;

    commit('RESET_LEVEL_STATE', {
      money,
      spawnConfig,
      buildZones: zones,
      path,
    });

    if (state.zoneSize) {
      dispatch('recomputePathPixel');
    }
  },

  setZoneSize({ commit, dispatch }, size) {
    commit('SET_ZONE_SIZE', size);
    dispatch('recomputePathPixel');
  },

  recomputePathPixel({ state, commit }) {
    const px = computePathPixel(state.zoneSize, state.path);
    commit('SET_PATH_PIXEL', px);
  },

  placeTowerAt({ state, commit }, point) {
    const upgraded = upgradeTowerAt({
      towers: state.towers,
      point,
      money: state.money,
      baseCost: TOWER_BASE_COST,
    });
    if (upgraded) {
      if (upgraded.towers !== state.towers) {
        commit('SET_TOWERS', upgraded.towers);
      }
      if (upgraded.money !== state.money) {
        commit('SET_MONEY', upgraded.money);
      }
      return true;
    }

    if (state.money < TOWER_BASE_COST) return false;

    const towers = placeTowerIfAllowed({
      towers: state.towers,
      enemies: state.enemies,
      buildZones: state.buildZones,
      zoneSize: state.zoneSize,
      point,
      installCost: TOWER_BASE_COST,
    });
    if (!towers) return false;

    commit('SET_TOWERS', towers);
    commit('REDUCE_MONEY', TOWER_BASE_COST);
    return true;
  },

  deleteObjectAt({ state, commit }, point) {
    const { towers, enemies, selectedEnemyIndex } = engineDeleteObjectAt({
      towers: state.towers,
      enemies: state.enemies,
      selectedEnemyIndex: state.selectedEnemyIndex,
      point,
    });
    if (towers !== state.towers) commit('SET_TOWERS', towers);
    if (enemies !== state.enemies) commit('SET_ENEMIES', enemies);
    if (selectedEnemyIndex !== state.selectedEnemyIndex) {
      commit('SET_SELECTED_ENEMY_INDEX', selectedEnemyIndex);
    }
  },

  spawnEnemy({ state, commit }) {
    const next = spawnOneEnemy({
      pathPixel: state.pathPixel,
      spawnConfig: state.spawnConfig,
      spawnState: state.spawnState,
      enemies: state.enemies,
    });
    if (!next) return;
    commit('SET_ENEMIES', next.enemies);
    commit('SET_SPAWN_STATE', next.spawnState);
  },

  updateGame({ state, commit }, deltaTime) {
    const next = computeNextTick(state, deltaTime);

    if (next.gameResult) {
      if (next.gameResult !== state.gameResult) {
        commit('SET_GAME_RESULT', next.gameResult);
      }
      if (!state.gameOver) {
        commit('SET_GAME_OVER', true);
      }
      if (gameLoop) {
        gameLoop.stop();
        gameLoop = null;
      }
      if (state.isPlaying) {
        commit('SET_IS_PLAYING', false);
      }
      return;
    }

    if (next.towers !== state.towers) {
      commit('SET_TOWERS', next.towers);
    }
    if (next.enemies !== state.enemies) {
      commit('SET_ENEMIES', next.enemies);
    }
    if ((next.selectedEnemyIndex ?? null) !== state.selectedEnemyIndex) {
      commit('SET_SELECTED_ENEMY_INDEX', next.selectedEnemyIndex);
    }
    if (next.money !== state.money) {
      commit('SET_MONEY', next.money);
    }
    if (
      next.spawnState.timer !== state.spawnState.timer ||
      next.spawnState.remaining !== state.spawnState.remaining ||
      next.spawnState.index !== state.spawnState.index
    ) {
      commit('SET_SPAWN_STATE', next.spawnState);
    }
    if (next.gameResult !== state.gameResult) {
      commit('SET_GAME_RESULT', next.gameResult);
    }

    if (next.gameOver !== state.gameOver) {
      commit('SET_GAME_OVER', next.gameOver);
    }
    if (next.gameOver) {
      if (gameLoop) {
        gameLoop.stop();
        gameLoop = null;
      }
      if (state.isPlaying) {
        commit('SET_IS_PLAYING', false);
      }
      return;
    }
  },

  startGameLoop({ commit, dispatch }) {
    if (gameLoop) {
      gameLoop.stop();
      gameLoop = null;
    }
    commit('SET_GAME_OVER', false);
    commit('SET_GAME_RESULT', null);
    gameLoop = createGameLoop((delta: number) => {
      dispatch('updateGame', delta);
    });
    commit('SET_IS_PLAYING', true);
    gameLoop.start();
  },

  stopGameLoop({ commit }) {
    if (gameLoop) {
      gameLoop.stop();
      gameLoop = null;
    }
    commit('SET_IS_PLAYING', false);
  },
};

export default createStore<State>({
  state() {
    return initialState;
  },
  mutations,
  actions,
});
