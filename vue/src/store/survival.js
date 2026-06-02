const MUTATIONS = {
  SET_KEY: 'SET_KEY',
  SET_MOUSE: 'SET_MOUSE',
  SET_VIEWPORT: 'SET_VIEWPORT',
  SET_PAUSE: 'SET_PAUSE',
  RESET_GAME: 'RESET_GAME',
  RUN_FRAME: 'RUN_FRAME',
  BUY_HEAL: 'BUY_HEAL',
  BUY_DAMAGE: 'BUY_DAMAGE',
  BUY_MANA: 'BUY_MANA',
  BUY_MAX_HP: 'BUY_MAX_HP',
  BUY_MAX_MANA: 'BUY_MAX_MANA',
  USE_AREA_DAMAGE: 'USE_AREA_DAMAGE',
  USE_DEATH_SHOT: 'USE_DEATH_SHOT'
}

const getDefaultState = () => ({
  survivor: {
    x: 0,
    y: 0,
    size: 30,
    speed: 260,
    hp: 100,
    maxHp: 100,
    mana: 0,
    maxMana: 100,
    manaRegen: 10,
    damage: 20,
    coins: 0,
    fireDelay: 250,
    lastShot: 0,
    projectileSpeed: 620
  },

  camera: {
    x: 0,
    y: 0
  },

  viewport: {
    width: window.innerWidth,
    height: window.innerHeight
  },

  mouse: {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  },

  pressedKeys: {},

  projectiles: [],
  enemyProjectiles: [],
  monsters: [],
  effects: [],

  nextProjectileId: 1,
  nextMonsterId: 1,
  nextEffectId: 1,

  paused: false,
  gameOver: false,

  survivalTime: 0,
  monsterLastSpawn: 0,
  monsterSpawnDelay: 900,

  prices: {
    heal: 5,
    damage: 10,
    mana: 5,
    maxHp: 15,
    maxMana: 15
  }
})

const getDistance = (x1, y1, x2, y2) => {
  const vectorX = x1 - x2
  const vectorY = y1 - y2

  return Math.sqrt(vectorX * vectorX + vectorY * vectorY)
}

const createPlayerProjectile = (state, damage, speed, size, isStrong) => {
  const targetX = state.camera.x + state.mouse.x
  const targetY = state.camera.y + state.mouse.y

  const vectorX = targetX - state.survivor.x
  const vectorY = targetY - state.survivor.y
  const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY)

  if (distance === 0) {
    return
  }

  state.projectiles.push({
    id: state.nextProjectileId,
    x: state.survivor.x,
    y: state.survivor.y,
    size,
    damage,
    isStrong,
    speedX: vectorX / distance * speed,
    speedY: vectorY / distance * speed
  })

  state.nextProjectileId += 1
}

const getMonsterSettings = (type) => {
  const settings = {
    basic: {
      hp: 40,
      speed: 90,
      size: 28,
      damage: 10,
      coins: 2,
      range: 0,
      shotDelay: 0
    },

    fast: {
      hp: 25,
      speed: 150,
      size: 22,
      damage: 8,
      coins: 3,
      range: 0,
      shotDelay: 0
    },

    tank: {
      hp: 120,
      speed: 55,
      size: 42,
      damage: 20,
      coins: 6,
      range: 0,
      shotDelay: 0
    },

    ranged: {
      hp: 55,
      speed: 70,
      size: 30,
      damage: 12,
      coins: 5,
      range: 380,
      shotDelay: 1300
    }
  }

  return settings[type]
}

const getRandomMonsterType = () => {
  const random = Math.random()

  if (random < 0.5) {
    return 'basic'
  }

  if (random < 0.7) {
    return 'fast'
  }

  if (random < 0.9) {
    return 'tank'
  }

  return 'ranged'
}

const getSpawnPosition = (state) => {
  const side = Math.floor(Math.random() * 4)
  const margin = 120

  if (side === 0) {
    return {
      x: state.camera.x + Math.random() * state.viewport.width,
      y: state.camera.y - margin
    }
  }

  if (side === 1) {
    return {
      x: state.camera.x + state.viewport.width + margin,
      y: state.camera.y + Math.random() * state.viewport.height
    }
  }

  if (side === 2) {
    return {
      x: state.camera.x + Math.random() * state.viewport.width,
      y: state.camera.y + state.viewport.height + margin
    }
  }

  return {
    x: state.camera.x - margin,
    y: state.camera.y + Math.random() * state.viewport.height
  }
}

const removeDeadMonsters = (state) => {
  state.monsters = state.monsters.filter((monster) => {
    if (monster.hp <= 0) {
      state.survivor.coins += monster.coins
      return false
    }

    return true
  })
}

export default {
  namespaced: true,

  state() {
    return getDefaultState()
  },

  getters: {
    getSurvivorScreen: (state) => ({
      x: state.viewport.width / 2,
      y: state.viewport.height / 2
    }),

    getStatus: (state) => ({
      hp: Math.ceil(state.survivor.hp),
      maxHp: state.survivor.maxHp,
      mana: Math.floor(state.survivor.mana),
      maxMana: state.survivor.maxMana,
      damage: state.survivor.damage,
      coins: state.survivor.coins,
      time: Math.floor(state.survivalTime)
    }),

    getPrices: (state) => state.prices,

    getPaused: (state) => state.paused,

    getGameOver: (state) => state.gameOver,

    getScreenProjectiles: (state) => state.projectiles.map((projectile) => ({
      ...projectile,
      screenX: projectile.x - state.camera.x,
      screenY: projectile.y - state.camera.y
    })),

    getScreenEnemyProjectiles: (state) => state.enemyProjectiles.map((projectile) => ({
      ...projectile,
      screenX: projectile.x - state.camera.x,
      screenY: projectile.y - state.camera.y
    })),

    getScreenMonsters: (state) => state.monsters.map((monster) => ({
      ...monster,
      screenX: monster.x - state.camera.x,
      screenY: monster.y - state.camera.y
    })),

    getScreenEffects: (state) => state.effects.map((effect) => ({
      ...effect,
      style: {
        width: `${effect.radius * 2}px`,
        height: `${effect.radius * 2}px`,
        transform: `translateX(${effect.x - state.camera.x}px) translateY(${effect.y - state.camera.y}px) translate(-50%, -50%)`
      }
    }))
  },

  mutations: {
    [MUTATIONS.SET_KEY]: (state, payload) => {
      state.pressedKeys[payload.key] = payload.value
    },

    [MUTATIONS.SET_MOUSE]: (state, payload) => {
      state.mouse.x = payload.x
      state.mouse.y = payload.y
    },

    [MUTATIONS.SET_VIEWPORT]: (state, payload) => {
      state.viewport.width = payload.width
      state.viewport.height = payload.height
    },

    [MUTATIONS.SET_PAUSE]: (state) => {
      if (!state.gameOver) {
        state.paused = !state.paused
      }
    },

    [MUTATIONS.RESET_GAME]: (state) => {
      Object.assign(state, getDefaultState())
    },

    [MUTATIONS.BUY_HEAL]: (state) => {
      if (state.survivor.coins >= state.prices.heal) {
        state.survivor.coins -= state.prices.heal
        state.survivor.hp += 30

        if (state.survivor.hp > state.survivor.maxHp) {
          state.survivor.hp = state.survivor.maxHp
        }
      }
    },

    [MUTATIONS.BUY_DAMAGE]: (state) => {
      if (state.survivor.coins >= state.prices.damage) {
        state.survivor.coins -= state.prices.damage
        state.survivor.damage += 5
      }
    },

    [MUTATIONS.BUY_MANA]: (state) => {
      if (state.survivor.coins >= state.prices.mana) {
        state.survivor.coins -= state.prices.mana
        state.survivor.mana += 40

        if (state.survivor.mana > state.survivor.maxMana) {
          state.survivor.mana = state.survivor.maxMana
        }
      }
    },

    [MUTATIONS.BUY_MAX_HP]: (state) => {
      if (state.survivor.coins >= state.prices.maxHp) {
        state.survivor.coins -= state.prices.maxHp
        state.survivor.maxHp += 20
        state.survivor.hp += 20
      }
    },

    [MUTATIONS.BUY_MAX_MANA]: (state) => {
      if (state.survivor.coins >= state.prices.maxMana) {
        state.survivor.coins -= state.prices.maxMana
        state.survivor.maxMana += 20
        state.survivor.mana += 20
      }
    },

    [MUTATIONS.USE_AREA_DAMAGE]: (state) => {
      const cost = 40
      const radius = 180
      const damage = 80

      if (state.paused || state.gameOver || state.survivor.mana < cost) {
        return
      }

      state.survivor.mana -= cost

      state.monsters.forEach((monster) => {
        const distance = getDistance(monster.x, monster.y, state.survivor.x, state.survivor.y)

        if (distance <= radius) {
          monster.hp -= damage
        }
      })

      state.effects.push({
        id: state.nextEffectId,
        x: state.survivor.x,
        y: state.survivor.y,
        radius,
        time: 0.25
      })

      state.nextEffectId += 1
      removeDeadMonsters(state)
    },

    [MUTATIONS.USE_DEATH_SHOT]: (state) => {
      const cost = 60

      if (state.paused || state.gameOver || state.survivor.mana < cost) {
        return
      }

      state.survivor.mana -= cost
      createPlayerProjectile(state, 999, 900, 22, true)
    },

    [MUTATIONS.RUN_FRAME]: (state, payload) => {
      if (state.paused || state.gameOver) {
        return
      }

      const deltaTime = payload.deltaTime
      const currentTime = payload.currentTime

      state.camera.x = state.survivor.x - state.viewport.width / 2
      state.camera.y = state.survivor.y - state.viewport.height / 2

      let vectorX = 0
      let vectorY = 0

      if (state.pressedKeys.ArrowUp) {
        vectorY -= 1
      }

      if (state.pressedKeys.ArrowDown) {
        vectorY += 1
      }

      if (state.pressedKeys.ArrowLeft) {
        vectorX -= 1
      }

      if (state.pressedKeys.ArrowRight) {
        vectorX += 1
      }

      const moveDistance = Math.sqrt(vectorX * vectorX + vectorY * vectorY)

      if (moveDistance > 0) {
        state.survivor.x += vectorX / moveDistance * state.survivor.speed * deltaTime
        state.survivor.y += vectorY / moveDistance * state.survivor.speed * deltaTime
      }

      state.survivor.mana += state.survivor.manaRegen * deltaTime

      if (state.survivor.mana > state.survivor.maxMana) {
        state.survivor.mana = state.survivor.maxMana
      }

      if (currentTime - state.survivor.lastShot >= state.survivor.fireDelay) {
        createPlayerProjectile(state, state.survivor.damage, state.survivor.projectileSpeed, 10, false)
        state.survivor.lastShot = currentTime
      }

      if (currentTime - state.monsterLastSpawn >= state.monsterSpawnDelay) {
        const type = getRandomMonsterType()
        const settings = getMonsterSettings(type)
        const position = getSpawnPosition(state)

        state.monsters.push({
          id: state.nextMonsterId,
          type,
          x: position.x,
          y: position.y,
          size: settings.size,
          speed: settings.speed,
          hp: settings.hp,
          maxHp: settings.hp,
          damage: settings.damage,
          coins: settings.coins,
          range: settings.range,
          shotDelay: settings.shotDelay,
          lastShot: 0
        })

        state.nextMonsterId += 1
        state.monsterLastSpawn = currentTime
      }

      state.projectiles = state.projectiles
        .map((projectile) => ({
          ...projectile,
          x: projectile.x + projectile.speedX * deltaTime,
          y: projectile.y + projectile.speedY * deltaTime
        }))
        .filter((projectile) => (
          getDistance(projectile.x, projectile.y, state.survivor.x, state.survivor.y) < 1800
        ))

      state.enemyProjectiles = state.enemyProjectiles
        .map((projectile) => ({
          ...projectile,
          x: projectile.x + projectile.speedX * deltaTime,
          y: projectile.y + projectile.speedY * deltaTime
        }))
        .filter((projectile) => (
          getDistance(projectile.x, projectile.y, state.survivor.x, state.survivor.y) < 1800
        ))

      state.monsters = state.monsters.map((monster) => {
        const enemyVectorX = state.survivor.x - monster.x
        const enemyVectorY = state.survivor.y - monster.y
        const enemyDistance = Math.sqrt(enemyVectorX * enemyVectorX + enemyVectorY * enemyVectorY)

        if (enemyDistance === 0) {
          return monster
        }

        if (monster.type === 'ranged' && enemyDistance < monster.range) {
          return monster
        }

        return {
          ...monster,
          x: monster.x + enemyVectorX / enemyDistance * monster.speed * deltaTime,
          y: monster.y + enemyVectorY / enemyDistance * monster.speed * deltaTime
        }
      })

      state.monsters.forEach((monster) => {
        if (monster.type !== 'ranged') {
          return
        }

        const distance = getDistance(monster.x, monster.y, state.survivor.x, state.survivor.y)

        if (distance > monster.range) {
          return
        }

        if (currentTime - monster.lastShot < monster.shotDelay) {
          return
        }

        const shotVectorX = state.survivor.x - monster.x
        const shotVectorY = state.survivor.y - monster.y
        const shotDistance = Math.sqrt(shotVectorX * shotVectorX + shotVectorY * shotVectorY)

        if (shotDistance === 0) {
          return
        }

        state.enemyProjectiles.push({
          id: state.nextProjectileId,
          x: monster.x,
          y: monster.y,
          size: 9,
          damage: monster.damage,
          speedX: shotVectorX / shotDistance * 360,
          speedY: shotVectorY / shotDistance * 360
        })

        state.nextProjectileId += 1
        monster.lastShot = currentTime
      })

      state.projectiles.forEach((projectile) => {
        state.monsters.forEach((monster) => {
          const distance = getDistance(projectile.x, projectile.y, monster.x, monster.y)

          if (distance < projectile.size / 2 + monster.size / 2) {
            monster.hp -= projectile.damage

            if (!projectile.isStrong) {
              projectile.isDeleted = true
            }
          }
        })
      })

      state.projectiles = state.projectiles.filter((projectile) => !projectile.isDeleted)
      removeDeadMonsters(state)

      state.monsters.forEach((monster) => {
        const distance = getDistance(monster.x, monster.y, state.survivor.x, state.survivor.y)

        if (distance < monster.size / 2 + state.survivor.size / 2) {
          state.survivor.hp -= monster.damage * deltaTime
        }
      })

      state.enemyProjectiles = state.enemyProjectiles.filter((projectile) => {
        const distance = getDistance(projectile.x, projectile.y, state.survivor.x, state.survivor.y)

        if (distance < projectile.size / 2 + state.survivor.size / 2) {
          state.survivor.hp -= projectile.damage
          return false
        }

        return true
      })

      state.effects = state.effects
        .map((effect) => ({
          ...effect,
          time: effect.time - deltaTime
        }))
        .filter((effect) => effect.time > 0)

      if (state.survivor.hp <= 0) {
        state.survivor.hp = 0
        state.gameOver = true
        state.paused = false
      }

      state.survivalTime += deltaTime
    }
  },

  actions: {
    setKey: ({ commit }, payload) => {
      commit(MUTATIONS.SET_KEY, payload)
    },

    setMouse: ({ commit }, payload) => {
      commit(MUTATIONS.SET_MOUSE, payload)
    },

    setViewport: ({ commit }, payload) => {
      commit(MUTATIONS.SET_VIEWPORT, payload)
    },

    togglePause: ({ commit }) => {
      commit(MUTATIONS.SET_PAUSE)
    },

    restartGame: ({ commit }) => {
      commit(MUTATIONS.RESET_GAME)
    },

    runFrame: ({ commit }, payload) => new Promise((resolve) => {
      commit(MUTATIONS.RUN_FRAME, payload)
      resolve()
    }),

    buyHeal: ({ commit }) => {
      commit(MUTATIONS.BUY_HEAL)
    },

    buyDamage: ({ commit }) => {
      commit(MUTATIONS.BUY_DAMAGE)
    },

    buyMana: ({ commit }) => {
      commit(MUTATIONS.BUY_MANA)
    },

    buyMaxHp: ({ commit }) => {
      commit(MUTATIONS.BUY_MAX_HP)
    },

    buyMaxMana: ({ commit }) => {
      commit(MUTATIONS.BUY_MAX_MANA)
    },

    useAreaDamage: ({ commit }) => {
      commit(MUTATIONS.USE_AREA_DAMAGE)
    },

    useDeathShot: ({ commit }) => {
      commit(MUTATIONS.USE_DEATH_SHOT)
    }
  }
}