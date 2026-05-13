const MUTATIONS = {
  SET_X_COORD: 'SET_X_COORD',
  SET_Y_COORD: 'SET_Y_COORD',
  SET_POINTS: 'SET_POINTS',
  SET_GAME_STATUS: 'SET_GAME_STATUS',
  SET_PAUSE: 'SET_PAUSE',
  PUSH_BULLET: 'PUSH_BULLET',
  PUSH_ENEMY_BULLET: 'PUSH_ENEMY_BULLET',
  PUSH_ENEMY: 'PUSH_ENEMY',
  DELETE_BULLET: 'DELETE_BULLET',
  DELETE_ENEMY_BULLET: 'DELETE_ENEMY_BULLET',
  DELETE_ENEMY: 'DELETE_ENEMY'
}

const HITBOXES= {
  player: 40,
  enemy: 26,
  bullet: 14
}

export default {
  namespaced: true,
  state () {
    return {
      coords: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      },
      points: 0,
      health: 100,
      damage: 10,
      mana: 0,
      manaLimit: 25,
      bullets: [],
      enemyBullets: [],
      enemies: [],
      gameStatus: true,
      pause: false
    }
  },
  getters: {
    getCoords: (state) => state.coords,
    getPoints: (state) => state.points,
    getBullets: (state) => state.bullets,
    getEnemyBullets: (state) => state.enemyBullets,
    getEnemies: (state) => state.enemies,
    getGameStatus: (state) => state.gameStatus,
    getPause: (state) => state.pause
  },
  mutations: {
    [MUTATIONS.SET_X_COORD]: (state, payload) => {
      state.coords.x = payload
    },
    [MUTATIONS.SET_Y_COORD]: (state, payload) => {
      state.coords.y = payload
    },
    [MUTATIONS.SET_POINTS]: (state, payload) => {
      state.points = payload
    },
    [MUTATIONS.SET_GAME_STATUS]: (state, payload) => {
      state.gameStatus = payload
    },
    [MUTATIONS.SET_PAUSE]: (state, payload) => {
      state.pause = payload
    },
    [MUTATIONS.PUSH_BULLET]: (state, payload) => {
      state.bullets.push(payload)
    },
    [MUTATIONS.PUSH_ENEMY_BULLET]: (state, payload) => {
      state.enemyBullets.push(payload)
    },
    [MUTATIONS.PUSH_ENEMY]: (state, payload) => {
      state.enemies.push(payload)
    },
    [MUTATIONS.DELETE_BULLET]: (state, payload) => {
      state.bullets = state.bullets.filter(bullet => bullet.id !== payload)
    },
    [MUTATIONS.DELETE_ENEMY_BULLET]: (state, payload) => {
      state.enemyBullets = state.enemyBullets.filter(bullet => bullet.id !== payload)
    },
    [MUTATIONS.DELETE_ENEMY]: (state, payload) => {
      state.enemies = state.enemies.filter(enemy => enemy.id !== payload)
    }
  },
  actions: {
    pushBullet: ({ state, commit }, payload) => {
      if (!state.gameStatus || state.pause) {
        return
      }
      const dx = payload.cursorX - payload.playerX
      const dy = payload.cursorY - payload.playerY
      const length = Math.sqrt(dx * dx + dy * dy)
      const vx = (dx / length) * 4
      const vy = (dy / length) * 4
      commit(MUTATIONS.PUSH_BULLET, {
        id: Math.random(),
        x: payload.playerX,
        y: payload.playerY,
        vx,
        vy
      })
    },
    pushEnemyBullet: ({ state, commit }, payload) => {
      if (!state.gameStatus || state.pause) {
        return
      }
      state.enemies.forEach(enemy => {
        if (enemy.type === "archer") {
          const dx = payload.playerX - enemy.x
          const dy = payload.playerY - enemy.y
          const length = Math.sqrt(dx * dx + dy * dy)
          const vx = (dx / length) * 4
          const vy = (dy / length) * 4
          commit(MUTATIONS.PUSH_ENEMY_BULLET, {
            id: Math.random(),
            x: enemy.x,
            y: enemy.y,
            vx,
            vy
          })
        }
      })
    },
    moveBullets: ({ state, commit }, payload) => {
      if (!state.gameStatus || state.pause) {
        return
      }
      state.bullets.forEach(bullet => {
        bullet.x += bullet.vx
        bullet.y += bullet.vy
        state.enemies.forEach(enemy => {
          const dx = bullet.x - enemy.x
          const dy = bullet.y - enemy.y
          const length = Math.sqrt(dx * dx + dy * dy)
          if (length < HITBOXES.bullet + HITBOXES.enemy) {
            enemy.hp -= state.damage
            if (enemy.hp <= 0) {
              commit(MUTATIONS.DELETE_ENEMY, enemy.id)
            }
            commit(MUTATIONS.DELETE_BULLET, bullet.id)
          }
        })
        const dxPlayer = Math.abs(bullet.x - state.coords.x)
        const dyPlayer = Math.abs(bullet.y - state.coords.y)
        const distance = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer)
        if (distance > 2000) {
          commit(MUTATIONS.DELETE_BULLET, bullet.id)
        }
      })
    },
    moveEnemyBullets: ({ state, commit }, payload) => {
      if (!state.gameStatus || state.pause) {
        return
      }
      state.enemyBullets.forEach(bullet => {
        bullet.x += bullet.vx
        bullet.y += bullet.vy
        const dx = bullet.x - state.coords.x
        const dy = bullet.y - state.coords.y
        const length = Math.sqrt(dx * dx + dy * dy)
        if (length < HITBOXES.player) {
          state.health -= 20
          commit(MUTATIONS.DELETE_ENEMY_BULLET, bullet.id)
        }
        const dxPlayer = Math.abs(bullet.x - state.coords.x)
        const dyPlayer = Math.abs(bullet.y - state.coords.y)
        const distance = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer)
        if (distance > 2000) {
          commit(MUTATIONS.DELETE_ENEMY_BULLET, bullet.id)
        }
      })
    },
    pushEnemy: ({ state, commit }, payload) => {
      if (!state.gameStatus || state.pause) {
        return
      }
      let type = "warrior"
      let hp = 20
      const typeRandomizer = Math.random()
      if (typeRandomizer > 0.75) {
        type = "archer"
        hp = 10
      }
      else if (typeRandomizer < 0.75 && typeRandomizer > 0.55) {
        type = "tank"
        hp = 40
      }
      const offset = 50 + Math.random() * 40
      const side = Math.floor(Math.random() * 4)
      let spawnX, spawnY
      if (side === 0) {
        spawnX = Math.random() * window.innerWidth + state.coords.x - window.innerWidth / 2
        spawnY = state.coords.y - window.innerHeight / 2 + offset
      }
      else if (side == 1) {
        spawnX = state.coords.x + window.innerWidth / 2 - offset
        spawnY = Math.random() * window.innerHeight + state.coords.y - window.innerHeight / 2
      }
      else if (side == 2) {
        spawnX = Math.random() * window.innerWidth + state.coords.x - window.innerWidth / 2 
        spawnY = state.coords.y + window.innerHeight / 2 - offset
      }
      else {
        spawnX = state.coords.x - window.innerWidth / 2 + offset
        spawnY = Math.random() * window.innerHeight + state.coords.y - window.innerHeight / 2
      }
      commit(MUTATIONS.PUSH_ENEMY, {
        id: Math.random(),
        x: spawnX,
        y: spawnY,
        hp: hp,
        type: type
      })
    },
    moveEnemies: ({ state, commit }, payload) => {
      if (!state.gameStatus || state.pause) {
        return
      }
      state.enemies.forEach(enemy => {
        const dx = payload.playerX - enemy.x
        const dy = payload.playerY - enemy.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const archerDistance = 400
        if (length < archerDistance && enemy.type === "archer") {
          return
        }
        if (length < HITBOXES.enemy + HITBOXES.player) {
          commit(MUTATIONS.DELETE_ENEMY, enemy.id)
          commit(MUTATIONS.SET_GAME_STATUS, false)
          state.enemies.forEach(deletedEnemy => {
            commit(MUTATIONS.DELETE_ENEMY, deletedEnemy.id)
          })
          state.bullets.forEach(deletedBullet => {
            commit(MUTATIONS.DELETE_BULLET, deletedBullet.id)
          })
          state.enemyBullets.forEach(deletedBullet => {
            commit(MUTATIONS.DELETE_ENEMY_BULLET, deletedBullet.id)
          })
          commit(MUTATIONS.SET_X_COORD, window.innerWidth / 2)
          commit(MUTATIONS.SET_Y_COORD, window.innerHeight / 2)
        }
        else {
          const vx = (dx / length) * 6
          const vy = (dy / length) * 6
          enemy.x += vx
          enemy.y += vy
        }
      })
    },
    moveLeft: ({ state, commit }, payload) => {
      commit(MUTATIONS.SET_X_COORD, state.coords.x - 20)
    },
    moveRight: ({ state, commit }, payload) => {
      commit(MUTATIONS.SET_X_COORD, state.coords.x + 20)
    },
    moveUp: ({ state, commit }, payload) => {
      commit(MUTATIONS.SET_Y_COORD, state.coords.y - 20)
    },
    moveDown: ({ state, commit }, payload) => {
      commit(MUTATIONS.SET_Y_COORD, state.coords.y + 20)
    },
    addPoints: ({ commit, state }, payload) => {
      commit(MUTATIONS.SET_POINTS, state.points + payload)
    },
    setGameStatus: ({ commit }, payload) => {
      commit(MUTATIONS.SET_GAME_STATUS, payload)
    },
    setPause: ({ commit }, payload) => {
      commit(MUTATIONS.SET_PAUSE, payload)
    }
  }
}
