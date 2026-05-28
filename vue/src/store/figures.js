const FIGURES_STORAGE_KEY = 'prom-figures'

const DEFAULT_COLORS = {
  I: '#00bcd4',
  O: '#ffeb3b',
  T: '#9c27b0',
  S: '#4caf50',
  Z: '#f44336',
  J: '#2196f3',
  L: '#ff9800'
}

const DEFAULT_FIGURE_CELLS = {
  I: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 }
  ],
  O: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ],
  T: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ],
  S: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 }
  ],
  Z: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ],
  J: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 }
  ],
  L: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 }
  ]
}

const MUTATIONS = {
  SET_FIGURES: 'SET_FIGURES'
}

const createDefaultFigures = () => Object.keys(DEFAULT_FIGURE_CELLS).map((type) => ({
  id: `default-${type}`,
  name: type,
  cells: DEFAULT_FIGURE_CELLS[type].map((cell) => ({ ...cell })),
  color: DEFAULT_COLORS[type],
  isDefault: true
}))

const cloneFigure = (figure) => ({
  id: figure.id,
  name: figure.name,
  color: figure.color,
  cells: figure.cells.map((cell) => ({ x: cell.x, y: cell.y })),
  isDefault: Boolean(figure.isDefault)
})

const readFigures = () => {
  if (typeof globalThis.localStorage === 'undefined') {
    return createDefaultFigures()
  }

  const saved = globalThis.localStorage.getItem(FIGURES_STORAGE_KEY)

  if (!saved) {
    return createDefaultFigures()
  }

  try {
    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return createDefaultFigures()
    }

    return parsed.map(cloneFigure)
  } catch (error) {
    return createDefaultFigures()
  }
}

const writeFigures = (figures) => {
  if (typeof globalThis.localStorage === 'undefined') {
    return
  }

  globalThis.localStorage.setItem(FIGURES_STORAGE_KEY, JSON.stringify(figures))
}

let figureIdSeq = 0

const nextFigureId = () => {
  figureIdSeq += 1

  return `custom-${Date.now()}-${figureIdSeq}`
}

const createDefaultState = () => ({
  figures: readFigures()
})

export default {
  namespaced: true,
  state: createDefaultState,
  getters: {
    getFigures: (state) => state.figures,
    getFigureById: (state) => (id) => state.figures.find((figure) => figure.id === id) ?? null
  },
  mutations: {
    [MUTATIONS.SET_FIGURES]: (state, payload) => {
      state.figures = payload
    }
  },
  actions: {
    loadFigures: ({ commit }) => {
      const figures = readFigures()

      commit(MUTATIONS.SET_FIGURES, figures)
    },

    saveFigure: ({ state, commit }, payload) => {
      const { id, name, cells, color } = payload

      if (!Array.isArray(cells) || cells.length === 0) {
        return null
      }

      const existingIndex = state.figures.findIndex((figure) => figure.id === id)
      const isDefault = existingIndex >= 0 ? state.figures[existingIndex].isDefault : false
      const nextFigure = {
        id: existingIndex >= 0 ? id : nextFigureId(),
        name,
        cells: cells.map((cell) => ({ x: cell.x, y: cell.y })),
        color,
        isDefault
      }

      const nextFigures = existingIndex >= 0
        ? state.figures.map((figure, index) => index === existingIndex ? nextFigure : figure)
        : [...state.figures, nextFigure]

      commit(MUTATIONS.SET_FIGURES, nextFigures)
      writeFigures(nextFigures)

      return nextFigure.id
    },

    saveAsNewFigure: ({ state, commit }, payload) => {
      const { name, cells, color } = payload

      if (!Array.isArray(cells) || cells.length === 0) {
        return null
      }

      const nextFigure = {
        id: nextFigureId(),
        name,
        cells: cells.map((cell) => ({ x: cell.x, y: cell.y })),
        color,
        isDefault: false
      }

      const nextFigures = [...state.figures, nextFigure]

      commit(MUTATIONS.SET_FIGURES, nextFigures)
      writeFigures(nextFigures)

      return nextFigure.id
    },

    deleteFigure: ({ state, commit }, id) => {
      const figure = state.figures.find((item) => item.id === id)

      if (!figure || figure.isDefault) {
        return false
      }

      const nextFigures = state.figures.filter((item) => item.id !== id)

      commit(MUTATIONS.SET_FIGURES, nextFigures)
      writeFigures(nextFigures)

      return true
    },

    setFigureColor: ({ state, commit }, payload) => {
      const { id, color } = payload
      const nextFigures = state.figures.map((figure) => figure.id === id ? { ...figure, color } : figure)

      commit(MUTATIONS.SET_FIGURES, nextFigures)
      writeFigures(nextFigures)
    },

    resetFigures: ({ commit }) => {
      const figures = createDefaultFigures()

      commit(MUTATIONS.SET_FIGURES, figures)
      writeFigures(figures)
    }
  }
}
