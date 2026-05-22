const MUTATIONS = {
  SET_LEVEL: 'SET_LEVEL',
  SET_TOWERS: 'SET_TOWERS',
  ADD_TOWER: 'ADD_TOWER',
  REMOVE_TOWER: 'REMOVE_TOWER',
  UPGRADE_TOWER: 'UPGRADE_TOWER',
  SET_ENEMIES: 'SET_ENEMIES',
  ADD_ENEMY: 'ADD_ENEMY',
  MOVE_ENEMY: 'MOVE_ENEMY',
  SET_SELECTED_TOWER: 'SET_SELECTED_TOWER',
  SET_GAME_COINS: 'SET_GAME_COINS',
  DECREMENT_LIVES: 'DECREMENT_LIVES',
  RESET_GAME: 'RESET_GAME',
  SET_GAME_OVER: 'SET_GAME_OVER',
  ADD_BARRIER: 'ADD_BARRIER',
  REMOVE_BARRIER: 'REMOVE_BARRIER',
  DAMAGE_BARRIER: 'DAMAGE_BARRIER',
  SET_BARRIERS: 'SET_BARRIERS',
  ADD_FIGHTER: 'ADD_FIGHTER',
  REMOVE_FIGHTER: 'REMOVE_FIGHTER',
  DAMAGE_FIGHTER: 'DAMAGE_FIGHTER',
  SET_FIGHTERS: 'SET_FIGHTERS',
}

const ENEMY_TYPES = [
  {
    name: 'basic',
    health: 70,
    speed: 0.4,
    reward: 10,
  },
  {
    name: 'tank',
    health: 150,
    speed: 0.5,
    reward: 25,
  },
  {
    name: 'fast',
    health: 80,
    speed: 1.0,
    reward: 15,
  },
  { name: 'archer',
    health: 60,
    speed: 0.8,
    reward: 20,
    shootRange: 120,
    shootDamage: 8
  },
  { name: 'elite_archer',
    health: 90,
    speed: 0.6,
    reward: 35,
    shootRange: 150,
    shootDamage: 12
  },
]

export default {
  namespaced: true,
  state() {
    return {
      level: {
        routes: [],
        towerPositions: [],
      },
      towers: [],
      enemies: [],
      barriers: [],
      fighters: [],
      selectedTower: null,
      coins: 150,
      isGameOver: false,
    }
  },
  getters: {
    getLevel: (state) => state.level,
    getTowers: (state) => state.towers,
    getEnemies: (state) => state.enemies,
    getSelectedTower: (state) => state.selectedTower,
    getCoins: (state) => state.coins,
    getTowerPositions: (state) => state.level.towerPositions,
    isGameOver: (state) => state.isGameOver,
    getBarriers: (state) => state.barriers,
    getFighters: (state) => state.fighters,
  },
  mutations: {
    [MUTATIONS.SET_LEVEL]: (state, payload) => {
      state.level = payload
    },
    [MUTATIONS.SET_TOWERS]: (state, payload) => {
      state.towers = payload
    },
    [MUTATIONS.ADD_TOWER]: (state, payload) => {
      state.towers.push(payload)
    },
    [MUTATIONS.REMOVE_TOWER]: (state, payload) => {
      state.towers = state.towers.filter((t) => t.id !== payload)
    },
    [MUTATIONS.UPGRADE_TOWER]: (state, payload) => {
      const tower = state.towers.find((t) => t.id === payload.id)
      if (tower) {
        Object.assign(tower, payload.upgrades)
      }
    },
    [MUTATIONS.SET_ENEMIES]: (state, payload) => {
      state.enemies = payload
    },
    [MUTATIONS.ADD_ENEMY]: (state, payload) => {
      if (!payload) return;
      const typeData = ENEMY_TYPES.find(t => t.name === payload.type) || ENEMY_TYPES[0]
      const enemy = {
        id: Date.now() + Math.random(),
        x: payload.x,
        y: payload.y,
        type: payload.type || 'basic',
        health: payload.health || typeData.health,
        maxHealth: typeData.health,
        speed: typeData.speed|| 0.2,
        routeId: payload.routeId || 1,
        currentPointIndex: payload.currentPointIndex ?? 0,
        reward: typeData.reward,
        shootRange: typeData.shootRange || 0,
        shootDamage: typeData.shootDamage || 0,
      }
      state.enemies.push(enemy)
    },
    [MUTATIONS.MOVE_ENEMY]: (state, payload) => {
      const enemy = state.enemies.find((e) => e.id === payload.id)
      if (enemy) {
        enemy.x = payload.x
        enemy.y = payload.y
      }
    },
    [MUTATIONS.SET_SELECTED_TOWER]: (state, payload) => {
      state.selectedTower = payload
    },
    [MUTATIONS.SET_GAME_COINS]: (state, payload) => {
      state.coins = payload
    },
    [MUTATIONS.SET_GAME_OVER]: (state) => {
      state.isGameOver = true
    },
    [MUTATIONS.RESET_GAME]: (state) => {
      state.level = { routes: [], towerPositions: [] }
      state.towers = []
      state.enemies = []
      state.barriers = []
      state.fighters = []
      state.selectedTower = null
      state.coins = 150
      state.isGameOver = false
    },
    [MUTATIONS.ADD_BARRIER]: (state, payload) => {
      state.barriers.push(payload)
    },
    [MUTATIONS.REMOVE_BARRIER]: (state, id) => {
      state.barriers = state.barriers.filter(b => b.id !== id)
    },
    [MUTATIONS.DAMAGE_BARRIER]: (state, { id, damage }) => {
      const b = state.barriers.find(b => b.id === id)
      if (b) b.health -= damage
    },
    [MUTATIONS.SET_BARRIERS]: (state, payload) => {
      state.barriers = payload
    },
    [MUTATIONS.ADD_FIGHTER]: (state, payload) => {
      state.fighters.push(payload)
    },
    [MUTATIONS.REMOVE_FIGHTER]: (state, id) => {
      state.fighters = state.fighters.filter(f => f.id !== id)
    },
    [MUTATIONS.DAMAGE_FIGHTER]: (state, { id, damage }) => {
      const f = state.fighters.find(f => f.id === id)
      if (f) f.health -= damage
    },
    [MUTATIONS.SET_FIGHTERS]: (state, payload) => {
      state.fighters = payload
    },
  },
  actions: {
    setLevel({ commit }, payload) {
      commit(MUTATIONS.SET_LEVEL, payload)
    },
    addTower({ commit, state }, towerData) {
      const cost = towerData.cost || 50
      if (state.coins >= cost) {
        const tower = {
          id: Date.now(),
          x: towerData.x,
          y: towerData.y,
          damage: towerData.damage || 10,
          health: towerData.health || 100,
          fireRate: towerData.fireRate || 1000,
          range: towerData.range || 150,
          level: 1,
          cost: cost,
        }
        commit(MUTATIONS.ADD_TOWER, tower)
        commit(MUTATIONS.SET_GAME_COINS, state.coins - cost)
      }
    },
    removeTower({ commit, state }, towerId) {
      commit(MUTATIONS.REMOVE_TOWER, towerId)
      commit(MUTATIONS.SET_GAME_COINS, state.coins + 25)
    },
    upgradeTower({ commit, state }, { towerId, upgradeType }) {
      const tower = state.towers.find((t) => t.id === towerId)
      if (!tower) {
        console.warn('Такой башни нет:', towerId)
        return
      }

      const upgradeCost = tower.level * 30
      if (state.coins < upgradeCost) return

      const upgrades = {}
      if (upgradeType === 'damage') {
        upgrades.damage = tower.damage + 5
      } else if (upgradeType === 'health') {
        upgrades.health = tower.health + 20
      } else if (upgradeType === 'fireRate') {
        upgrades.fireRate = Math.max(200, tower.fireRate - 100)
      } else if (upgradeType === 'range') {
        upgrades.range = tower.range + 20
      }

      upgrades.level = tower.level + 1
      commit(MUTATIONS.UPGRADE_TOWER, { id: towerId, upgrades })
      commit(MUTATIONS.SET_GAME_COINS, state.coins - upgradeCost)
    },
    addEnemy({ commit }, enemy) {
      commit(MUTATIONS.ADD_ENEMY, enemy)
    },
    moveEnemy({ commit }, { enemyId, x, y }) {
      commit(MUTATIONS.MOVE_ENEMY, { id: enemyId, x, y })
    },
    selectTower({ commit }, tower) {
      commit(MUTATIONS.SET_SELECTED_TOWER, tower)
    },
    setEnemies({ commit }, enemies) {
      commit(MUTATIONS.SET_ENEMIES, enemies)
    },
    addCoins({ commit, state }, amount) {
      commit(MUTATIONS.SET_GAME_COINS, state.coins + amount)
    },

    setGameOver({ commit }) {
      commit(MUTATIONS.SET_GAME_OVER)
    },
    resetGame({ commit }) {
      commit(MUTATIONS.RESET_GAME)
    },
    addBarrier({ commit, state }, { x, y }) {
      const cost = 30
      if (state.coins >= cost) {
        commit(MUTATIONS.ADD_BARRIER, {
          id: Date.now() + Math.random(),
          x, y,
          health: 200,
          maxHealth: 200,
          cost
        })
        commit(MUTATIONS.SET_GAME_COINS, state.coins - cost)
      }
    },
    removeBarrier({ commit, state }, barrierId) {
      commit(MUTATIONS.REMOVE_BARRIER, barrierId)
      commit(MUTATIONS.SET_GAME_COINS, state.coins + 15)
    },
    setBarriers({ commit }, barriers) {
      commit(MUTATIONS.SET_BARRIERS, barriers)
    },
    addFighter({ commit, state }, routeId = 1) {
      const cost = 40
      if (state.coins >= cost) {
        const route = state.level.routes.find(r => r.id === routeId)
        if (!route || !route.points || route.points.length === 0) return
        
        const startPoint = route.points[route.points.length - 1]
        
        commit(MUTATIONS.ADD_FIGHTER, {
          id: Date.now() + Math.random(),
          x: startPoint.x,
          y: startPoint.y,
          health: 100,
          maxHealth: 100,
          damage: 5,
          speed: 1.0,
          routeId,
          pointIndex: route.points.length - 1
        })
        commit(MUTATIONS.SET_GAME_COINS, state.coins - cost)
      }
    },
    removeFighter({ commit }, fighterId) {
      commit(MUTATIONS.REMOVE_FIGHTER, fighterId)
    },
    setFighters({ commit }, fighters) {
      commit(MUTATIONS.SET_FIGHTERS, fighters)
    },
    setTowers({ commit }, towers) {
      commit(MUTATIONS.SET_TOWERS, towers)
    },

    processTowerShooting({ state, commit }) {
      if (state.isGameOver) return;

      let coinsEarned = 0;
      
      const updatedEnemies = state.enemies.map(enemy => {
        let dmg = 0;
        state.towers.forEach(tower => {
          const dist = Math.sqrt((enemy.x - tower.x) ** 2 + (enemy.y - tower.y) ** 2);
          if (dist <= tower.range) dmg += tower.damage;
        });
        
        const newHealth = enemy.health - dmg;
        if (newHealth <= 0) {
          coinsEarned += enemy.reward || 10;
          return null;
        }
        return { ...enemy, health: newHealth };
      }).filter(Boolean);

      const updatedBarriers = state.barriers.map(barrier => {
        let damage = 0;
        updatedEnemies.forEach(enemy => {
          if (enemy.isBlocked) {
            const dist = Math.sqrt((enemy.x - barrier.x) ** 2 + (enemy.y - barrier.y) ** 2);
            if (dist < 45) {
              damage += 4;
            }
          }
        });
        
        const newHealth = barrier.health - damage;
        return newHealth > 0 ? { ...barrier, health: newHealth } : null;
      }).filter(Boolean);

      const updatedFighters = state.fighters.map(fighter => {
        const target = updatedEnemies.find(e => {
          const dist = Math.sqrt((fighter.x - e.x) ** 2 + (fighter.y - e.y) ** 2);
          return dist < 45;
        });

        let newFighter = { ...fighter };
        
        if (target) {
          const enemyIndex = updatedEnemies.findIndex(e => e.id === target.id);
          if (enemyIndex !== -1) {
            updatedEnemies[enemyIndex] = {
              ...updatedEnemies[enemyIndex],
              health: updatedEnemies[enemyIndex].health - fighter.damage * 0.15
            };
          }
          newFighter.health -= 2;
        }
        
        return newFighter.health > 0 ? newFighter : null;
      }).filter(Boolean);

      const finalEnemies = updatedEnemies.filter(e => e.health > 0);
      const deadEnemies = updatedEnemies.filter(e => e.health <= 0);
      deadEnemies.forEach(e => {
        coinsEarned += e.reward || 10;
      });

      commit(MUTATIONS.SET_ENEMIES, finalEnemies);
      commit(MUTATIONS.SET_FIGHTERS, updatedFighters);
      commit(MUTATIONS.SET_BARRIERS, updatedBarriers);
      
      if (coinsEarned > 0) {
        commit(MUTATIONS.SET_GAME_COINS, state.coins + coinsEarned);
      }
    },

    processEnemyMovement({ state, commit }) {
      if (state.isGameOver) return;
      if (state.enemies.length === 0) return;

      let reachedEnd = false;
      
      const updatedEnemies = state.enemies.map(enemy => {
        if (!enemy.routeId) return enemy;

        const closestBarrier = state.barriers.find(b => {
          const dx = enemy.x - b.x;
          const dy = enemy.y - b.y;
          return Math.sqrt(dx * dx + dy * dy) < 45;
        });
        if (closestBarrier) return { ...enemy, isBlocked: true };

        const hitFighter = state.fighters.find(f => {
          const dx = enemy.x - f.x;
          const dy = enemy.y - f.y;
          return Math.sqrt(dx * dx + dy * dy) < 45;
        });
        if (hitFighter) return { ...enemy, isBlocked: true };
        
        const route = state.level.routes.find(r => r.id === enemy.routeId);
        if (!route || !route.points || route.points.length === 0) return enemy;

        const nextIndex = enemy.currentPointIndex + 1;
        const nextPoint = route.points[nextIndex];

        if (!nextPoint) {
          reachedEnd = true;
          return null;
        }
        
        const dx = nextPoint.x - enemy.x;
        const dy = nextPoint.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = enemy.speed || 1.5;

        if (dist <= speed) {
          return { ...enemy, x: nextPoint.x, y: nextPoint.y, currentPointIndex: nextIndex, isBlocked: false };
        } else {
          return { ...enemy, x: enemy.x + (dx / dist) * speed, y: enemy.y + (dy / dist) * speed, currentPointIndex: enemy.currentPointIndex, isBlocked: false };
        }
      }).filter(Boolean);

      commit(MUTATIONS.SET_ENEMIES, updatedEnemies);

      if (reachedEnd) {
        commit(MUTATIONS.SET_GAME_OVER);
      }
    },

    processFighterMovement({ state, commit }) {
      if (state.isGameOver) return;
      
      if (state.fighters.length === 0) return;

      const updatedFighters = state.fighters.map(fighter => {
        if (!fighter.routeId) return fighter;

        const hitBarrier = state.barriers.find(b => {
          const dx = fighter.x - b.x;
          const dy = fighter.y - b.y;
          return Math.sqrt(dx * dx + dy * dy) < 45;
        });
        if (hitBarrier) {
          return { ...fighter, isBlocked: true };
        }

        const hitEnemy = state.enemies.find(e => {
          const dx = fighter.x - e.x;
          const dy = fighter.y - e.y;
          return Math.sqrt(dx * dx + dy * dy) < 45;
        });
        if (hitEnemy) {
          return { ...fighter, isBlocked: true };
        }

        const route = state.level.routes.find(r => r.id === fighter.routeId);
        if (!route || !route.points || route.points.length === 0) return fighter;

        const prevIndex = fighter.pointIndex - 1;
        const prevPoint = route.points[prevIndex];

        if (!prevPoint || prevIndex < 0) {
          return null;
        }

        const dx = prevPoint.x - fighter.x;
        const dy = prevPoint.y - fighter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = ((fighter.speed || 1.0) * 0.5);

        if (dist <= speed) {
          return { 
            ...fighter, 
            x: prevPoint.x, 
            y: prevPoint.y, 
            pointIndex: prevIndex, 
            isBlocked: false 
          };
        } else {
          return { 
            ...fighter, 
            x: fighter.x + (dx / dist) * speed, 
            y: fighter.y + (dy / dist) * speed, 
            pointIndex: fighter.pointIndex, 
            isBlocked: false 
          };
        }
      }).filter(Boolean);

      commit(MUTATIONS.SET_FIGHTERS, updatedFighters);
    },

    processEnemyShooting({ state, commit }) {
      if (state.isGameOver) return;

      const updatedTowers = state.towers.map(t => ({ ...t }));
      const updatedFighters = state.fighters.map(f => ({ ...f }));

      state.enemies.forEach(enemy => {
        if (!enemy.shootRange || enemy.shootRange <= 0) return;

        updatedTowers.forEach(tower => {
          const dist = Math.sqrt((enemy.x - tower.x) ** 2 + (enemy.y - tower.y) ** 2);
          if (dist <= enemy.shootRange) {
            tower.health -= enemy.shootDamage;
          }
        });

        updatedFighters.forEach(fighter => {
          const dist = Math.sqrt((enemy.x - fighter.x) ** 2 + (enemy.y - fighter.y) ** 2);
          if (dist <= enemy.shootRange) {
            fighter.health -= enemy.shootDamage;
          }
        });
      });

      const finalTowers = updatedTowers.filter(t => t.health > 0);
      const finalFighters = updatedFighters.filter(f => f.health > 0);

      const towersChanged = finalTowers.length !== state.towers.length || 
                            updatedTowers.some((t, i) => t.health !== state.towers[i]?.health);
      const fightersChanged = finalFighters.length !== state.fighters.length || 
                              updatedFighters.some((f, i) => f.health !== state.fighters[i]?.health);

      if (towersChanged) {
        commit(MUTATIONS.SET_TOWERS, finalTowers);
      }
      if (fightersChanged) {
        commit(MUTATIONS.SET_FIGHTERS, finalFighters);
      }
    },

    processArtilleryFire({ state, commit }, { x, y, cost, radius, damage }) {
      if (state.coins < cost) {
        return false;
      }

      commit(MUTATIONS.SET_GAME_COINS, state.coins - cost);

      let coinsEarned = 0;

      const updatedEnemies = state.enemies.map(enemy => {
        const dx = enemy.x - x;
        const dy = enemy.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= radius) {
          const damageFactor = 1 - (dist / radius);
          const actualDamage = Math.floor(damage * damageFactor);
          enemy.health -= actualDamage;
        }

        if (enemy.health <= 0) {
          coinsEarned += enemy.reward || 10;
          return null;
        }
        return enemy.health > 0 ? enemy : null;
      }).filter(Boolean);

      const updatedFighters = state.fighters.map(fighter => {
        const dx = fighter.x - x;
        const dy = fighter.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= radius) {
          const damageFactor = 1 - (dist / radius);
          const actualDamage = Math.floor(damage * damageFactor);
          fighter.health -= actualDamage;
        }
        return fighter.health > 0 ? fighter : null;
      }).filter(Boolean);

      commit(MUTATIONS.SET_ENEMIES, updatedEnemies);
      commit(MUTATIONS.SET_FIGHTERS, updatedFighters);

      if (coinsEarned > 0) {
        commit(MUTATIONS.SET_GAME_COINS, state.coins + coinsEarned);
      }

      return true;
    },
  },
}