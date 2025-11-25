import type { FishingState, Fish, FishingResult, GameModuleState, HotSpot, FishSize } from '@/types'

const TENSION_SAFE_THRESHOLD = 30
const TENSION_WARNING_THRESHOLD = 70
const TENSION_DANGER_THRESHOLD = 80
const TENSION_MAX = 100
const TENSION_MIN_FOR_SUCCESS = 10
const BASE_REEL_POWER = 3
const FISH_POWER_MULTIPLIER = 0.3
const STRENGTH_BONUS_MULTIPLIER = 0.5
const BREAK_CHANCE_REDUCTION = 0.02

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
  const fishBreakModifier = fishStrength * 0.05
  const rodDurability = equippedRod.level * 0.3

  const totalBreakChance = baseBreakChance + fishBreakModifier - rodDurability
  return Math.random() < Math.max(0, totalBreakChance)
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
    hotSpotActive: false
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

    tensionClass: (state: GameModuleState): string => {
      if (state.tension < TENSION_SAFE_THRESHOLD) return 'safe'
      if (state.tension < TENSION_WARNING_THRESHOLD) return 'warning'
      return 'danger'
    },

    tensionHint: (state: GameModuleState): string => {
      if (state.tension < 20) return 'Тяните сильнее!'
      if (state.tension < 40) return 'Хорошо! Продолжайте'
      if (state.tension < TENSION_WARNING_THRESHOLD) return 'Осторожно! Натяжение растет'
      return 'Опасно! Леска может порваться!'
    },

    isFighting: (state: GameModuleState): boolean => {
      return state.fishingState === 'fighting'
    },

    canStartFishing: (state: GameModuleState, getters: any, rootState: any, rootGetters: any): boolean => {
      return state.fishingState === 'idle' && rootGetters['fishing/hasBait']
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

    startFishing({ dispatch, commit, state, rootGetters }: any): void {
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
        return
      }
      commit('SET_FISHING_STATE', 'casting')
      commit('SET_FISHING_RESULT', null)
      commit('SET_SHOW_RESULT', false)
      commit('SET_TENSION', 0)
      commit('SET_CURRENT_FISH', null)
      commit('SET_CURRENT_HOT_SPOT', null)
      commit('SET_HOT_SPOT_ACTIVE', false)

      return new Promise((resolve) => {
        dispatch('fishing/useBait', null, { root: true }).then((baitUsed: boolean) => {
          if (!baitUsed) {
            dispatch('fishEscape', 'Закончилась наживка!')
            resolve(false)
            return
          }

          dispatch('checkForHotSpot')

          setTimeout(() => {
            if (state.fishingState === 'casting') {
              commit('SET_FISHING_STATE', 'waiting')

              const location = rootGetters['fishing/currentLocation']
              const waitTime = Math.random() * 3000 + 2000
              const biteTimeout = setTimeout(() => {
                if (state.fishingState === 'waiting') {
                  dispatch('fishBite')
                }
              }, waitTime)

              dispatch('setBiteTimeout', biteTimeout)
            }
            resolve(true)
          }, 1500)

        }).catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
          dispatch('fishEscape', `Ошибка при использовании наживки: ${errorMessage}`)
          resolve(false)
        })
      })
    },

    checkForHotSpot({ commit, rootGetters }: any): void {
      const location = rootGetters['fishing/currentLocation']
      if (!location?.hotSpots) {
        return
      }

      const activeSpots = location.hotSpots.filter((spot: HotSpot) => spot.active)
      if (activeSpots.length === 0) {
        return
      }

      const randomSpot = activeSpots[Math.floor(Math.random() * activeSpots.length)]
      if (Math.random() < randomSpot.chance) {
        commit('SET_CURRENT_HOT_SPOT', randomSpot)
        commit('SET_HOT_SPOT_ACTIVE', true)
      }
    },

    fishBite({ commit, dispatch, rootGetters, state }: any): void {
      if (state.fishingState !== 'waiting') {
        return
      }

      commit('SET_FISHING_STATE', 'fighting')

      const location = rootGetters['fishing/currentLocation']
      const strengthBonus = rootGetters['fishing/totalStrengthBonus']

      let randomFish = { ...location.fish[Math.floor(Math.random() * location.fish.length)] }
      const { size, weight } = selectFishSize(randomFish)
      const multipliers = calculateSizeMultipliers(randomFish, size, weight)
      const originalStrength = randomFish.strength
      randomFish.strength = Math.floor(randomFish.strength * multipliers.strength)

      randomFish.caughtSize = size
      randomFish.weight = weight
      randomFish.actualStrength = randomFish.strength

      const finalStrength = Math.max(1, randomFish.strength - strengthBonus)
      randomFish.strength = finalStrength

      commit('SET_CURRENT_FISH', randomFish)

      const baseTension = Math.floor(Math.random() * 30) + 40
      const sizeTensionBonus = (multipliers.strength - 1) * 20
      const adjustedTension = Math.max(15, baseTension + sizeTensionBonus - strengthBonus * 2)

      commit('SET_TENSION', adjustedTension)

      const interval = setInterval(() => {
        dispatch('gameLoop')
      }, 200)
      dispatch('setGameInterval', interval)
    },

    gameLoop({ state, commit, dispatch, rootGetters }: any): void {
      if (state.fishingState !== 'fighting') return

      const fishStrength = state.currentFish?.strength || 1
      const strengthBonus = rootGetters['fishing/totalStrengthBonus']
      let newTension = state.tension

      if (state.isReeling) {
        const reelPower = BASE_REEL_POWER + strengthBonus * STRENGTH_BONUS_MULTIPLIER
        newTension = state.tension - reelPower
      } else {
        const fishPower = 1 + (fishStrength * FISH_POWER_MULTIPLIER * state.difficultyMultiplier)
        newTension = state.tension + fishPower
      }

      newTension = Math.round(newTension)
      commit('SET_TENSION', newTension)
      dispatch('checkGameConditions')
    },

    checkGameConditions({ state, dispatch, rootGetters }: any): void {
      const equippedTackle = rootGetters['fishing/equippedTackle']
      const currentRod = equippedTackle.rod

      if (state.tension > TENSION_DANGER_THRESHOLD && currentRod && currentRod.id !== 'rod_basic') {
        const shouldBreak = checkRodBreak(state.tension, state.currentFish?.strength || 1, currentRod)

        if (shouldBreak) {
          dispatch('breakFishingRod', currentRod.id)
          return
        }
      }

      if (state.tension >= TENSION_MAX) {
        dispatch('fishEscape', 'Леска порвалась! Рыба ушла')
        return
      }

      if (state.tension <= TENSION_MIN_FOR_SUCCESS) {
        dispatch('catchSuccess')
        return
      }

      const breakChance = (state.tension - 50) / 100
      const strengthBonus = rootGetters['fishing/totalStrengthBonus']

      let adjustedBreakChance = Math.max(0, breakChance - strengthBonus * BREAK_CHANCE_REDUCTION)

      if (state.currentFish?.caughtSize) {
        const sizeMultiplier = state.currentFish.sizeMultipliers?.escapeChance || 1
        const normalizedWeight = (state.currentFish.weight! - state.currentFish.caughtSize.minWeight) /
                               (state.currentFish.caughtSize.maxWeight - state.currentFish.caughtSize.minWeight)
        const sizeEscapeBonus = (sizeMultiplier - 1) * normalizedWeight * 0.3
        adjustedBreakChance += sizeEscapeBonus
      }
    },

    breakFishingRod({ dispatch, commit, state }: any, rodId: string): void {
      return new Promise((resolve) => {
        dispatch('clearGameInterval')
        commit('SET_FISHING_STATE', 'failed')
        commit('SET_IS_REELING', false)

        commit('SET_FISHING_RESULT', {
          type: 'rod_break',
          message: 'Удочка сломалась от сильного натяжения!',
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

    catchSuccess({ state, commit, dispatch }: any): void {
      commit('SET_FISHING_STATE', 'success')
      commit('SET_IS_REELING', false)
      dispatch('clearGameInterval')

      if (state.currentFish) {
        commit('SET_FISHING_RESULT', {
          type: 'success',
          message: `Поймали ${state.currentFish.emoji} ${state.currentFish.name}!`
        })
      }

      commit('SET_SHOW_RESULT', true)

      setTimeout(() => {
        dispatch('resetGame')
      }, 3000)
    },

    fishEscape({ dispatch, commit, state }: any, message: string): void {
      if (state.fishingState === 'failed') {
        return
      }

      dispatch('clearGameInterval')
      commit('SET_FISHING_STATE', 'failed')
      commit('SET_IS_REELING', false)

      commit('SET_FISHING_RESULT', {
        type: 'failed',
        message: message
      })
      commit('SET_SHOW_RESULT', true)

      setTimeout(() => {
        dispatch('resetGame')
      }, 3000)
    },

    stopGameLoop({ dispatch }: any): void {
      dispatch('clearGameInterval')
      dispatch('clearBiteTimeout')
    }
  }
}