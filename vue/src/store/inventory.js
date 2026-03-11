const MUTATIONS = {
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
    items: (state) => state.items,
    fish: (state) => state.fish,
    money: (state) => state.money,
    activeBait: (state) => state.activeBait,
    activeRod: (state) => state.activeRod,
    rods: (state) => state.items.filter(i => i.type === 'rod'),
    baits: (state) => state.items.filter(i => i.type === 'bait'),
    getItemById: (state) => (id) => state.items.find(i => i.id === id)
  },

  mutations: {
    [MUTATIONS.ADD_ITEM]: (state, item) => {
      state.items.push(item)
    },
    [MUTATIONS.REMOVE_ITEM]: (state, id) => {
      state.items = state.items.filter(i => i.id !== id)
      if (state.activeRod === id) state.activeRod = null
      if (state.activeBait === id) state.activeBait = null
    },
    [MUTATIONS.ADD_FISH]: (state, fish) => {
      state.fish.push(fish)
    },
    [MUTATIONS.REMOVE_FISH]: (state, index) => {
      state.fish.splice(index, 1)
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
    addItem: (store, item) => store.commit(MUTATIONS.ADD_ITEM, item),
    removeItem: (store, id) => store.commit(MUTATIONS.REMOVE_ITEM, id),
    sellItem: (store, id) => {
      const item = store.state.items.find(i => i.id === id)
      if (!item) {
        return
      }
      store.commit(MUTATIONS.ADD_MONEY, item.price)
      store.commit(MUTATIONS.REMOVE_ITEM, id)
    },
    addFish: (store, fish) => store.commit(MUTATIONS.ADD_FISH, fish),
    sellFish: (store, index) => {
      const fish = store.state.fish[index]
      if (!fish) {
        return
      }
      const price = Math.round(fish.price * (fish.size / 1000))
      store.commit(MUTATIONS.ADD_MONEY, price)
      store.commit(MUTATIONS.REMOVE_FISH, index)
    },
    sellAllFish: (store) => {
      let sum = 0
      store.state.fish.forEach(f => {
        sum += Math.round(f.price * (f.size / 1000))
      })
      store.commit(MUTATIONS.ADD_MONEY, sum)
      store.commit(MUTATIONS.CLEAR_FISH)
    },
    setActiveBait: (store, id) => store.commit(MUTATIONS.SET_ACTIVE_BAIT, id),
    setActiveRod: (store, id) => store.commit(MUTATIONS.SET_ACTIVE_ROD, id)
  }
}