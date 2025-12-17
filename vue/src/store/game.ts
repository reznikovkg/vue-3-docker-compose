import type { FishingState, Fish, FishingResult, GameModuleState, HotSpot, FishSize, FishMovement } from '@/types'

const TENSION_SAFE_THRESHOLD = 30
const TENSION_WARNING_THRESHOLD = 70
const TENSION_DANGER_THRESHOLD = 85
const TENSION_MAX = 100
const ROD_POSITION_X = 50
const ROD_POSITION_Y = 90
const MAX_DISTANCE_FROM_ROD = 80
const FISH_TIRED_THRESHOLD = 30

const REEL_PULL_FORCE = 2.5
const FISH_PULL_RESISTANCE = 1.8
const FISH_STAMINA_DRAIN_RATE = 0.8
const FISH_STAMINA_RECOVERY_RATE = 0.3
const BASE_FISH_SPEED = 0.4
const FISH_STRUGGLE_CHANCE = 0.12
const FISH_STRUGGLE_DURATION = 1800
const CAST_ANIMATION_DURATION = 500
const GAME_LOOP_INTERVAL = 120
const MAX_FISH_STRENGTH = 15

const NET_ACTIVATION_DISTANCE = 25

const selectFishSize = (fish: Fish): { size: FishSize, weight: number } => {
  const totalRarity = fish.sizes.reduce((sum, size) => sum + size.rarity, 0)
  let random = Math.random() * totalRarity

  for (const size of fish.sizes) {
    if (random < size.rarity) {
      const weight = Math.floor(
        size.minWeight + Math.random() * (size.maxWeight - size.minWeight)
      )
      return { size, weight }
    }
    random -= size.rarity
  }

  const fallbackSize = fish.sizes[0]
  const weight = Math.floor(
    fallbackSize.minWeight + Math.random() * (fallbackSize.maxWeight - fallbackSize.minWeight)
  )
  return { size: fallbackSize, weight }
}

const calculateSizeMultipliers = (fish: Fish, size: FishSize, weight: number) => {
  const normalizedWeight = (weight - size.minWeight) / (size.maxWeight - size.minWeight)

  const strengthMultiplier = 1 + (fish.sizeMultipliers.strength - 1) * normalizedWeight
  const escapeMultiplier = 1 + (fish.sizeMultipliers.escapeChance - 1) * normalizedWeight
  const valueMultiplier = 1 + (fish.sizeMultipliers.value - 1) * normalizedWeight

  return {
    strength: strengthMultiplier,
    escapeChance: escapeMultiplier,
    value: valueMultiplier
  }
}

const checkRodBreak = (tension: number, fishStrength: number, equippedRod: any): boolean => {
  if (!equippedRod || equippedRod.id === 'rod_basic') return false

  const baseBreakChance = Math.max(0, (tension - TENSION_DANGER_THRESHOLD) / 100)
  const fishBreakModifier = (fishStrength / MAX_FISH_STRENGTH) * 0.1
  const rodDurability = equippedRod.level * 0.5

  const totalBreakChance = baseBreakChance + fishBreakModifier - rodDurability
  return Math.random() < Math.max(0, Math.min(0.1, totalBreakChance))
}

const initFishMovement = (fish: Fish, startX: number, startY: number): FishMovement => {
  const baseSpeed = BASE_FISH_SPEED * (0.6 + (fish.strength / MAX_FISH_STRENGTH))

  let swimPattern: 'aggressive' | 'random' | 'calm'
  if (fish.strength > 10) {
    swimPattern = 'aggressive'
  } else if (fish.strength > 5) {
    swimPattern = 'random'
  } else {
    swimPattern = 'calm'
  }

  return {
    x: startX,
    y: startY,
    direction: Math.random() * 360,
    speed: baseSpeed,
    stamina: 100,
    struggleIntensity: 0,
    isStruggling: false,
    lastStruggleTime: 0,
    swimPattern,
    initialX: startX,
    pullResistance: (fish.strength / MAX_FISH_STRENGTH) * FISH_PULL_RESISTANCE
  }
}

const calculateDistanceToRod = (fishX: number, fishY: number): number => {
  const dx = fishX - ROD_POSITION_X
  const dy = fishY - ROD_POSITION_Y
  return Math.sqrt(dx * dx + dy * dy)
}

const calculateReelEffectiveness = (distanceToRod: number): number => {
  if (distanceToRod > 60) return 0.4
  if (distanceToRod > 40) return 0.6
  if (distanceToRod > 20) return 0.8
  if (distanceToRod > 10) return 0.9
  return 1.0
}

const calculateTension = (
  fishX: number,
  fishY: number,
  isReeling: boolean,
  fishStamina: number
): number => {
  const distanceToRod = calculateDistanceToRod(fishX, fishY)

  let tension = 20 + ((MAX_DISTANCE_FROM_ROD - distanceToRod) / MAX_DISTANCE_FROM_ROD) * 30

  if (isReeling) {
    tension += 15

    if (distanceToRod < 30) {
      tension += 8
    }
  } else {
    tension -= 12

    if (tension < 15) {
      tension = 15
    }
  }

  tension -= ((100 - fishStamina) / 100) * 20

  tension = Math.max(10, Math.min(TENSION_MAX, tension))

  return tension
}

const updateFishMovement = (
  movement: FishMovement,
  isReeling: boolean,
  strengthBonus: number,
  fishStrength: number
): FishMovement => {
  const newMovement = { ...movement }
  const currentTime = Date.now()
  const distanceToRod = calculateDistanceToRod(newMovement.x, newMovement.y)

  if (!isReeling) {
    newMovement.stamina = Math.min(100, newMovement.stamina + FISH_STAMINA_RECOVERY_RATE)

    if (Math.random() < 0.07 && distanceToRod < 70) {
      const angleFromRod = Math.atan2(newMovement.y - ROD_POSITION_Y, newMovement.x - ROD_POSITION_X)
      newMovement.x += Math.cos(angleFromRod) * 0.2
      newMovement.y += Math.sin(angleFromRod) * 0.2
    }

    if (Math.random() < 0.05) {
      const directionChange = (Math.random() - 0.5) * 25
      newMovement.direction = (newMovement.direction + directionChange) % 360
    }

    const rad = newMovement.direction * Math.PI / 180
    newMovement.x += Math.cos(rad) * newMovement.speed * 0.15
    newMovement.y += Math.sin(rad) * newMovement.speed * 0.15

  } else {
    const reelEffectiveness = calculateReelEffectiveness(distanceToRod)

    const staminaDrain = FISH_STAMINA_DRAIN_RATE * reelEffectiveness
    newMovement.stamina = Math.max(0, newMovement.stamina - staminaDrain)

    const playerPullForce = REEL_PULL_FORCE * (1 + strengthBonus * 0.08) * reelEffectiveness
    const fishResistance = newMovement.pullResistance * (newMovement.stamina / 100)

    const effectivePull = Math.max(0.1, playerPullForce - fishResistance)

    const angleToRod = Math.atan2(ROD_POSITION_Y - newMovement.y, ROD_POSITION_X - newMovement.x)

    newMovement.x += Math.cos(angleToRod) * effectivePull * 0.8
    newMovement.y += Math.sin(angleToRod) * effectivePull * 0.8

    if (!newMovement.isStruggling && Math.random() < FISH_STRUGGLE_CHANCE) {
      newMovement.isStruggling = true
      newMovement.struggleIntensity = 0.3 + Math.random() * 0.7
      newMovement.lastStruggleTime = currentTime
      newMovement.speed *= 1.4
    }

    if (newMovement.isStruggling) {
      const struggleAngle = Math.atan2(newMovement.y - ROD_POSITION_Y, newMovement.x - ROD_POSITION_X)
      const strugglePower = newMovement.struggleIntensity * 1.2

      newMovement.x += Math.cos(struggleAngle) * strugglePower * 0.5
      newMovement.y += Math.sin(struggleAngle) * strugglePower * 0.5

      newMovement.stamina -= newMovement.struggleIntensity * 1.2

      if (currentTime - newMovement.lastStruggleTime > FISH_STRUGGLE_DURATION ||
          newMovement.stamina < 20 ||
          Math.random() < 0.04) {
        newMovement.isStruggling = false
        newMovement.struggleIntensity = 0
        newMovement.speed = BASE_FISH_SPEED * (0.6 + (fishStrength / MAX_FISH_STRENGTH))
      }
    }
  }

  newMovement.x = Math.max(5, Math.min(95, newMovement.x))
  newMovement.y = Math.max(10, Math.min(85, newMovement.y))

  newMovement.stamina = Math.max(0, Math.min(100, newMovement.stamina))

  if (newMovement.stamina < FISH_TIRED_THRESHOLD) {
    newMovement.speed = Math.max(0.05, newMovement.speed * 0.3)
    newMovement.pullResistance *= 0.4
  }

  return newMovement
}

const selectFishWithGroundbait = (
  location: any,
  castPosition: { x: number; y: number },
  getFishAttractionMultiplier: Function
) => {
  if (!location || !location.fish || location.fish.length === 0) {
    return location.fish[0] || null
  }

  const fishWithMultipliers = location.fish.map((fish: any) => {
    const multiplier = getFishAttractionMultiplier({
      locationId: location.id,
      fishName: fish.name,
      position: castPosition
    })

    const baseChance = 1.0
    const finalChance = baseChance * multiplier

    return {
      fish,
      chance: finalChance,
      multiplier
    }
  })

  const totalChance = fishWithMultipliers.reduce((sum, f) => sum + f.chance, 0)

  if (totalChance === 0) {
    return location.fish[Math.floor(Math.random() * location.fish.length)]
  }

  let random = Math.random() * totalChance

  for (const { fish, chance } of fishWithMultipliers) {
    if (random < chance) {
      return fish
    }
    random -= chance
  }

  return location.fish[Math.floor(Math.random() * location.fish.length)]
}

export const gameModule = {
  namespaced: true,

  state: (): GameModuleState => ({
    fishingState: 'idle',
    isReeling: false,
    fishingResult: null,
    currentFish: null,
    tension: 0,
    gameInterval: null,
    biteTimeout: null,
    showResult: false,
    currentHotSpot: null,
    difficultyMultiplier: 1.0,
    hotSpotActive: false,
    fishMovement: null,
    fishPosition: { x: 50, y: 50 },
    distanceToRod: 35,
    fishingStartTime: 0,
    fishStruggleCount: 0,
    floatPosition: { x: 50, y: 40 },
    isCastingMode: false,
    castTargetPosition: null,
    lastReelTime: 0,
    groundbaitEffectActive: false,
    groundbaitEffectMessage: '',
    isNetAvailable: false,
    netActivationDistance: NET_ACTIVATION_DISTANCE,
    isNetUsed: false,
    netBrokenMessage: null
  }),

  getters: {
    fishingState: (state: GameModuleState): FishingState => state.fishingState,
    isReeling: (state: GameModuleState): boolean => state.isReeling,
    tension: (state: GameModuleState): number => state.tension,
    currentFish: (state: GameModuleState): Fish | null => state.currentFish,
    showResult: (state: GameModuleState): boolean => state.showResult,
    fishingResult: (state: GameModuleState): FishingResult | null => state.fishingResult,
    currentHotSpot: (state: GameModuleState): HotSpot | null => state.currentHotSpot,
    difficultyMultiplier: (state: GameModuleState): number => state.difficultyMultiplier,
    hotSpotActive: (state: GameModuleState): boolean => state.hotSpotActive,
    fishMovement: (state: GameModuleState): FishMovement | null => state.fishMovement,
    fishPosition: (state: GameModuleState): { x: number; y: number } => state.fishPosition,
    distanceToRod: (state: GameModuleState): number => state.distanceToRod,
    fishingStartTime: (state: GameModuleState): number => state.fishingStartTime,
    fishStruggleCount: (state: GameModuleState): number => state.fishStruggleCount,
    floatPosition: (state: GameModuleState): { x: number; y: number } => state.floatPosition,
    isCastingMode: (state: GameModuleState): boolean => state.isCastingMode,
    castTargetPosition: (state: GameModuleState): { x: number; y: number } | null => state.castTargetPosition,
    lastReelTime: (state: GameModuleState): number => state.lastReelTime,
    groundbaitEffectActive: (state: GameModuleState): boolean => state.groundbaitEffectActive,
    groundbaitEffectMessage: (state: GameModuleState): string => state.groundbaitEffectMessage,
    isNetAvailable: (state: GameModuleState): boolean => state.isNetAvailable,
    netActivationDistance: (state: GameModuleState): number => state.netActivationDistance,
    isNetUsed: (state: GameModuleState): boolean => state.isNetUsed,
    netBrokenMessage: (state: GameModuleState): string | null => state.netBrokenMessage,

    tensionClass: (state: GameModuleState): string => {
      if (state.tension < TENSION_SAFE_THRESHOLD) return 'safe'
      if (state.tension < TENSION_WARNING_THRESHOLD) return 'warning'
      return 'danger'
    },

    tensionHint: (state: GameModuleState): string => {
      if (state.tension < 25) return 'Слабое натяжение'
      if (state.tension < 45) return 'Нормальное натяжение'
      if (state.tension < TENSION_WARNING_THRESHOLD) return 'Высокое натяжение'
      return 'Опасно! Леска может порваться'
    },

    fishingProgress: (state: GameModuleState): number => {
      const maxDistance = MAX_DISTANCE_FROM_ROD
      const currentDistance = Math.max(0, Math.min(maxDistance, state.distanceToRod))
      return Math.round(((maxDistance - currentDistance) / maxDistance) * 100)
    },

    fishingDuration: (state: GameModuleState): number => {
      if (!state.fishingStartTime) return 0
      return Math.floor((Date.now() - state.fishingStartTime) / 1000)
    },

    shouldShowFloat: (state: GameModuleState): boolean => {
      return ['casting', 'waiting', 'fighting'].includes(state.fishingState)
    },

    shouldShowFish: (state: GameModuleState): boolean => {
      return state.fishingState === 'fighting' && state.fishPosition !== null
    },

    rodPosition: (): { x: number; y: number } => {
      return { x: ROD_POSITION_X, y: ROD_POSITION_Y }
    }
  },

  mutations: {
    SET_FISHING_STATE: (state: GameModuleState, stateValue: FishingState): void => {
      state.fishingState = stateValue
    },
    SET_IS_REELING: (state: GameModuleState, reeling: boolean): void => {
      state.isReeling = reeling
    },
    SET_TENSION: (state: GameModuleState, tension: number): void => {
      state.tension = Math.max(0, Math.min(TENSION_MAX, tension))
    },
    SET_CURRENT_FISH: (state: GameModuleState, fish: Fish | null): void => {
      state.currentFish = fish
    },
    SET_FISHING_RESULT: (state: GameModuleState, result: FishingResult | null): void => {
      state.fishingResult = result
    },
    SET_SHOW_RESULT: (state: GameModuleState, show: boolean): void => {
      state.showResult = show
    },
    SET_GAME_INTERVAL: (state: GameModuleState, interval: NodeJS.Timeout | null): void => {
      state.gameInterval = interval
    },
    SET_BITE_TIMEOUT: (state: GameModuleState, timeout: NodeJS.Timeout | null): void => {
      state.biteTimeout = timeout
    },
    SET_CURRENT_HOT_SPOT: (state: GameModuleState, hotSpot: HotSpot | null): void => {
      state.currentHotSpot = hotSpot
    },
    SET_DIFFICULTY_MULTIPLIER: (state: GameModuleState, multiplier: number): void => {
      state.difficultyMultiplier = multiplier
    },
    SET_HOT_SPOT_ACTIVE: (state: GameModuleState, active: boolean): void => {
      state.hotSpotActive = active
    },
    SET_FISH_MOVEMENT: (state: GameModuleState, movement: FishMovement | null): void => {
      state.fishMovement = movement
    },
    SET_FISH_POSITION: (state: GameModuleState, position: { x: number; y: number }): void => {
      state.fishPosition = position
    },
    SET_DISTANCE_TO_ROD: (state: GameModuleState, distance: number): void => {
      state.distanceToRod = distance
    },
    SET_FISHING_START_TIME: (state: GameModuleState, time: number): void => {
      state.fishingStartTime = time
    },
    SET_FISH_STRUGGLE_COUNT: (state: GameModuleState, count: number): void => {
      state.fishStruggleCount = count
    },
    INCREMENT_FISH_STRUGGLE_COUNT: (state: GameModuleState): void => {
      state.fishStruggleCount += 1
    },
    SET_FLOAT_POSITION: (state: GameModuleState, position: { x: number; y: number }): void => {
      state.floatPosition = position
    },
    SET_IS_CASTING_MODE: (state: GameModuleState, mode: boolean): void => {
      state.isCastingMode = mode
    },
    SET_CAST_TARGET_POSITION: (state: GameModuleState, position: { x: number; y: number } | null): void => {
      state.castTargetPosition = position
    },
    SET_LAST_REEL_TIME: (state: GameModuleState, time: number): void => {
      state.lastReelTime = time
    },
    SET_GROUNDBAIT_EFFECT_ACTIVE: (state: GameModuleState, active: boolean): void => {
      state.groundbaitEffectActive = active
    },
    SET_GROUNDBAIT_EFFECT_MESSAGE: (state: GameModuleState, message: string): void => {
      state.groundbaitEffectMessage = message
    },
    SET_NET_AVAILABLE: (state: GameModuleState, available: boolean): void => {
      state.isNetAvailable = available
    },
    SET_NET_USED: (state: GameModuleState, used: boolean): void => {
      state.isNetUsed = used
    },
    SET_NET_BROKEN_MESSAGE: (state: GameModuleState, message: string | null): void => {
      state.netBrokenMessage = message
    },
    CLEAR_NET_BROKEN_MESSAGE: (state: GameModuleState): void => {
      state.netBrokenMessage = null
    },
    RESET_GAME: (state: GameModuleState): void => {
      state.fishingState = 'idle'
      state.isReeling = false
      state.fishingResult = null
      state.currentFish = null
      state.tension = 0
      state.showResult = false
      state.gameInterval = null
      state.biteTimeout = null
      state.currentHotSpot = null
      state.difficultyMultiplier = 1.0
      state.hotSpotActive = false
      state.fishMovement = null
      state.fishPosition = { x: 50, y: 50 }
      state.distanceToRod = 35
      state.fishingStartTime = 0
      state.fishStruggleCount = 0
      state.floatPosition = { x: 50, y: 40 }
      state.isCastingMode = false
      state.castTargetPosition = null
      state.lastReelTime = 0
      state.groundbaitEffectActive = false
      state.groundbaitEffectMessage = ''
      state.isNetAvailable = false
      state.isNetUsed = false
      state.netBrokenMessage = null
    }
  },

  actions: {
    setFishingState({ commit }: any, stateValue: FishingState): void {
      commit('SET_FISHING_STATE', stateValue)
    },
    setIsReeling({ commit }: any, reeling: boolean): void {
      commit('SET_IS_REELING', reeling)
    },
    setTension({ commit }: any, tension: number): void {
      commit('SET_TENSION', tension)
    },
    setCurrentFish({ commit }: any, fish: Fish | null): void {
      commit('SET_CURRENT_FISH', fish)
    },
    setFishingResult({ commit }: any, result: FishingResult | null): void {
      commit('SET_FISHING_RESULT', result)
    },
    setShowResult({ commit }: any, show: boolean): void {
      commit('SET_SHOW_RESULT', show)
    },
    setGameInterval({ commit, state }: any, interval: NodeJS.Timeout | null): void {
      if (state.gameInterval) {
        clearInterval(state.gameInterval)
      }
      commit('SET_GAME_INTERVAL', interval)
    },
    setBiteTimeout({ commit, state }: any, timeout: NodeJS.Timeout | null): void {
      if (state.biteTimeout) {
        clearTimeout(state.biteTimeout)
      }
      commit('SET_BITE_TIMEOUT', timeout)
    },
    setCurrentHotSpot({ commit }: any, hotSpot: HotSpot | null): void {
      commit('SET_CURRENT_HOT_SPOT', hotSpot)
    },
    setDifficultyMultiplier({ commit }: any, multiplier: number): void {
      commit('SET_DIFFICULTY_MULTIPLIER', multiplier)
    },
    setHotSpotActive({ commit }: any, active: boolean): void {
      commit('SET_HOT_SPOT_ACTIVE', active)
    },
    setFishMovement({ commit }: any, movement: FishMovement | null): void {
      commit('SET_FISH_MOVEMENT', movement)
    },
    setFishPosition({ commit }: any, position: { x: number; y: number }): void {
      commit('SET_FISH_POSITION', position)
    },
    setDistanceToRod({ commit }: any, distance: number): void {
      commit('SET_DISTANCE_TO_ROД', distance)
    },
    setFishingStartTime({ commit }: any, time: number): void {
      commit('SET_FISHING_START_TIME', time)
    },
    incrementFishStruggleCount({ commit }: any): void {
      commit('INCREMENT_FISH_STRUGGLE_COUNT')
    },
    setFloatPosition({ commit }: any, position: { x: number; y: number }): void {
      commit('SET_FLOAT_POSITION', position)
    },
    setIsCastingMode({ commit }: any, mode: boolean): void {
      commit('SET_IS_CASTING_MODE', mode)
    },
    setCastTargetPosition({ commit }: any, position: { x: number; y: number } | null): void {
      commit('SET_CAST_TARGET_POSITION', position)
    },
    setLastReelTime({ commit }: any, time: number): void {
      commit('SET_LAST_REEL_TIME', time)
    },
    setGroundbaitEffectActive({ commit }: any, active: boolean): void {
      commit('SET_GROUNDBAIT_EFFECT_ACTIVE', active)
    },
    setGroundbaitEffectMessage({ commit }: any, message: string): void {
      commit('SET_GROUNDBAIT_EFFECT_MESSAGE', message)
    },
    setNetAvailable({ commit }: any, available: boolean): void {
      commit('SET_NET_AVAILABLE', available)
    },
    setNetUsed({ commit }: any, used: boolean): void {
      commit('SET_NET_USED', used)
    },
    setNetBrokenMessage({ commit }: any, message: string | null): void {
      commit('SET_NET_BROKEN_MESSAGE', message)
    },
    clearNetBrokenMessage({ commit }: any): void {
      commit('CLEAR_NET_BROKEN_MESSAGE')
    },
    clearGameInterval({ commit, state }: any): void {
      if (state.gameInterval) {
        clearInterval(state.gameInterval)
        commit('SET_GAME_INTERVAL', null)
      }
    },
    clearBiteTimeout({ commit, state }: any): void {
      if (state.biteTimeout) {
        clearTimeout(state.biteTimeout)
        commit('SET_BITE_TIMEOUT', null)
      }
    },
    resetGame({ commit, dispatch }: any): void {
      dispatch('clearGameInterval')
      dispatch('clearBiteTimeout')
      commit('RESET_GAME')
    },
    startCastingMode({ commit }: any): void {
      commit('SET_IS_CASTING_MODE', true)
    },
    cancelCastingMode({ commit }: any): void {
      commit('SET_IS_CASTING_MODE', false)
      commit('SET_CAST_TARGET_POSITION', null)
    },
    castToPosition({ commit, dispatch, state, rootGetters }: any, position: { x: number; y: number }): Promise<boolean> {
      return new Promise((resolve) => {
        const hasBait = rootGetters['fishing/hasBait']

        if (!hasBait) {
          dispatch('setFishingResult', {
            type: 'failed',
            message: 'Нет наживки! Купите наживку в магазине.'
          })
          dispatch('setShowResult', true)

          setTimeout(() => {
            dispatch('resetGame')
          }, 3000)
          resolve(false)
          return
        }

        commit('SET_CAST_TARGET_POSITION', position)
        commit('SET_FISHING_STATE', 'casting')
        commit('SET_FISHING_RESULT', null)
        commit('SET_SHOW_RESULT', false)
        commit('SET_TENSION', 0)
        commit('SET_CURRENT_FISH', null)
        commit('SET_CURRENT_HOT_SPOT', null)
        commit('SET_HOT_SPOT_ACTIVE', false)
        commit('SET_FISH_MOVEMENT', null)
        commit('SET_FISHING_START_TIME', 0)
        commit('SET_FISH_STRUGGLE_COUNT', 0)
        commit('SET_IS_CASTING_MODE', false)
        commit('SET_GROUNDBAIT_EFFECT_ACTIVE', false)
        commit('SET_GROUNDBAIT_EFFECT_MESSAGE', '')
        commit('SET_NET_AVAILABLE', false)
        commit('SET_NET_USED', false)
        commit('CLEAR_NET_BROKEN_MESSAGE')

        dispatch('fishing/useBait', null, { root: true }).then((baitUsed: boolean) => {
          if (!baitUsed) {
            dispatch('fishEscape', 'Закончилась наживка!')
            resolve(false)
            return
          }

          const groundbaitInfo = rootGetters['fishing/isPositionInGroundbaitSpot']({
            locationId: state.currentLocation?.id || rootGetters['fishing/currentLocation']?.id,
            position
          })

          if (groundbaitInfo.isInside) {
            const spot = groundbaitInfo.spot
            const fishNames = spot.fishAttraction.map(att => att.fishName).join(', ')
            dispatch('setGroundbaitEffectMessage',
              `Прикормка "${spot.groundbaitType.name}" (ур. ${spot.level}) активна! Увеличен шанс на: ${fishNames}`
            )
            dispatch('setGroundbaitEffectActive', true)
          }

          dispatch('animateFloatCast', position).then(() => {
            setTimeout(() => {
              if (state.fishingState === 'casting') {
                commit('SET_FISHING_STATE', 'waiting')

                const waitTime = Math.random() * 4000 + 2000
                const biteTimeout = setTimeout(() => {
                  if (state.fishingState === 'waiting') {
                    dispatch('fishBite')
                  }
                }, waitTime)

                dispatch('setBiteTimeout', biteTimeout)
              }
              resolve(true)
            }, CAST_ANIMATION_DURATION)
          })
        })
      })
    },
    animateFloatCast({ commit }: any, targetPosition: { x: number; y: number }): Promise<void> {
      return new Promise((resolve) => {
        const startTime = Date.now()
        const startPosition = { x: ROD_POSITION_X, y: ROD_POSITION_Y }
        const duration = CAST_ANIMATION_DURATION

        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)

          const currentX = startPosition.x + (targetPosition.x - startPosition.x) * progress
          const currentY = startPosition.y + (targetPosition.y - startPosition.y) * progress * progress

          commit('SET_FLOAT_POSITION', { x: currentX, y: currentY })

          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            commit('SET_FLOAT_POSITION', targetPosition)
            resolve()
          }
        }

        animate()
      })
    },
    fishBite({ commit, dispatch, rootGetters, state }: any): void {
      if (state.fishingState !== 'waiting') {
        return
      }

      commit('SET_FISHING_STATE', 'fighting')
      commit('SET_FISHING_START_TIME', Date.now())

      const location = rootGetters['fishing/currentLocation']
      const strengthBonus = rootGetters['fishing/totalStrengthBonus']
      const floatPosition = state.floatPosition

      const selectedFish = selectFishWithGroundbait(
        location,
        floatPosition,
        rootGetters['fishing/getFishAttractionMultiplier']
      )

      if (!selectedFish) {
        return
      }

      const { size, weight } = selectFishSize(selectedFish)

      const multipliers = calculateSizeMultipliers(selectedFish, size, weight)

      let caughtFish = { ...selectedFish }
      caughtFish.strength = Math.floor(caughtFish.strength * multipliers.strength)

      caughtFish.caughtSize = size
      caughtFish.weight = weight
      caughtFish.actualStrength = caughtFish.strength

      const finalStrength = Math.max(1, caughtFish.strength - strengthBonus)
      caughtFish.strength = finalStrength

      commit('SET_CURRENT_FISH', caughtFish)

      const movement = initFishMovement(caughtFish, floatPosition.x, floatPosition.y)
      commit('SET_FISH_MOVEMENT', movement)
      commit('SET_FISH_POSITION', { x: floatPosition.x, y: floatPosition.y })

      const distanceToRod = calculateDistanceToRod(floatPosition.x, floatPosition.y)
      commit('SET_DISTANCE_TO_ROD', distanceToRod)

      const initialTension = calculateTension(
        floatPosition.x,
        floatPosition.y,
        false,
        movement.stamina
      )
      commit('SET_TENSION', initialTension)

      const interval = setInterval(() => {
        dispatch('gameLoop')
      }, GAME_LOOP_INTERVAL)

      dispatch('setGameInterval', interval)
    },
    gameLoop({ state, commit, dispatch, rootGetters }: any): void {
      if (state.fishingState !== 'fighting' || !state.currentFish || !state.fishMovement) return

      const strengthBonus = rootGetters['fishing/totalStrengthBonus']
      const fishStrength = state.currentFish.actualStrength || state.currentFish.strength

      const newMovement = updateFishMovement(
        state.fishMovement,
        state.isReeling,
        strengthBonus,
        fishStrength
      )

      const tension = calculateTension(
        newMovement.x,
        newMovement.y,
        state.isReeling,
        newMovement.stamina
      )

      commit('SET_FISH_MOVEMENT', newMovement)
      commit('SET_FISH_POSITION', { x: newMovement.x, y: newMovement.y })

      const distanceToRod = calculateDistanceToRod(newMovement.x, newMovement.y)
      commit('SET_DISTANCE_TO_ROD', distanceToRod)

      commit('SET_TENSION', tension)

      if (newMovement.isStruggling && !state.fishMovement.isStruggling) {
        dispatch('incrementFishStruggleCount')
      }

      dispatch('checkNetConditions')
      dispatch('checkGameConditions')
    },
    checkNetConditions({ state, rootGetters, dispatch }: any): void {
      const equippedNet = rootGetters['fishing/equippedNet']
      const distanceToRod = state.distanceToRod
      const netActivationDistance = state.netActivationDistance

      if (equippedNet && equippedNet.usesLeft > 0 && distanceToRod <= netActivationDistance) {
        dispatch('setNetAvailable', true)
      } else {
        dispatch('setNetAvailable', false)
      }
    },
    checkGameConditions({ state, dispatch, rootGetters }: any): void {
      const equippedTackle = rootGetters['fishing/equippedTackle']
      const currentRod = equippedTackle.rod

      if (state.tension > TENSION_DANGER_THRESHOLD &&
          state.isReeling &&
          currentRod &&
          currentRod.id !== 'rod_basic') {

        const shouldBreak = checkRodBreak(state.tension, state.currentFish?.strength || 1, currentRod)

        if (shouldBreak) {
          dispatch('breakFishingRod', currentRod.id)
          return
        }
      }

      if (state.distanceToRod <= 8) {
        dispatch('catchSuccess')
        return
      }

      if (state.distanceToRod >= 75 && !state.isReeling) {
        dispatch('fishEscape', 'Рыба ушла слишком далеко!')
        return
      }

      if (state.tension >= TENSION_MAX && state.isReeling) {
        dispatch('fishEscape', 'Леска порвалась!')
        return
      }

      if (state.fishMovement?.stamina < 15 && state.distanceToRod < 20) {
        dispatch('catchSuccess')
        return
      }
    },
    breakFishingRod({ dispatch, commit, state }: any, rodId: string): void {
      return new Promise((resolve) => {
        dispatch('clearGameInterval')
        commit('SET_FISHING_STATE', 'failed')
        commit('SET_IS_REELING', false)

        commit('SET_FISHING_RESULT', {
          type: 'rod_break',
          message: 'Удочка сломалась!',
          brokenItemId: rodId
        })
        commit('SET_SHOW_RESULT', true)

        dispatch('fishing/removeBrokenRod', rodId, { root: true }).then(() => {
          setTimeout(() => {
            dispatch('resetGame')
            resolve()
          }, 3000)
        })
      })
    },
    catchSuccess({ state, commit, dispatch, rootGetters }: any): void {
      commit('SET_FISHING_STATE', 'success')
      commit('SET_IS_REELING', false)
      dispatch('clearGameInterval')
      commit('CLEAR_NET_BROKEN_MESSAGE')

      const duration = Math.floor((Date.now() - state.fishingStartTime) / 1000)

      if (state.currentFish) {
        const sizeBonus = state.currentFish.caughtSize?.name === 'Трофейный' ? '🏆 ' :
                         state.currentFish.caughtSize?.name === 'Крупный' ? '💠 ' :
                         state.currentFish.caughtSize?.name === 'Средний' ? '🔷 ' : '🔸 '

        commit('SET_FISHING_RESULT', {
          type: 'success',
          message: `${sizeBonus}Поймали ${state.currentFish.emoji} ${state.currentFish.name} за ${duration} секунд!`,
          duration: duration,
          struggles: state.fishStruggleCount
        })
      }

      if (state.currentFish && state.floatPosition) {
        const location = rootGetters['fishing/currentLocation']
        if (location) {
          dispatch('fishing/onFishCaught', {
            locationId: location.id,
            position: state.floatPosition
          }, { root: true })
        }
      }

      commit('SET_SHOW_RESULT', true)
    },
    fishEscape({ dispatch, commit, state }: any, message: string): void {
      if (state.fishingState === 'failed') {
        return
      }

      dispatch('clearGameInterval')
      commit('SET_FISHING_STATE', 'failed')
      commit('SET_IS_REELING', false)
      commit('CLEAR_NET_BROKEN_MESSAGE')

      commit('SET_FISHING_RESULT', {
        type: 'failed',
        message: message
      })
      commit('SET_SHOW_RESULT', true)
    },
    startReeling({ commit, state }: any): void {
      if (state.fishingState === 'fighting') {
        commit('SET_IS_REELING', true)
      }
    },
    stopReeling({ commit }: any): void {
      commit('SET_IS_REELING', false)
    },
    stopGameLoop({ dispatch }: any): void {
      dispatch('clearGameInterval')
      dispatch('clearBiteTimeout')
    },
    useNet({ state, commit, rootGetters, dispatch }: any): void {
      if (state.fishingState !== 'fighting') {
        return
      }

      if (!state.isNetAvailable) {
        return
      }

      if (state.isNetUsed) {
        return
      }

      const currentFish = state.currentFish
      const equippedNet = rootGetters['fishing/equippedNet']

      if (!currentFish || !equippedNet) {
        return
      }

      const fishWeightGrams = currentFish.weight || 0
      const fishWeightKg = fishWeightGrams / 1000
      const netMaxWeight = equippedNet.maxWeight || 3

      if (fishWeightKg > netMaxWeight) {
        dispatch('fishing/breakNet', null, { root: true })
          .then(() => {
            const brokenMessage = `💥 Сачок сломался! Рыба слишком тяжелая (${fishWeightKg.toFixed(1)}кг > ${netMaxWeight}кг)`
            dispatch('setNetBrokenMessage', brokenMessage)

            commit('SET_NET_USED', true)

            dispatch('setNetAvailable', false)

            setTimeout(() => {
              dispatch('clearNetBrokenMessage')
            }, 3000)
          })

        return
      }

      dispatch('fishing/useNet', { fishWeight: currentFish.weight }, { root: true })
        .then((result: any) => {
          if (result.success) {
            commit('SET_NET_USED', true)
            dispatch('catchSuccess')
          } else {
            if (result.netBroken) {
              dispatch('setNetBrokenMessage', result.message || 'Сачок сломался!')

              commit('SET_NET_USED', true)

              dispatch('setNetAvailable', false)

              setTimeout(() => {
                dispatch('clearNetBrokenMessage')
              }, 3000)
            } else {
              const errorMessage = result.message || 'Не удалось использовать сачок'
              dispatch('setNetBrokenMessage', errorMessage)

              setTimeout(() => {
                dispatch('clearNetBrokenMessage')
              }, 2000)
            }
          }
        })
    },
    showTemporaryMessage({ commit, dispatch }: any, { message, duration = 3000 }: { message: string, duration?: number }): void {
      commit('SET_NET_BROKEN_MESSAGE', message)

      setTimeout(() => {
        dispatch('clearNetBrokenMessage')
      }, duration)
    }
  }
}