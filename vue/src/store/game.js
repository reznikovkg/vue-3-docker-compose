const MUTATIONS = {
  SET_PLAYER_POSITION: 'SET_PLAYER_POSITION',
  SET_KEY: 'SET_KEY',
  UPDATE_GAME_TIME: 'UPDATE_GAME_TIME',
  UPDATE_PLAYER_HEALTH: 'UPDATE_PLAYER_HEALTH',
  RESET_GAME: 'RESET_GAME',
  SET_LAST_TIME: 'SET_LAST_TIME',
  SET_WORLD_SIZE: 'SET_WORLD_SIZE',

  SET_CAMERA: 'SET_CAMERA',

  SET_MOUSE_POS: 'SET_MOUSE_POS',

  SPAWN_BULLET: 'SPAWN_BULLET',
  MOVE_BULLETS: 'MOVE_BULLETS',
  REMOVE_BULLET_IDS: 'REMOVE_BULLET_IDS',
  REMOVE_OUTSIDE_BULLETS: 'REMOVE_OUTSIDE_BULLETS',
  DEC_FIRE_COOLDOWN: 'DEC_FIRE_COOLDOWN',
  SET_FIRE_COOLDOWN: 'SET_FIRE_COOLDOWN',
  SET_NEXT_BULLET_ID: 'SET_NEXT_BULLET_ID',

  SPAWN_ENEMY: 'SPAWN_ENEMY',
  MOVE_ENEMIES: 'MOVE_ENEMIES',
  DAMAGE_ENEMY: 'DAMAGE_ENEMY',
  REMOVE_DEAD_ENEMIES: 'REMOVE_DEAD_ENEMIES',
  DEC_SPAWN_COOLDOWN: 'DEC_SPAWN_COOLDOWN',
  SET_SPAWN_COOLDOWN: 'SET_SPAWN_COOLDOWN',
  SET_NEXT_ENEMY_ID: 'SET_NEXT_ENEMY_ID',
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

const dist2 = (ax, ay, bx, by) => {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

const spawnAtViewportEdge = (state) => {
  const { width: w, height: h } = state.world
  const { x: cx, y: cy } = state.camera
  const pad = 40

  const side = Math.floor(Math.random() * 4)
  if (side === 0) 
    return { x: cx + Math.random() * w, y: cy - pad }
  if (side === 1) 
    return { x: cx + w + pad, y: cy + Math.random() * h }
  if (side === 2) 
    return { x: cx + Math.random() * w, y: cy + h + pad }
  return { x: cx - pad, y: cy + Math.random() * h }
}

export default {
  namespaced: true,

  state: {
    world: {
      width: window.innerWidth,
      height: window.innerHeight,
    },

    player: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      health: 100,
      maxHealth: 100,
      speed: 300,
      radius: 20,
    },

    camera: {
      x: 0,
      y: 0,
    },

    mouse: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    },

    bullets: [],
    nextBulletId: 1,

    enemies: [],
    nextEnemyId: 1,

    fire: {
      enabled: true,
      rate: 6,
      cooldown: 0,
      bulletSpeed: 700,
      bulletRadius: 4,
      damage: 10,
    },

    spawner: {
      enabled: true,
      rate: 1.2,
      cooldown: 0,
      enemySpeed: 120,
      enemyRadius: 16,
      enemyHp: 30,
    },

    contact: {
      dps: 25,
    },

    gameTime: 0,
    lastTimestamp: 0,

    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    },

    gameActive: true,
  },

  getters: {
    getFormattedTime: (state) => {
      const minutes = Math.floor(state.gameTime / 60)
      const seconds = Math.floor(state.gameTime % 60)
      const milliseconds = Math.floor((state.gameTime * 100) % 100)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`},
    getHealthPercent: (state) => (state.player.health / state.player.maxHealth) * 100,
  },

  mutations: {
    [MUTATIONS.SET_WORLD_SIZE]: (state, { width, height }) => {
      state.world.width = width
      state.world.height = height
    },

    [MUTATIONS.SET_PLAYER_POSITION]: (state, { x, y }) => {
      state.player.x = x
      state.player.y = y
    },

    [MUTATIONS.SET_CAMERA]: (state, { x, y }) => {
      state.camera.x = x
      state.camera.y = y
    },

    [MUTATIONS.SET_KEY]: (state, { key, isPressed }) => {
      if (key in state.keys) 
        state.keys[key] = isPressed
    },

    [MUTATIONS.SET_MOUSE_POS]: (state, { x, y }) => {
      state.mouse.x = clamp(x, 0, state.world.width)
      state.mouse.y = clamp(y, 0, state.world.height)
    },

    [MUTATIONS.UPDATE_GAME_TIME]: (state, dt) => {
      if (state.gameActive) 
        state.gameTime += dt
    },

    [MUTATIONS.UPDATE_PLAYER_HEALTH]: (state, newHealth) => {
      state.player.health = Math.max(0, Math.min(state.player.maxHealth, newHealth))
      if (state.player.health <= 0) 
        state.gameActive = false
    },

    [MUTATIONS.RESET_GAME]: (state) => {
      state.player.x = state.world.width / 2
      state.player.y = state.world.height / 2
      state.player.health = state.player.maxHealth

      state.mouse.x = state.world.width / 2
      state.mouse.y = state.world.height / 2

      state.camera.x = state.player.x - state.world.width / 2
      state.camera.y = state.player.y - state.world.height / 2

      state.bullets = []
      state.nextBulletId = 1

      state.enemies = []
      state.nextEnemyId = 1

      state.fire.cooldown = 0
      state.spawner.cooldown = 0

      state.gameTime = 0
      state.gameActive = true
      state.lastTimestamp = 0

      for (const k in state.keys) 
        state.keys[k] = false
    },

    [MUTATIONS.SET_LAST_TIME]: (state, timestamp) => {
      state.lastTimestamp = timestamp
    },

    [MUTATIONS.SPAWN_BULLET]: (state, bullet) => {
      state.bullets.push(bullet)
    },

    [MUTATIONS.MOVE_BULLETS]: (state, dt) => {
      for (const b of state.bullets) {
        b.x += b.vx * dt
        b.y += b.vy * dt
      }
    },

    [MUTATIONS.REMOVE_BULLET_IDS]: (state, ids) => {
      if (!ids || ids.length === 0) 
        return
      const set = new Set(ids)
      state.bullets = state.bullets.filter((b) => !set.has(b.id))
    },

    [MUTATIONS.REMOVE_OUTSIDE_BULLETS]: (state) => {
      const pad = 60
      const w = state.world.width
      const h = state.world.height
      const cx = state.camera.x
      const cy = state.camera.y
      state.bullets = state.bullets.filter((b) => {
        const sx = b.x - cx
        const sy = b.y - cy
        return sx > -pad && sx < w + pad && sy > -pad && sy < h + pad
      })
    },

    [MUTATIONS.DEC_FIRE_COOLDOWN]: (state, dt) => {
      state.fire.cooldown = Math.max(0, state.fire.cooldown - dt)
    },

    [MUTATIONS.SET_FIRE_COOLDOWN]: (state, value) => {
      state.fire.cooldown = Math.max(0, value)
    },

    [MUTATIONS.SET_NEXT_BULLET_ID]: (state, value) => {
      state.nextBulletId = value
    },

    [MUTATIONS.SPAWN_ENEMY]: (state, enemy) => {
      state.enemies.push(enemy)
    },

    [MUTATIONS.MOVE_ENEMIES]: (state, dt) => {
      const px = state.player.x
      const py = state.player.y

      for (const e of state.enemies) {
        const dx = px - e.x
        const dy = py - e.y
        const len = Math.hypot(dx, dy) || 1
        const nx = dx / len
        const ny = dy / len

        e.x += nx * e.speed * dt
        e.y += ny * e.speed * dt
      }
    },

    [MUTATIONS.DAMAGE_ENEMY]: (state, { id, damage }) => {
      const e = state.enemies.find((x) => x.id === id)
      if (!e) 
        return
      e.hp -= damage
    },

    [MUTATIONS.REMOVE_DEAD_ENEMIES]: (state) => {
      state.enemies = state.enemies.filter((e) => e.hp > 0)
    },

    [MUTATIONS.DEC_SPAWN_COOLDOWN]: (state, dt) => {
      state.spawner.cooldown = Math.max(0, state.spawner.cooldown - dt)
    },

    [MUTATIONS.SET_SPAWN_COOLDOWN]: (state, value) => {
      state.spawner.cooldown = Math.max(0, value)
    },

    [MUTATIONS.SET_NEXT_ENEMY_ID]: (state, value) => {
      state.nextEnemyId = value
    },
  },

  actions: {
    handleKeyDown: ({ commit }, event) => {
      commit(MUTATIONS.SET_KEY, { key: event.key, isPressed: true })
    },

    handleKeyUp: ({ commit }, event) => {
      commit(MUTATIONS.SET_KEY, { key: event.key, isPressed: false })
    },

    setMousePosition: ({ commit }, pos) => {
      commit(MUTATIONS.SET_MOUSE_POS, pos)
    },

    setWorldSize: ({ state, commit }, size) => {
      commit(MUTATIONS.SET_WORLD_SIZE, size)
      commit(MUTATIONS.SET_CAMERA, {
        x: state.player.x - size.width / 2,
        y: state.player.y - size.height / 2,
      })
    },
    
    setPlayerPosition: ({ commit }, pos) => {
      commit(MUTATIONS.SET_PLAYER_POSITION, pos)
    },

    updatePlayerPosition: ({ state, commit }, dt) => {
      if (!state.gameActive) 
        return
      
      let dx = 0
      let dy = 0

      if (state.keys.ArrowUp) 
        dy -= 1
      if (state.keys.ArrowDown) 
        dy += 1
      if (state.keys.ArrowLeft) 
        dx -= 1
      if (state.keys.ArrowRight) 
        dx += 1

      if (dx === 0 && dy === 0) 
        return

      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy)
        dx /= len
        dy /= len
      }

      const newX = state.player.x + dx * state.player.speed * dt
      const newY = state.player.y + dy * state.player.speed * dt
      commit(MUTATIONS.SET_PLAYER_POSITION, { x: newX, y: newY })
      
      const cx = newX - state.world.width / 2
      const cy = newY - state.world.height / 2
      commit(MUTATIONS.SET_CAMERA, { x: cx, y: cy })
    },

    updateShooting: ({ state, commit }) => {
      if (!state.gameActive) 
        return
      if (!state.fire.enabled) 
        return
      if (state.fire.cooldown > 0) 
        return

      const px = state.player.x
      const py = state.player.y
      const mx = state.mouse.x + state.camera.x
      const my = state.mouse.y + state.camera.y
      const dx = mx - px
      const dy = my - py
      
      const len = Math.hypot(dx, dy)
      
      if (len < 1) 
        return
      
      const nx = dx / len
      const ny = dy / len

      const id = state.nextBulletId
      commit(MUTATIONS.SET_NEXT_BULLET_ID, id + 1)

      const speed = state.fire.bulletSpeed

      commit(MUTATIONS.SPAWN_BULLET, {
        id,
        x: px,
        y: py,
        vx: nx * speed,
        vy: ny * speed,
        radius: state.fire.bulletRadius,
        damage: state.fire.damage,
      })

      commit(MUTATIONS.SET_FIRE_COOLDOWN, 1 / state.fire.rate)
    },

    updateBullets: ({ commit }, dt) => {
      commit(MUTATIONS.MOVE_BULLETS, dt)
      commit(MUTATIONS.REMOVE_OUTSIDE_BULLETS)
    },

    updateSpawning: ({ state, commit }, dt) => {
      if (!state.gameActive) 
        return
      if (!state.spawner.enabled) 
        return

      if (state.spawner.cooldown > 0) 
        return

      const { x, y } = spawnAtViewportEdge(state)

      const id = state.nextEnemyId
      commit(MUTATIONS.SET_NEXT_ENEMY_ID, id + 1)

      commit(MUTATIONS.SPAWN_ENEMY, {
        id,
        x,
        y,
        speed: state.spawner.enemySpeed,
        radius: state.spawner.enemyRadius,
        hp: state.spawner.enemyHp,
      })

      commit(MUTATIONS.SET_SPAWN_COOLDOWN, 1 / state.spawner.rate)
    },

    updateEnemies: ({ commit }, dt) => {
      commit(MUTATIONS.MOVE_ENEMIES, dt)
    },

    handleBulletEnemyCollisions: ({ state, commit }) => {
      if (state.bullets.length === 0 || state.enemies.length === 0) 
        return

      const bulletsToRemove = []

      for (const b of state.bullets) {
        for (const e of state.enemies) {
          const r = b.radius + e.radius
          if (dist2(b.x, b.y, e.x, e.y) <= r * r) {
            bulletsToRemove.push(b.id)
            commit(MUTATIONS.DAMAGE_ENEMY, { id: e.id, damage: b.damage })
            break
          }
        }
      }

      commit(MUTATIONS.REMOVE_BULLET_IDS, bulletsToRemove)
      commit(MUTATIONS.REMOVE_DEAD_ENEMIES)
    },

    handleEnemyContactDamage: ({ state, commit }, dt) => {
      if (!state.gameActive) 
        return
      if (state.enemies.length === 0) 
        return

      const px = state.player.x
      const py = state.player.y
      const pr = state.player.radius

      let touching = 0
      for (const e of state.enemies) {
        const r = pr + e.radius
        if (dist2(px, py, e.x, e.y) <= r * r) 
          touching++
      }

      if (touching === 0) 
        return

      const damage = state.contact.dps * touching * dt
      commit(MUTATIONS.UPDATE_PLAYER_HEALTH, state.player.health - damage)
    },

    gameLoop: ({ dispatch, commit, state }, timestamp) => {
      if (!state.gameActive) 
        return
      if (typeof timestamp !== 'number') 
        return

      if (state.lastTimestamp === 0) {
        commit(MUTATIONS.SET_LAST_TIME, timestamp)
        return
      }

      const dt = Math.min((timestamp - state.lastTimestamp) / 1000, 0.05)
      commit(MUTATIONS.SET_LAST_TIME, timestamp)

      dispatch('updatePlayerPosition', dt)

      commit(MUTATIONS.DEC_FIRE_COOLDOWN, dt)
      commit(MUTATIONS.DEC_SPAWN_COOLDOWN, dt)

      dispatch('updateShooting')
      dispatch('updateBullets', dt)

      dispatch('updateSpawning', dt)
      dispatch('updateEnemies', dt)

      dispatch('handleEnemyContactDamage', dt)
      dispatch('handleBulletEnemyCollisions')

      commit(MUTATIONS.UPDATE_GAME_TIME, dt)
    },

    resetGame: ({ commit }) => {
      commit(MUTATIONS.RESET_GAME)
    },
  },
}