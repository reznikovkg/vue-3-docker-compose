export default {
  namespaced: true,
  state() {
    return {
      fishNames: {
        common: 'Окунь',
        rare: 'Карп',
        legendary: 'Язь'
      },
      fishPrices: {
        common: 5,
        rare: 20,
        legendary: 50
      },
      baitsPrices: {
        worms: 1,
        corn: 10,
        maggots: 25,
        groundbait: 5
      }
    }
  },
  getters: {
    getFishNames: (state) => state.fishNames,
    getFishPrices: (state) => state.fishPrices,
    getBaitsPrices: (state) => state.baitsPrices,
    getBaitsKit: (state) => state.baitsKit
  }
}
