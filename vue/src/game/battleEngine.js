import { MISSIONS } from './missionCatalog.js'

export const TOOL_MODES = {
  TURRET: 'turret',
  BARRIER: 'barrier',
  ARTILLERY: 'artillery',
}

export const TURRET_INSTALL_COST = 60
export const ARTILLERY_COST = 70
export const SQUAD_COST = 65
export const SELLBACK_RATIO = 0.65

export const BARRIER_CATALOG = [
  { id: 'sandbag', label: 'Мешки', price: 40, durability: 320, color: '#786247' },
  { id: 'concrete', label: 'Бетон', price: 70, durability: 560, color: '#94a0ab' },
  { id: 'alloy', label: 'Сплав', price: 100, durability: 860, color: '#9cb3c2' },
]

const hostilePresets = {
  runner: {
    label: 'Бегун',
    tint: '#ff8a3d',
    speed: 74,
    maxHealth: 55,
    reward: 16,
    role: 'assault',
    contactDamage: 48,
  },
  raider: {
    label: 'Штурмовик',
    tint: '#f35d48',
    speed: 52,
    maxHealth: 120,
    reward: 24,
    role: 'assault',
    contactDamage: 62,
  },
  bulwark: {
    label: 'Таран',
    tint: '#c73d3d',
    speed: 34,
    maxHealth: 260,
    reward: 44,
    role: 'assault',
    contactDamage: 88,
  },
  gunner: {
    label: 'Стрелок',
    tint: '#7bd1ff',
    speed: 42,
    maxHealth: 90,
    reward: 30,
    role: 'ranged',
    fireRange: 120,
    firePower: 12,
    fireDelay: 1250,
    contactDamage: 28,
  },
  officer: {
    label: 'Офицер',
    tint: '#c69cff',
    speed: 36,
    maxHealth: 155,
    reward: 40,
    role: 'ranged',
    fireRange: 150,
    firePower: 18,
    fireDelay: 1600,
    contactDamage: 32,
  },
}

let objectSequence = 0

const nextId = (prefix) => `${prefix}-${++objectSequence}`

const clonePoint = (point) => ({ x: point.x, y: point.y })

const scalePoint = (point, scaleX, scaleY) => ({
  x: point.x * scaleX,
  y: point.y * scaleY,
})

const toPixels = (point, arenaSize) => ({
  x: (point.x / 100) * arenaSize.width,
  y: (point.y / 100) * arenaSize.height,
})

const distance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y)

const getNearest = (origin, list, radius) => {
  let winner = null
  let winnerDistance = Infinity

  list.forEach((entry) => {
    const currentDistance = distance(origin, entry.position)
    if (currentDistance <= radius && currentDistance < winnerDistance) {
      winner = entry
      winnerDistance = currentDistance
    }
  })

  return winner
}

const segmentDistance = (point, start, end) => {
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const lengthSquared = deltaX * deltaX + deltaY * deltaY

  if (!lengthSquared) {
    return distance(point, start)
  }

  const ratio = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / lengthSquared
    )
  )

  const projected = {
    x: start.x + deltaX * ratio,
    y: start.y + deltaY * ratio,
  }

  return distance(point, projected)
}

const moveAlongRoute = (unit, routePixels, deltaTime) => {
  if (!routePixels.length || unit.routeIndex >= routePixels.length) return true

  let remaining = (unit.speed * deltaTime) / 1000

  while (remaining > 0 && unit.routeIndex < routePixels.length) {
    const waypoint = routePixels[unit.routeIndex]
    const dx = waypoint.x - unit.position.x
    const dy = waypoint.y - unit.position.y
    const gap = Math.hypot(dx, dy)

    if (gap === 0) {
      unit.routeIndex += 1
      continue
    }

    if (gap <= remaining) {
      unit.position = clonePoint(waypoint)
      unit.routeIndex += 1
      remaining -= gap
      continue
    }

    const ratio = remaining / gap
    unit.position = {
      x: unit.position.x + dx * ratio,
      y: unit.position.y + dy * ratio,
    }
    remaining = 0
  }

  return unit.routeIndex >= routePixels.length
}

const turretStatsByLevel = (level) => ({
  damage: 21 + (level - 1) * 10,
  range: 128 + (level - 1) * 24,
  reloadMs: Math.max(280, 980 - (level - 1) * 120),
  maxHealth: 190 + (level - 1) * 90,
})

const getBarrierSpec = (material) =>
  BARRIER_CATALOG.find((entry) => entry.id === material) ?? BARRIER_CATALOG[0]

export const getBarrierPrice = (material) => getBarrierSpec(material).price

export const getTurretUpgradePrice = (level) => 40 + (level - 1) * 35

export const spend = (budget, amount) => budget >= amount

export const getMissionById = (missionId) =>
  MISSIONS.find((mission) => mission.id === missionId) ?? null

export const createTurret = (pad) => {
  const stats = turretStatsByLevel(1)

  return {
    id: nextId('turret'),
    padId: pad.id,
    position: { x: pad.x, y: pad.y },
    level: 1,
    cooldownMs: 0,
    aimPoint: null,
    invested: TURRET_INSTALL_COST,
    damage: stats.damage,
    range: stats.range,
    reloadMs: stats.reloadMs,
    health: stats.maxHealth,
    maxHealth: stats.maxHealth,
  }
}

export const createBarrier = (slot, material) => {
  const spec = getBarrierSpec(material)
  const angleInRadians = (slot.angle * Math.PI) / 180
  const halfWidth = slot.width / 2

  return {
    id: nextId('barrier'),
    slotId: slot.id,
    material,
    tint: spec.color,
    durability: spec.durability,
    maxDurability: spec.durability,
    position: { x: slot.x, y: slot.y },
    start: {
      x: slot.x - Math.cos(angleInRadians) * halfWidth,
      y: slot.y - Math.sin(angleInRadians) * halfWidth,
    },
    end: {
      x: slot.x + Math.cos(angleInRadians) * halfWidth,
      y: slot.y + Math.sin(angleInRadians) * halfWidth,
    },
    width: slot.width,
    angle: slot.angle,
  }
}

export const createShell = (point) => ({
  id: nextId('shell'),
  position: clonePoint(point),
  elapsedMs: 0,
  durationMs: 650,
  impactAtMs: 120,
  maxRadius: 112,
  maxDamage: 185,
  detonated: false,
})

export const createSquad = (spawnPoint) => ({
  id: nextId('squad'),
  position: clonePoint(spawnPoint),
  routeIndex: 1,
  speed: 66,
  health: 180,
  maxHealth: 180,
  attackRange: 86,
  attackPower: 30,
  reloadMs: 760,
  cooldownMs: 0,
  aimPoint: null,
})

export const createBattleSnapshot = {
  turretLevel: turretStatsByLevel,
}

const createHostile = (kind, spawnPoint) => {
  const preset = hostilePresets[kind]

  return {
    id: nextId('hostile'),
    kind,
    label: preset.label,
    tint: preset.tint,
    role: preset.role,
    position: clonePoint(spawnPoint),
    routeIndex: 1,
    speed: preset.speed,
    health: preset.maxHealth,
    maxHealth: preset.maxHealth,
    reward: preset.reward,
    fireRange: preset.fireRange ?? 0,
    firePower: preset.firePower ?? 0,
    fireDelay: preset.fireDelay ?? 0,
    cooldownMs: 0,
    aimPoint: null,
    contactDamage: preset.contactDamage,
  }
}

const rescaleAim = (aimPoint, scaleX, scaleY) =>
  aimPoint ? scalePoint(aimPoint, scaleX, scaleY) : null

export const recalcArenaGeometry = (state, arenaSize) => {
  if (!state.mission || !arenaSize?.width || !arenaSize?.height) {
    return {
      arenaSize,
      routePixels: [],
      reverseRoutePixels: [],
      turrets: state.turrets,
      hostiles: state.hostiles,
      squads: state.squads,
      barriers: state.barriers,
      shells: state.shells,
    }
  }

  const previousSize = state.arenaSize
  const routePixels = state.mission.route.map((point) => toPixels(point, arenaSize))
  const reverseRoutePixels = [...routePixels].reverse()

  if (!previousSize?.width || !previousSize?.height) {
    return {
      arenaSize,
      routePixels,
      reverseRoutePixels,
      turrets: state.turrets.map((turret) => {
        const pad = state.mission.pads.find((entry) => entry.id === turret.padId)
        return pad ? { ...turret, position: toPixels(pad, arenaSize) } : turret
      }),
      hostiles: state.hostiles,
      squads: state.squads,
      barriers: state.barriers.map((barrier) => {
        const slot = state.mission.barrierSlots.find((entry) => entry.id === barrier.slotId)
        return slot ? createBarrier(slot, barrier.material) : barrier
      }),
      shells: state.shells,
    }
  }

  const scaleX = arenaSize.width / previousSize.width
  const scaleY = arenaSize.height / previousSize.height

  return {
    arenaSize,
    routePixels,
    reverseRoutePixels,
    turrets: state.turrets.map((turret) => ({
      ...turret,
      position: scalePoint(turret.position, scaleX, scaleY),
      aimPoint: rescaleAim(turret.aimPoint, scaleX, scaleY),
    })),
    hostiles: state.hostiles.map((hostile) => ({
      ...hostile,
      position: scalePoint(hostile.position, scaleX, scaleY),
      aimPoint: rescaleAim(hostile.aimPoint, scaleX, scaleY),
    })),
    squads: state.squads.map((squad) => ({
      ...squad,
      position: scalePoint(squad.position, scaleX, scaleY),
      aimPoint: rescaleAim(squad.aimPoint, scaleX, scaleY),
    })),
    barriers: state.barriers.map((barrier) => ({
      ...barrier,
      position: scalePoint(barrier.position, scaleX, scaleY),
      start: scalePoint(barrier.start, scaleX, scaleY),
      end: scalePoint(barrier.end, scaleX, scaleY),
      width: barrier.width * scaleX,
    })),
    shells: state.shells.map((shell) => ({
      ...shell,
      position: scalePoint(shell.position, scaleX, scaleY),
      maxRadius: shell.maxRadius * ((scaleX + scaleY) / 2),
    })),
  }
}

const inflictDamage = (targets, targetId, damage) =>
  targets
    .map((target) =>
      target.id === targetId ? { ...target, health: target.health - damage } : target
    )
    .filter((target) => target.health > 0)

const rewardDeadHostiles = (before, after) =>
  before
    .filter((entry) => !after.some((nextEntry) => nextEntry.id === entry.id))
    .reduce((total, entry) => total + entry.reward, 0)

const pickTurretTarget = (turret, hostiles) => {
  let winner = null
  let winnerScore = -Infinity

  hostiles.forEach((hostile) => {
    const gap = distance(turret.position, hostile.position)
    if (gap > turret.range) return

    const score =
      hostile.routeIndex * 1000 +
      (hostile.role === 'ranged' ? 500 : 0) +
      hostile.maxHealth -
      gap

    if (score > winnerScore) {
      winner = hostile
      winnerScore = score
    }
  })

  return winner
}

const pickSquadTarget = (squad, hostiles) => {
  let winner = null
  let winnerScore = -Infinity

  hostiles.forEach((hostile) => {
    const gap = distance(squad.position, hostile.position)
    if (gap > squad.attackRange) return

    const score =
      (hostile.role === 'ranged' ? 600 : 0) + hostile.routeIndex * 100 + hostile.maxHealth - gap

    if (score > winnerScore) {
      winner = hostile
      winnerScore = score
    }
  })

  return winner
}

export const runBattleTick = (state, deltaTime) => {
  if (state.result) {
    return {
      turrets: state.turrets,
      hostiles: state.hostiles,
      squads: state.squads,
      barriers: state.barriers,
      shells: state.shells,
      budget: state.budget,
      wave: state.wave,
      result: state.result,
    }
  }

  let budget = state.budget
  let result = null
  let hostiles = state.hostiles.map((hostile) => ({
    ...hostile,
    cooldownMs: Math.max(0, hostile.cooldownMs - deltaTime),
  }))
  let turrets = state.turrets.map((turret) => ({
    ...turret,
    cooldownMs: Math.max(0, turret.cooldownMs - deltaTime),
    aimPoint: null,
  }))
  let squads = state.squads.map((squad) => ({
    ...squad,
    cooldownMs: Math.max(0, squad.cooldownMs - deltaTime),
    aimPoint: null,
  }))
  let barriers = state.barriers.map((barrier) => ({ ...barrier }))
  let shells = state.shells.map((shell) => ({ ...shell, elapsedMs: shell.elapsedMs + deltaTime }))
  const wave = {
    ...state.wave,
    timer: state.wave.timer + deltaTime,
  }

  while (wave.cursor < wave.queue.length && wave.timer >= wave.interval) {
    wave.timer -= wave.interval
    hostiles = [...hostiles, createHostile(wave.queue[wave.cursor], state.routePixels[0])]
    wave.cursor += 1
  }

  shells = shells
    .map((shell) => {
      if (!shell.detonated && shell.elapsedMs >= shell.impactAtMs) {
        const before = hostiles
        hostiles = hostiles
          .map((hostile) => {
            const gap = distance(hostile.position, shell.position)
            if (gap > shell.maxRadius) return hostile
            const damage = shell.maxDamage * (1 - gap / shell.maxRadius)
            return { ...hostile, health: hostile.health - damage }
          })
          .filter((hostile) => hostile.health > 0)
        budget += rewardDeadHostiles(before, hostiles)
        return { ...shell, detonated: true }
      }

      return shell
    })
    .filter((shell) => shell.elapsedMs < shell.durationMs)

  const barrierDamage = new Map()

  hostiles = hostiles.map((hostile) => {
    const blockingBarrier = barriers.find(
      (barrier) => segmentDistance(hostile.position, barrier.start, barrier.end) <= 16
    )

    if (blockingBarrier) {
      barrierDamage.set(
        blockingBarrier.id,
        (barrierDamage.get(blockingBarrier.id) ?? 0) +
          hostile.contactDamage * (deltaTime / 1000)
      )
      return { ...hostile, aimPoint: blockingBarrier.position }
    }

    if (hostile.role === 'ranged') {
      const rangedTarget =
        getNearest(hostile.position, turrets, hostile.fireRange) ??
        getNearest(hostile.position, squads, hostile.fireRange)

      if (rangedTarget && hostile.cooldownMs <= 0) {
        if (turrets.some((entry) => entry.id === rangedTarget.id)) {
          turrets = turrets
            .map((turret) =>
              turret.id === rangedTarget.id
                ? { ...turret, health: turret.health - hostile.firePower }
                : turret
            )
            .filter((turret) => turret.health > 0)
        } else {
          squads = squads
            .map((squad) =>
              squad.id === rangedTarget.id
                ? { ...squad, health: squad.health - hostile.firePower }
                : squad
            )
            .filter((squad) => squad.health > 0)
        }

        return {
          ...hostile,
          cooldownMs: hostile.fireDelay,
          aimPoint: clonePoint(rangedTarget.position),
        }
      }
    }

    const movedHostile = { ...hostile, aimPoint: null }
    const reachedFinish = moveAlongRoute(movedHostile, state.routePixels, deltaTime)
    if (reachedFinish) result = 'lose'
    return movedHostile
  })

  barriers = barriers
    .map((barrier) => ({
      ...barrier,
      durability: barrier.durability - (barrierDamage.get(barrier.id) ?? 0),
    }))
    .filter((barrier) => barrier.durability > 0)

  squads = squads
    .map((squad) => {
      const target = pickSquadTarget(squad, hostiles)

      if (target && squad.cooldownMs <= 0) {
        const before = hostiles
        hostiles = inflictDamage(hostiles, target.id, squad.attackPower)
        budget += rewardDeadHostiles(before, hostiles)
        return {
          ...squad,
          cooldownMs: squad.reloadMs,
          aimPoint: clonePoint(target.position),
        }
      }

      const movedSquad = { ...squad }
      const arrived = moveAlongRoute(movedSquad, state.reverseRoutePixels, deltaTime)
      return arrived ? null : movedSquad
    })
    .filter(Boolean)

  turrets = turrets.map((turret) => {
    const target = pickTurretTarget(turret, hostiles)
    if (!target || turret.cooldownMs > 0) return turret

    const before = hostiles
    hostiles = inflictDamage(hostiles, target.id, turret.damage)
    budget += rewardDeadHostiles(before, hostiles)

    return {
      ...turret,
      cooldownMs: turret.reloadMs,
      aimPoint: clonePoint(target.position),
    }
  })

  if (!result && wave.cursor >= wave.queue.length && hostiles.length === 0) {
    result = 'win'
  }

  return {
    turrets,
    hostiles,
    squads,
    barriers,
    shells,
    budget,
    wave,
    result,
  }
}
