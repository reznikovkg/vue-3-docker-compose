export const MUTATIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  ADD_FISH: 'ADD_FISH',
  REMOVE_FISH: 'REMOVE_FISH',
  CLEAR_FISH: 'CLEAR_FISH',
  ADD_MONEY: 'ADD_MONEY',
  REMOVE_MONEY: 'REMOVE_MONEY',
  SET_ACTIVE_BAIT: 'SET_ACTIVE_BAIT',
  SET_ACTIVE_ROD: 'SET_ACTIVE_ROD'
}

export const ACTIONS = {
  ADD_ITEM: 'addItem',
  REMOVE_ITEM: 'removeItem',
  SELL_ITEM: 'sellItem',
  ADD_FISH: 'addFish',
  SELL_FISH: 'sellFish',
  SELL_ALL_FISH: 'sellAllFish',
  SET_ACTIVE_BAIT: 'setActiveBait',
  SET_ACTIVE_ROD: 'setActiveRod',
  BUY_ITEM: 'buyItem'
}

export const GETTERS = {
  ITEMS: 'items',
  FISH: 'fish',
  MONEY: 'money',
  ACTIVE_BAIT: 'activeBait',
  ACTIVE_ROD: 'activeRod',
  RODS: 'rods',
  BAITS: 'baits',
  GET_ITEM_BY_ID: 'getItemById'
}

export default {
  namespaced: true,

  state() {
    return {
      items: [],
      fish: [],
      money: 100,
      activeBait: null,
      activeRod: null
    }
  },

  getters: {
    [GETTERS.ITEMS]: (state) => state.items,
    [GETTERS.FISH]: (state) => state.fish,
    [GETTERS.MONEY]: (state) => state.money,
    [GETTERS.ACTIVE_BAIT]: (state) => state.activeBait,
    [GETTERS.ACTIVE_ROD]: (state) => state.activeRod,
    [GETTERS.RODS]: (state) => state.items.filter(i => i.type === 'rod'),
    [GETTERS.BAITS]: (state) => state.items.filter(i => i.type === 'bait'),
    [GETTERS.GET_ITEM_BY_ID]: (state) => (id) => state.items.find(i => i.id === id)
  },

  mutations: {
    [MUTATIONS.ADD_ITEM]: (state, item) => {
      state.items = [...state.items, item]
    },

    [MUTATIONS.REMOVE_ITEM]: (state, id) => {
      state.items = state.items.filter(i => i.id !== id)

      if (state.activeRod === id) {
        state.activeRod = null
      }

      if (state.activeBait === id) {
        state.activeBait = null
      }
    },

    [MUTATIONS.ADD_FISH]: (state, fish) => {
      state.fish = [...state.fish, fish]
    },

    [MUTATIONS.REMOVE_FISH]: (state, index) => {
      state.fish = state.fish.filter((_, i) => i !== index)
    },

    [MUTATIONS.CLEAR_FISH]: (state) => {
      state.fish = []
    },

    [MUTATIONS.ADD_MONEY]: (state, value) => {
      state.money += value
    },

    [MUTATIONS.REMOVE_MONEY]: (state, value) => {
      state.money -= value
    },

    [MUTATIONS.SET_ACTIVE_BAIT]: (state, id) => {
      state.activeBait = id
    },

    [MUTATIONS.SET_ACTIVE_ROD]: (state, id) => {
      state.activeRod = id
    }
  },

  actions: {
    [ACTIONS.ADD_ITEM]: ({ commit }, item) => {
      commit(MUTATIONS.ADD_ITEM, item)
    },

    [ACTIONS.REMOVE_ITEM]: ({ commit }, id) => {
      commit(MUTATIONS.REMOVE_ITEM, id)
    },

    [ACTIONS.SELL_ITEM]: ({ state, commit }, id) => {
      const item = state.items.find(i => i.id === id)

      if (!item) {
        return
      }

      commit(MUTATIONS.ADD_MONEY, item.price)
      commit(MUTATIONS.REMOVE_ITEM, id)
    },

    [ACTIONS.ADD_FISH]: ({ commit }, fish) => {
      commit(MUTATIONS.ADD_FISH, fish)
    },

    [ACTIONS.SELL_FISH]: ({ state, commit }, index) => {
      const fish = state.fish[index]

      if (!fish) {
        return
      }

      const price = Math.round(fish.price * (fish.size / 1000))

      commit(MUTATIONS.ADD_MONEY, price)
      commit(MUTATIONS.REMOVE_FISH, index)
    },

    [ACTIONS.SELL_ALL_FISH]: ({ state, commit }) => {
      let sum = 0

      state.fish.forEach(f => {
        sum += Math.round(f.price * (f.size / 1000))
      })

      commit(MUTATIONS.ADD_MONEY, sum)
      commit(MUTATIONS.CLEAR_FISH)
    },

    [ACTIONS.SET_ACTIVE_BAIT]: ({ commit }, id) => {
      commit(MUTATIONS.SET_ACTIVE_BAIT, id)
    },

    [ACTIONS.SET_ACTIVE_ROD]: ({ commit }, id) => {
      commit(MUTATIONS.SET_ACTIVE_ROD, id)
    },

    [ACTIONS.BUY_ITEM]: ({ state, commit }, item) => {

      if (state.money < item.price) {
          return
      }

      commit(MUTATIONS.ADD_ITEM, item)
      commit(MUTATIONS.REMOVE_MONEY, item.price)
    },
  }
}