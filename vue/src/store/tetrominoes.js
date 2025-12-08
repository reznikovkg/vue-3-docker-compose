import { TETROMINOES } from '../business/Tetrominoes.js'

const MUTATIONS = {
  SET_CUSTOM_TETROMINOES: 'SET_CUSTOM_TETROMINOES',
  ADD_CUSTOM_TETROMINO: 'ADD_CUSTOM_TETROMINO',
  UPDATE_TETROMINO: 'UPDATE_TETROMINO',
  DELETE_TETROMINO: 'DELETE_TETROMINO',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE'
}

// Преобразуем базовые фигуры в редактируемый формат
const createEditableTetrominoes = () => {
  const editable = {}
  Object.keys(TETROMINOES).forEach(key => {
    const tetromino = TETROMINOES[key]
    // Извлекаем цвет из className
    const colorMatch = tetromino.className.match(/tetromino__(\w+)/)
    const colorKey = colorMatch ? colorMatch[1] : key.toLowerCase()
    
    editable[key] = {
      id: key,
      name: key,
      shape: tetromino.shape,
      color: colorKey,
      isCustom: false,
      isBase: true
    }
  })
  return editable
}

// Вспомогательные функции для работы с хранилищем
const STORAGE_KEY = 'tetris_tetrominoes'

const saveToStorageSync = (data) => {
  try {
    // Пробуем window.storage (для Claude Artifacts)
    if (window.storage && typeof window.storage.set === 'function') {
      window.storage.set(STORAGE_KEY, JSON.stringify(data))
        .then(() => console.log(' Фигуры сохранены (window.storage)'))
        .catch(err => console.error(' Ошибка window.storage:', err))
    } 
    // Fallback на localStorage
    else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log(' Фигуры сохранены (localStorage)')
    } else {
      console.warn(' Хранилище недоступно, фигуры не сохранены')
    }
  } catch (error) {
    console.error(' Ошибка сохранения:', error)
  }
}

const loadFromStorageSync = () => {
  try {
    // Пробуем window.storage (для Claude Artifacts)
    if (window.storage && typeof window.storage.get === 'function') {
      return window.storage.get(STORAGE_KEY)
        .then(result => {
          if (result && result.value) {
            console.log(' Фигуры загружены (window.storage)')
            return JSON.parse(result.value)
          }
          return null
        })
        .catch(err => {
          console.log('window.storage недоступен:', err.message)
          return null
        })
    }
    // Fallback на localStorage
    else if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        console.log('Фигуры загружены (localStorage)')
        return Promise.resolve(JSON.parse(data))
      }
    }
    return Promise.resolve(null)
  } catch (error) {
    console.log('Ошибка загрузки:', error.message)
    return Promise.resolve(null)
  }
}

export default {
  namespaced: true,

  state() {
    return {
      baseTetrominoes: createEditableTetrominoes(),
      customTetrominoes: {},
      nextCustomId: 1
    }
  },

  getters: {
    allTetrominoes: (state) => ({
      ...state.baseTetrominoes,
      ...state.customTetrominoes
    }),
    
    baseTetrominoes: (state) => state.baseTetrominoes,
    customTetrominoes: (state) => state.customTetrominoes,
    
    getTetrominoById: (state, getters) => (id) => {
      return getters.allTetrominoes[id]
    },

    // Для использования в игре - возвращает в формате оригинального TETROMINOES
    getGameTetrominoes: (state, getters) => {
      const all = getters.allTetrominoes
      const gameFormat = {}
      
      Object.keys(all).forEach(key => {
        const t = all[key]
        gameFormat[key] = {
          shape: t.shape,
          className: `tetromino tetromino__${t.color}`
        }
      })
      
      return gameFormat
    }
  },

  mutations: {
    [MUTATIONS.SET_CUSTOM_TETROMINOES](state, tetrominoes) {
      state.customTetrominoes = tetrominoes
    },

    [MUTATIONS.ADD_CUSTOM_TETROMINO](state, tetromino) {
      const id = tetromino.id || `CUSTOM_${state.nextCustomId}`
      state.customTetrominoes = {
        ...state.customTetrominoes,
        [id]: {
          ...tetromino,
          id,
          isCustom: true,
          isBase: false
        }
      }
      state.nextCustomId++
    },

    [MUTATIONS.UPDATE_TETROMINO](state, { id, updates }) {
      const isBase = state.baseTetrominoes[id]
      
      if (isBase) {
        state.baseTetrominoes = {
          ...state.baseTetrominoes,
          [id]: {
            ...state.baseTetrominoes[id],
            ...updates
          }
        }
      } else {
        state.customTetrominoes = {
          ...state.customTetrominoes,
          [id]: {
            ...state.customTetrominoes[id],
            ...updates
          }
        }
      }
    },

    [MUTATIONS.DELETE_TETROMINO](state, id) {
      const { [id]: removed, ...rest } = state.customTetrominoes
      state.customTetrominoes = rest
    },

    [MUTATIONS.LOAD_FROM_STORAGE](state, data) {
      if (data.customTetrominoes) {
        state.customTetrominoes = data.customTetrominoes
      }
      if (data.baseTetrominoes) {
        state.baseTetrominoes = {
          ...state.baseTetrominoes,
          ...data.baseTetrominoes
        }
      }
      if (data.nextCustomId) {
        state.nextCustomId = data.nextCustomId
      }
    }
  },

  actions: {
    saveToStorage({ state }) {
      const data = {
        customTetrominoes: state.customTetrominoes,
        baseTetrominoes: state.baseTetrominoes,
        nextCustomId: state.nextCustomId
      }
      
      saveToStorageSync(data)
    },

    loadFromStorage({ commit }) {
      return loadFromStorageSync()
        .then(data => {
          if (data) {
            commit(MUTATIONS.LOAD_FROM_STORAGE, data)
          }
        }).catch(error => {
          console.log(' Не удалось загрузить фигуры:', error.message)
        })
    },

    addCustomTetromino({ commit, dispatch }, tetromino) {
      commit(MUTATIONS.ADD_CUSTOM_TETROMINO, tetromino)
      dispatch('saveToStorage')
    },

    updateTetromino({ commit, dispatch }, { id, updates }) {
      commit(MUTATIONS.UPDATE_TETROMINO, { id, updates })
      dispatch('saveToStorage')
    },

    deleteTetromino({ commit, dispatch }, id) {
      commit(MUTATIONS.DELETE_TETROMINO, id)
      dispatch('saveToStorage')
    },

    resetToDefaults({ state, dispatch }) {
      state.customTetrominoes = {}
      state.baseTetrominoes = createEditableTetrominoes()
      state.nextCustomId = 1
      dispatch('saveToStorage')
    }
  }
}