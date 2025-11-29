const STORAGE_KEYS = {
  ENTRIES: 'recorder.entries',
  DRAFT: 'recorder.draft'
}

const isBrowser = typeof window !== 'undefined'

const readStorage = (key, fallback) => {
  if (!isBrowser) {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn('[recorder] failed to read storage', error)
    return fallback
  }
}

const writeStorage = (key, value) => {
  if (!isBrowser) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('[recorder] failed to write storage', error)
  }
}

const removeStorage = (key) => {
  if (!isBrowser) {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn('[recorder] failed to remove storage', error)
  }
}

const generateId = () => {
  return `rec-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

export default {
  namespaced: true,
  state () {
    return {
      entries: [],
      draft: null
    }
  },
  getters: {
    getEntries: (state) => state.entries,
    getDraft: (state) => state.draft,
    getEntryById: (state) => (id) => {
      return state.entries.find((entry) => entry.id === id) || null
    },
  },
  mutations: {
    SET_ENTRIES: (state, payload) => {
      state.entries = payload
    },
    SET_DRAFT: (state, payload) => {
      state.draft = payload
    },
  },
  actions: {
    init: ({ commit }) => {
      const entries = readStorage(STORAGE_KEYS.ENTRIES, [])
      const draft = readStorage(STORAGE_KEYS.DRAFT, null)

      commit('SET_ENTRIES', entries)
      commit('SET_DRAFT', draft)
    },
    setDraft: ({ commit }, draft) => {
      commit('SET_DRAFT', draft)

      if (draft) {
        writeStorage(STORAGE_KEYS.DRAFT, draft)
      } else {
        removeStorage(STORAGE_KEYS.DRAFT)
      }
    },
    saveDraft: ({ state, commit, dispatch }, overrides = {}) => {
      const currentDraft = state.draft

      if (!currentDraft) {
        return
      }

      const entry = {
        ...currentDraft,
        ...overrides,
        id: overrides.id || generateId()
      }

      const entries = [entry, ...state.entries]

      commit('SET_ENTRIES', entries)
      writeStorage(STORAGE_KEYS.ENTRIES, entries)
      dispatch('setDraft', null)
    },
    removeEntry: ({ state, commit }, id) => {
      const entries = state.entries.filter((entry) => entry.id !== id)

      commit('SET_ENTRIES', entries)
      writeStorage(STORAGE_KEYS.ENTRIES, entries)
    },
    updateEntry: ({ state, commit }, payload) => {
      const entries = state.entries.map((entry) => {
        if (entry.id !== payload.id) {
          return entry
        }

        return {
          ...entry,
          ...payload
        }
      })

      commit('SET_ENTRIES', entries)
      writeStorage(STORAGE_KEYS.ENTRIES, entries)
    }
  }
}
