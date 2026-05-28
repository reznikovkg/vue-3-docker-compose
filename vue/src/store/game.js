const MUTATIONS = {
  SET_X_COORD: 'SET_X_COORD',
  SET_Y_COORD: 'SET_Y_COORD',
  SET_POINTS: 'SET_POINTS',
  SET_HEALTH: 'SET_HEALTH',
  SET_HEALTH_LIMIT: 'SET_HEALTH_LIMIT',
  SET_DAMAGE: 'SET_DAMAGE',
  SET_MANA: 'SET_MANA',
  SET_MANA_LIMIT: 'SET_MANA_LIMIT',
  SET_SPEED: 'SET_SPEED',
  SET_MEGA_SHOT: 'SET_MEGA_SHOT',
  SET_AREA_SHOT: 'SET_AREA_SHOT',
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
      healthLimit: 100,
      damage: 10,
      mana: 25,
      manaLimit: 25,
      speed: 20,
      bullets: [],
      enemyBullets: [],
      enemies: [],
      megaShot: null,
      areaShot: null,
      gameStatus: true,
      pause: false
    }
  },
  getters: {
    getCoords: (state) => state.coords,
    getPoints: (state) => state.points,
    getHealth: (state) => state.health,
    getHealthLimit: (state) => state.healthLimit,
    getDamage: (state) => state.damage,
    getMana: (state) => state.mana,
    getManaLimit: (state) => state.manaLimit,
    getSpeed: (state) => state.speed,
    getBullets: (state) => state.bullets,
    getEnemyBullets: (state) => state.enemyBullets,
    getEnemies: (state) => state.enemies,
    getMegaShot: (state) => state.megaShot,
    getAreaShot: (state) => state.areaShot,
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
    [MUTATIONS.SET_HEALTH]: (state, payload) => {
      state.health = payload
    },
    [MUTATIONS.SET_HEALTH_LIMIT]: (state, payload) => {
      state.healthLimit = payload
    },
    [MUTATIONS.SET_DAMAGE]: (state, payload) => {
      state.damage = payload
    },
    [MUTATIONS.SET_MANA]: (state, payload) => {
      state.mana = payload
    },
    [MUTATIONS.SET_MANA_LIMIT]: (state, payload) => {
      state.manaLimit = payload
    },
    [MUTATIONS.SET_SPEED]: (state, payload) => {
      state.speed = payload
    },
    [MUTATIONS.SET_MEGA_SHOT]: (state, payload) => {
      state.megaShot = payload
    },
    [MUTATIONS.SET_AREA_SHOT]: (state, payload) => {
      state.areaShot = payload
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
              commit(MUTATIONS.SET_POINTS, state.points + 5)
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
          if (state.health <= 0) {
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
            commit(MUTATIONS.SET_POINTS, 0)
            commit(MUTATIONS.SET_HEALTH, 100)
            commit(MUTATIONS.SET_HEALTH_LIMIT, 100)
            commit(MUTATIONS.SET_DAMAGE, 10)
            commit(MUTATIONS.SET_MANA, 25)
            commit(MUTATIONS.SET_MANA_LIMIT, 25)
            commit(MUTATIONS.SET_MEGA_SHOT, null)
            commit(MUTATIONS.SET_AREA_SHOT, null)
          }
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
      let speed = 5
      const typeRandomizer = Math.random()
      if (typeRandomizer > 0.75) {
        type = "archer"
        hp = 10
        speed = 6
      }
      else if (typeRandomizer < 0.75 && typeRandomizer > 0.55) {
        type = "tank"
        hp = 40
        speed = 3
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
        type: type,
        speed,
        vx: 0,
        vy: 0,
        direction: 'up'
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
          commit(MUTATIONS.SET_POINTS, 0)
          commit(MUTATIONS.SET_HEALTH, 100)
          commit(MUTATIONS.SET_HEALTH_LIMIT, 100)
          commit(MUTATIONS.SET_DAMAGE, 10)
          commit(MUTATIONS.SET_MANA, 25)
          commit(MUTATIONS.SET_MANA_LIMIT, 25)
          commit(MUTATIONS.SET_MEGA_SHOT, null)
          commit(MUTATIONS.SET_AREA_SHOT, null)
        }
        else {
          const vx = (dx / length) * enemy.speed
          const vy = (dy / length) * enemy.speed
          enemy.x += vx
          enemy.y += vy
          enemy.vx = vx
          enemy.vy = vy
        }
      })
    },
    megaShot: ({ state, commit }, payload) => {
      if (state.mana < 25) {
        return
      }
      commit(MUTATIONS.SET_MANA, state.mana - 25)
      const dx = payload.cursorX - payload.playerX
      const dy = payload.cursorY - payload.playerY
      const length = Math.sqrt(dx * dx + dy * dy)
      const dirX = dx / length
      const dirY = dy / length
      const megaShotLength = 2000
      const endX = payload.playerX + dirX * megaShotLength
      const endY = payload.playerY + dirY * megaShotLength
      state.enemies.forEach(enemy => {
        const ex = enemy.x - payload.playerX
        const ey = enemy.y - payload.playerY
        const dot = ex * dirX + ey * dirY
        if (dot < 0 || dot > megaShotLength) {
          return
        }
        const closestX = payload.playerX + dirX * dot
        const closestY = payload.playerY + dirY * dot
        const distX = enemy.x - closestX
        const distY = enemy.y - closestY
        const distance = Math.sqrt(distX * distX + distY * distY)
        if (distance < 25) {
          commit(MUTATIONS.DELETE_ENEMY, enemy.id)
          commit(MUTATIONS.SET_POINTS, state.points + 5)
        }
      })
      commit(MUTATIONS.SET_MEGA_SHOT, {
        startX: payload.playerX,
        startY: payload.playerY,
        endX,
        endY
      })
      setTimeout(() => {
        commit(MUTATIONS.SET_MEGA_SHOT, null)
      }, 60)
    },
    areaShot: ({ state, commit }, payload) => {
      if (state.mana < 25) {
        return
      }
      commit(MUTATIONS.SET_MANA, state.mana - 25)
      const radius = 200
      state.enemies.forEach(enemy => {
        const ex = enemy.x - payload.playerX
        const ey = enemy.y - payload.playerY
        const distance = Math.sqrt(ex * ex + ey * ey)
        if (distance < radius) {
          enemy.hp -= 20
          if (enemy.hp <= 0) {
            commit(MUTATIONS.DELETE_ENEMY, enemy.id)
            commit(MUTATIONS.SET_POINTS, state.points + 5)
          }
        }
      })
      commit(MUTATIONS.SET_AREA_SHOT, {
        x: payload.playerX,
        y: payload.playerY,
        radius
      })
      setTimeout(() => {
        commit(MUTATIONS.SET_AREA_SHOT, null)
      }, 60)
    },
    buyHeal: ({ state, commit }, payload) => {
      if (state.points < 10) {
        return
      }
      commit(MUTATIONS.SET_POINTS, state.points - 10)
      const health = Math.min(state.healthLimit, state.health + 20)
      commit(MUTATIONS.SET_HEALTH, health)
    },
    increaseDamage: ({ state, commit }, payload) => {
      if (state.points < 25) {
        return
      }
      commit(MUTATIONS.SET_POINTS, state.points - 25)
      commit(MUTATIONS.SET_DAMAGE, state.damage + 10)
    },
    buyMana: ({ state, commit }, payload) => {
      if (state.points < 15) {
        return
      }
      commit(MUTATIONS.SET_POINTS, state.points - 15)
      const mana = Math.min(state.manaLimit, state.mana + 25)
      commit(MUTATIONS.SET_MANA, mana)
    },
    increaseHealthLimit: ({ state, commit }, payload) => {
      if (state.points < 20) {
        return
      }
      commit(MUTATIONS.SET_POINTS, state.points - 20)
      commit(MUTATIONS.SET_HEALTH_LIMIT, state.healthLimit + 25)
    },
    increaseManaLimit: ({ state, commit }, payload) => {
      if (state.points < 30) {
        return
      }
      commit(MUTATIONS.SET_POINTS, state.points - 30)
      commit(MUTATIONS.SET_MANA_LIMIT, state.manaLimit + 25)
    },
    increaseSpeed: ({ state, commit }, payload) => {
      if (state.points < 15) {
        return
      }
      commit(MUTATIONS.SET_POINTS, state.points - 15)
      commit(MUTATIONS.SET_SPEED, state.speed + 10)
    },
    moveLeft: ({ state, commit }, payload) => {
      const step = state.speed
      commit(MUTATIONS.SET_X_COORD, state.coords.x - step)
    },
    moveRight: ({ state, commit }, payload) => {
      const step = state.speed
      commit(MUTATIONS.SET_X_COORD, state.coords.x + step)
    },
    moveUp: ({ state, commit }, payload) => {
      const step = state.speed
      commit(MUTATIONS.SET_Y_COORD, state.coords.y - step)
    },
    moveDown: ({ state, commit }, payload) => {
      const step = state.speed
      commit(MUTATIONS.SET_Y_COORD, state.coords.y + step)
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
