import { GAME_CONFIG } from '@/game-config'

const MUTATIONS = {
  SET_CONTENT: 'SET_CONTENT',
}

const buildInitialState = () => ({
  locations: GAME_CONFIG.locations,
  fishDefinitions: GAME_CONFIG.fishDefinitions,
  fishTables: GAME_CONFIG.fishTables,
  gearDefinitions: GAME_CONFIG.gearDefinitions,
  tuning: GAME_CONFIG.tuning,
})

export default {
  namespaced: true,
  state() {
    return buildInitialState()
  },
  getters: {
    getLocations: (state) => state.locations,
    getFishDefinitions: (state) => state.fishDefinitions,
    getFishTables: (state) => state.fishTables,
    getGearDefinitions: (state) => state.gearDefinitions,
    getGearBySlotAndId: (state) => (slot, id) => {
      const slotItems = state.gearDefinitions?.[slot]
      if (!Array.isArray(slotItems)) {
        return null
      }

      return slotItems.find((item) => item.id === id) || null
    },
    getTuning: (state) => state.tuning,
    getLocationById: (state) => (locationId) =>
      state.locations.find((location) => location.id === locationId) || null,
    getConfigWarnings: (state) => {
      const warnings = []

      if (!Array.isArray(state.locations) || state.locations.length === 0) {
        warnings.push('No locations are configured.')
      }

      if (!state.fishTables || typeof state.fishTables !== 'object') {
        warnings.push('Fish tables are unavailable.')
      }

      if (Array.isArray(state.locations)) {
        state.locations.forEach((location, index) => {
          if (!location || typeof location !== 'object') {
            warnings.push(`Location #${index + 1} is invalid.`)
            return
          }

          if (!location.name) {
            warnings.push(`Location ${location.id || index + 1} has no name.`)
          }

          if (!location.bgImage) {
            warnings.push(
              `Location ${location.name || location.id || index + 1} is missing background image.`,
            )
          }

          if (
            !location.bobberAnchor ||
            !Number.isFinite(location.bobberAnchor.x) ||
            !Number.isFinite(location.bobberAnchor.y)
          ) {
            warnings.push(
              `Location ${location.name || location.id || index + 1} is missing bobber anchor coordinates.`,
            )
          }

          if (!location.fishTableId) {
            warnings.push(
              `Location ${location.name || location.id || index + 1} has no fish table id.`,
            )
            return
          }

          if (!state.fishTables?.[location.fishTableId]) {
            warnings.push(
              `Location ${location.name || location.id || index + 1} references missing fish table "${location.fishTableId}".`,
            )
          }
        })
      }

      return warnings
    },
    getLocationWarnings: (state, getters) => (locationId) => {
      const warnings = []
      const location = getters.getLocationById(locationId)

      if (!location) {
        warnings.push('Selected location data is unavailable.')
        return warnings
      }

      if (!location.bgImage) {
        warnings.push(
          `Location "${location.name || location.id}" has no background image. Using fallback scene.`,
        )
      }

      if (
        !location.bobberAnchor ||
        !Number.isFinite(location.bobberAnchor.x) ||
        !Number.isFinite(location.bobberAnchor.y)
      ) {
        warnings.push(
          `Location "${location.name || location.id}" has no bobber anchor. Hiding bobber.`,
        )
      }

      if (!location.fishTableId || !state.fishTables?.[location.fishTableId]) {
        warnings.push(
          `Location "${location.name || location.id}" has an invalid fish table configuration.`,
        )
      }

      return warnings
    },
  },
  mutations: {
    [MUTATIONS.SET_CONTENT]: (state, payload) => {
      state.locations = payload.locations
      state.fishDefinitions = payload.fishDefinitions
      state.fishTables = payload.fishTables
      state.gearDefinitions = payload.gearDefinitions
      state.tuning = payload.tuning
    },
  },
  actions: {
    resetContent({ commit }) {
      commit(MUTATIONS.SET_CONTENT, buildInitialState())
    },
  },
}
