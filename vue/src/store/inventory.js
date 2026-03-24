export const MUTATIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  ADD_FISH: 'ADD_FISH',
  REMOVE_FISH: 'REMOVE_FISH',
  CLEAR_FISH: 'CLEAR_FISH',
  ADD_MONEY: 'ADD_MONEY',
  REMOVE_MONEY: 'REMOVE_MONEY',
  SET_ACTIVE_BAIT: 'SET_ACTIVE_BAIT',
  SET_ACTIVE_ROD: 'SET_ACTIVE_ROD',
  SET_ACTIVE_NET: 'SET_ACTIVE_NET',
  SET_ACTIVE_GROUNDBAIT: 'SET_ACTIVE_GROUNDBAIT',
  USE_GROUNDBAIT: 'USE_GROUNDBAIT',
  USE_ITEM: 'USE_ITEM',
  SET_GROUNDBAIT_SPOT: 'SET_GROUNDBAIT_SPOT',
  CLEAR_GROUNDBAIT_SPOT: 'CLEAR_GROUNDBAIT_SPOT'
}
export const ACTIONS = {
  ADD_ITEM: 'addItem',
  SELL_ITEM: 'sellItem',
  ADD_FISH: 'addFish',
  SELL_FISH: 'sellFish',
  SELL_ALL_FISH: 'sellAllFish',
  SET_ACTIVE_BAIT: 'setActiveBait',
  SET_ACTIVE_ROD: 'setActiveRod',
  BUY_ITEM: 'buyItem',
  SET_ACTIVE_NET: 'setActiveNet',
  SET_ACTIVE_GROUNDBAIT: 'setActiveGroundbait',
  USE_GROUNDBAIT: 'useGroundbait',
  USE_ROD: 'useRod',
  USE_NET: 'useNet',
  USE_BAIT: 'useBait',
  SET_GROUNDBAIT_SPOT: 'setGroundbaitSpot',
}
export const GETTERS = {
  ITEMS: 'items',
  FISH: 'fish',
  MONEY: 'money',
  ACTIVE_BAIT: 'activeBait',
  ACTIVE_ROD: 'activeRod',
  RODS: 'rods',
  BAITS: 'baits',
  NETS: 'nets',
  ACTIVE_NET: 'activeNet',
  GROUNDBAITS: 'groundbaits',
  ACTIVE_GROUNDBAIT: 'activeGroundbait',
  ACTIVE_GROUNDBAIT_ITEM: 'activeGroundbaitItem',
  GROUNDBAIT_SPOT: 'groundbaitSpot',
}

export default {
  namespaced: true,

  state() {
    return {
      items: [],
      fish: [],
      money: 1000,
      activeBait: null,
      activeRod: null,
      activeNet: null,
      activeGroundbait: null,
      groundbaitSpot: null
    }
  },
  getters: {
    [GETTERS.ITEMS]: (state) => state.items,
    [GETTERS.FISH]: (state) => state.fish,
    [GETTERS.MONEY]: (state) => state.money,
    [GETTERS.ACTIVE_BAIT]: (state) => state.activeBait,
    [GETTERS.ACTIVE_ROD]: (state) => state.activeRod,
    [GETTERS.RODS]: (state) => state.items
      .filter(i => i.type === 'rod' && i.quantity > 0)
      .map(i => ({ ...i, quantity: i.quantity })),
    [GETTERS.BAITS]: (state) => state.items
      .filter(i => i.type === 'bait' && i.quantity > 0)
      .map(i => ({ ...i, quantity: i.quantity })),
    [GETTERS.NETS]: (state) => state.items
      .filter(i => i.type === 'net' && i.quantity > 0)
      .map(i => ({ ...i, quantity: i.quantity })),
    [GETTERS.ACTIVE_NET]: (state) => state.activeNet,
    [GETTERS.GROUNDBAITS]: (state) => state.items
      .filter(i => i.type === 'groundbait' && i.usesLeft > 0)
      .map(i => ({ ...i, usesLeft: i.usesLeft })),
    [GETTERS.ACTIVE_GROUNDBAIT]: (state) => state.activeGroundbait,
    [GETTERS.ACTIVE_GROUNDBAIT_ITEM]: (state) => {
      if (!state.activeGroundbait) return null
      return state.items.find(i => i.id === state.activeGroundbait && i.type === 'groundbait' && i.usesLeft > 0)
    },
    [GETTERS.GROUNDBAIT_SPOT]: (state) => state.groundbaitSpot,
  },
  mutations: {
    [MUTATIONS.ADD_ITEM]: (state, item) => {
      const existingItem = state.items.find(i => i.id === item.id && i.type === item.type)
      if (existingItem) {
        if (item.type === 'groundbait') {
          existingItem.usesLeft += (item.uses || 3)
        } else {
          existingItem.quantity += 1
        }
        state.items = [...state.items]
        return
      }
      const newItem = { ...item }
      if (item.type === 'groundbait') {
        newItem.usesLeft = item.uses || 3
      } else {
        newItem.quantity = 1
      }
      state.items = [...state.items, newItem]
    },
    [MUTATIONS.REMOVE_ITEM]: (state, id) => {
      const item = state.items.find(i => i.id === id)
      if (!item) return
      if (item.type === 'groundbait' || item.quantity === 1) {
        state.items = state.items.filter(i => i.id !== id)
      } else {
        item.quantity -= 1
        state.items = [...state.items]
      }
      const activeKey = {
        rod: 'activeRod',
        bait: 'activeBait',
        net: 'activeNet',
        groundbait: 'activeGroundbait'
      }[item.type]
      if (activeKey && state[activeKey] === id) {
        const stillExists = state.items.some(i => i.id === id)
        if (!stillExists) state[activeKey] = null
      }
    },
    [MUTATIONS.USE_ITEM]: (state, { id, type }) => {
      const item = state.items.find(i => i.id === id && i.type === type)
      if (!item) return
      const activeKey = {
        rod: 'activeRod',
        bait: 'activeBait',
        net: 'activeNet'
      }[type]
      if (item.quantity > 1) {
        item.quantity--
        state.items = [...state.items]
      } else {
        state.items = state.items.filter(i => i.id !== id)
        if (state[activeKey] === id) state[activeKey] = null
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
    },
    [MUTATIONS.SET_ACTIVE_NET]: (state, id) => {
      state.activeNet = id
    },
    [MUTATIONS.SET_ACTIVE_GROUNDBAIT]: (state, id) => {
      state.activeGroundbait = id
    },
    [MUTATIONS.USE_GROUNDBAIT]: (state, itemId) => {
      const item = state.items.find(i => i.id === itemId && i.type === 'groundbait')
      if (!item) return
      item.usesLeft -= 1
      if (item.usesLeft <= 0) {
        state.items = state.items.filter(i => i.id !== itemId)
        if (state.activeGroundbait === itemId) {
          state.activeGroundbait = null
        }
      }
    },
    [MUTATIONS.SET_GROUNDBAIT_SPOT]: (state, spot) => {
      state.groundbaitSpot = spot
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
    [ACTIONS.SET_ACTIVE_NET]: ({ commit }, id) => {
      commit(MUTATIONS.SET_ACTIVE_NET, id)
    },
    [ACTIONS.SET_ACTIVE_GROUNDBAIT]: ({ commit }, id) => {
      commit(MUTATIONS.SET_ACTIVE_GROUNDBAIT, id)
    },
    [ACTIONS.USE_GROUNDBAIT]: ({ commit }, itemId) => {
      commit(MUTATIONS.USE_GROUNDBAIT, itemId)
    },
    [ACTIONS.USE_ROD]: ({ commit }, id) => {
      commit(MUTATIONS.USE_ITEM, { id, type: 'rod' })
    },
    [ACTIONS.USE_NET]: ({ commit }, id) => {
      commit(MUTATIONS.USE_ITEM, { id, type: 'net' })
    },
    [ACTIONS.USE_BAIT]: ({ commit }, id) => {
      commit(MUTATIONS.USE_ITEM, { id, type: 'bait' })
    },
    [ACTIONS.SET_GROUNDBAIT_SPOT]: ({ commit }, spot) => {
      commit(MUTATIONS.SET_GROUNDBAIT_SPOT, spot)
    },
    [ACTIONS.CLEAR_GROUNDBAIT_SPOT]: ({ commit }) => {
      commit(MUTATIONS.CLEAR_GROUNDBAIT_SPOT)
    }
  }
}