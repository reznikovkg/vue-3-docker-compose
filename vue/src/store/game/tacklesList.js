export default {
  namespaced: true,
  state () {
    return {
      rods: [
        { id: 0, name: 'Тростниковое', price: 0, power: 0.2 },
        { id: 1, name: 'Деревянное', price: 120, power: 2.0 },
        { id: 2, name: 'Карбоновое', price: 800, power: 5.0 }
      ],
      reels: [
        { id: 0, name: 'Простая', price: 0, power: 0.4 },
        { id: 1, name: 'Улучшенная', price: 200, power: 4.0 },
        { id: 2, name: 'Профессиональная', price: 1200, power: 7.0 }
      ],
      bobbers: [
        { id: 0, name: 'Деревянный', price: 0, power: 0.3 },
        { id: 1, name: 'Пластикоый', price: 150, power: 2.5 },
        { id: 2, name: 'Пробковый', price: 600, power: 6.0 },
      ],
      hooks: [
        { id: 0, name: 'Маленький', price: 0, power: 0.2 },
        { id: 1, name: 'Средний', price: 80, power: 1.0 },
        { id: 2, name: 'Большой', price: 300, power: 3.0 },
      ],
      lines: [
        { id: 0, name: 'Тонкая', price: 0, power: 0.6 },
        { id: 1, name: 'Обычная', price: 180, power: 3.0 },
        { id: 2, name: 'Прочная', price: 500, power: 5.0 },
      ]
    }
  },
  getters: {
    getRodsList: (state) => state.rods,
    getReelsList: (state) => state.reels,
    getBobbersList: (state) => state.bobbers,
    getHooksList: (state) => state.hooks,
    getLinesList: (state) => state.lines
  }
}