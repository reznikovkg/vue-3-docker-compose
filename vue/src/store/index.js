import { createStore } from 'vuex'

const MUTATIONS = {
  SET_LEVEL: 'SET_LEVEL',
  SET_LAYERS: 'SET_LAYERS',
  START_GAME: 'START_GAME',
  FLIP_CARD: 'FLIP_CARD',
  CLOSE_CARDS: 'CLOSE_CARDS',
  REMOVE_CARDS: 'REMOVE_CARDS',
  UPDATE_TIMER: 'UPDATE_TIMER',
  FINISH_GAME: 'FINISH_GAME',
  RESET_GAME: 'RESET_GAME',
  SET_RECORD: 'SET_RECORD'
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5)
}

function createCards(level, layers) {
  let pairs = 6

  if (level === 'medium') {
    pairs = 10
  }

  if (level === 'hard') {
    pairs = 15
  }

  const cards = []

  for (let layer = 1; layer <= layers; layer++) {
    for (let i = 1; i <= pairs; i++) {
      for (let j = 0; j < 2; j++) {
        cards.push({
          id: Date.now() + Math.random(),
          value: i,
          opened: false,
          removed: false,
          layer: layer
        })
      }
    }
  }

  return shuffle(cards)
}

export default createStore({
  state() {
    return {
      level: 'easy',
      layers: 1,
      currentLayer: 1,
      cards: [],
      selectedCards: [],
      timer: 0,
      gameFinished: false,
      interval: null,
      record: localStorage.getItem('record') || null
    }
  },

  getters: {
    cards: state => state.cards,
    timer: state => state.timer,
    gameFinished: state => state.gameFinished,
    record: state => state.record,
    layers: state => state.layers,
    currentLayer: state => state.currentLayer
  },

  mutations: {
    [MUTATIONS.SET_LEVEL](state, payload) {
      state.level = payload
    },

    [MUTATIONS.SET_LAYERS](state, payload) {
      state.layers = payload
    },

    [MUTATIONS.START_GAME](state) {
      state.cards = createCards(
        state.level,
        state.layers
      )

      state.timer = 0
      state.selectedCards = []
      state.currentLayer = 1
      state.gameFinished = false
    },

    [MUTATIONS.FLIP_CARD](state, id) {
      const card = state.cards.find(c => c.id === id)

      if (card) {
        card.opened = true
        state.selectedCards.push(card)
      }
    },

    [MUTATIONS.CLOSE_CARDS](state) {
      state.selectedCards.forEach(card => {
        card.opened = false
      })

      state.selectedCards = []
    },

    [MUTATIONS.REMOVE_CARDS](state) {
      state.selectedCards.forEach(card => {
        card.removed = true
      })

      state.selectedCards = []
    },

    [MUTATIONS.UPDATE_TIMER](state) {
      state.timer++
    },

    [MUTATIONS.FINISH_GAME](state) {
      state.gameFinished = true
    },

    [MUTATIONS.RESET_GAME](state) {
      state.cards = []
      state.timer = 0
      state.selectedCards = []
      state.currentLayer = 1
      state.gameFinished = false
    },

    [MUTATIONS.SET_RECORD](state, payload) {
      state.record = payload
      localStorage.setItem('record', payload)
    }
  },

  actions: {
    startGame({ commit, state }) {
      commit(MUTATIONS.START_GAME)

      if (state.interval) {
        clearInterval(state.interval)
      }

      state.interval = setInterval(() => {
        commit(MUTATIONS.UPDATE_TIMER)
      }, 1000)
    },

    flipCard({ state, commit, dispatch }, id) {
      const card = state.cards.find(c => c.id === id)

      if (!card) return
      if (card.opened) return
      if (card.removed) return

      if (card.layer !== state.currentLayer) {
        return
      }

      if (state.selectedCards.length >= 2) {
        return
      }

      commit(MUTATIONS.FLIP_CARD, id)

      if (state.selectedCards.length === 2) {
        const first = state.selectedCards[0]
        const second = state.selectedCards[1]

        if (first.value === second.value) {
          setTimeout(() => {
            commit(MUTATIONS.REMOVE_CARDS)
            dispatch('checkFinish')
          }, 500)
        } else {
          setTimeout(() => {
            commit(MUTATIONS.CLOSE_CARDS)
          }, 1000)
        }
      }
    },

    checkFinish({ state, commit }) {
      const currentLayerCards = state.cards.filter(card => {
        return (
          card.layer === state.currentLayer &&
          !card.removed
        )
      })

      if (
        currentLayerCards.length === 0 &&
        state.currentLayer < state.layers
      ) {
        state.currentLayer++
        return
      }

      const activeCards = state.cards.filter(card => {
        return !card.removed
      })

      if (
        activeCards.length === 0 &&
        state.cards.length > 0
      ) {
        clearInterval(state.interval)

        commit(MUTATIONS.FINISH_GAME)

        if (
          !state.record ||
          state.timer < state.record
        ) {
          commit(MUTATIONS.SET_RECORD, state.timer)
        }
      }
    },

    resetGame({ commit, state }) {
      if (state.interval) {
        clearInterval(state.interval)
      }

      commit(MUTATIONS.RESET_GAME)
    },

    setLevel({ commit }, level) {
      commit(MUTATIONS.SET_LEVEL, level)
    },

    setLayers({ commit }, layers) {
      commit(MUTATIONS.SET_LAYERS, layers)
    }
  }
})