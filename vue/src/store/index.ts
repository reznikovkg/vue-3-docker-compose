import { createStore } from 'vuex';
import { ActionTree, MutationTree } from 'vuex/types';

import { MUTATIONS, TOWER_COSTS } from '@/store/constants';
import { Mutations, State, Actions } from '@/store/types';

const initialState: State = {
  money: 1500,
  lives: 5,
  towers: [],
  selectedTowerType: null,
  wave: 0,
  isPlaying: false,
  path: [
    { x: -15, y: 0 },
    { x: -10, y: 0 },
    { x: -10, y: 5 },
    { x: 5, y: 5 },
    { x: 5, y: -5 },
    { x: 10, y: -5 },
    { x: 15, y: -5 },
  ],
  enemies: [],
};

const mutations: MutationTree<State> & Mutations = {
  [MUTATIONS.ADD_MONEY]: (state, value) => {
    state.money += value;
  },
  [MUTATIONS.REDUCE_MONEY]: (state, value) => {
    state.money -= value;
  },
  [MUTATIONS.REDUCE_LIVES]: (state) => {
    state.lives = Math.max(0, state.lives - 1);
  },
  [MUTATIONS.SET_TOWER]: (state, newTower) => {
    state.towers = [...state.towers, newTower];
  },
  [MUTATIONS.REMOVE_TOWER]: (state, id) => {
    state.towers = state.towers.filter((tower) => tower.id !== id);
  },
  [MUTATIONS.SET_SELECTED_TOWER_TYPE]: (state, type) => {
    state.selectedTowerType = type;
  },
  [MUTATIONS.SET_NEXT_WAVE]: (state) => {
    state.wave += 1;
  },
  [MUTATIONS.SET_PLAYING_STATE]: (state, value) => {
    state.isPlaying = value;
  },
  [MUTATIONS.RESET_GAME]: (state, newState) => {
    state = newState;
  },
  [MUTATIONS.SET_ENEMY]: (state, newEnemy) => {
    state.enemies = [...state.enemies, newEnemy];
  },
  [MUTATIONS.REMOVE_ENEMY]: (state, id) => {
    state.enemies = state.enemies.filter((enemy) => enemy.id !== id);
  },
  [MUTATIONS.DAMAGE_ENEMY]: (state, { id, damage }) => {
    state.enemies = state.enemies
      .map((enemy) =>
        enemy.id === id
          ? { ...enemy, health: Math.max(0, enemy.health - damage) }
          : enemy
      )
      .filter((enemy) => enemy.health > 0);
  },
  [MUTATIONS.UPDATE_ENEMY_POSITION]: (state, { id, ...position }) => {
    state.enemies = state.enemies.map((enemy) =>
      enemy.id === id ? { ...enemy, position } : enemy
    );
  },
};

const actions: ActionTree<State, State> & Actions = {
  reduceMoney({ commit, state }, value) {
    if (state.money >= value) {
      commit(MUTATIONS.REDUCE_MONEY, value);
      return true;
    }
    return false;
  },
  placeTower({ commit, state }, tower) {
    const cost = TOWER_COSTS[tower.type];
    if (state.money < cost) return false;

    const newTower = {
      id: `tower-${Date.now()}`,
      type: tower.type,
      x: tower.x,
      y: tower.y,
    };

    commit(MUTATIONS.SET_TOWER, newTower);
    commit(MUTATIONS.REDUCE_MONEY, cost);
    return true;
  },
  startWave({ commit }) {
    commit(MUTATIONS.SET_NEXT_WAVE);
    commit(MUTATIONS.SET_PLAYING_STATE, true);
  },
  spawnEnemy({ commit, state }) {
    const { path } = state;
    const startPoint = path[0];
    const maxHealth = 100;

    const newEnemy = {
      id: `enemy-${Date.now()}`,
      position: { x: startPoint.x, y: startPoint.y },
      health: maxHealth,
      maxHealth,
    };
    commit(MUTATIONS.SET_ENEMY, newEnemy);
  },
};

export default createStore<State>({
  state() {
    return initialState;
  },
  mutations,
  actions,
});
