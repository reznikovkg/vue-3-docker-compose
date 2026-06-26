import { startElements, findMixRecipe, findCraftRecipe, getElementById } from '../data/alchemyData.js'

const MUTATIONS = {
  DISCOVER_ELEMENT: 'DISCOVER_ELEMENT',
  PUT_ON_TABLE: 'PUT_ON_TABLE',
  REMOVE_FROM_TABLE: 'REMOVE_FROM_TABLE',
  CHANGE_TABLE_QTY: 'CHANGE_TABLE_QTY',
  CLEAR_TABLE: 'CLEAR_TABLE',
  SET_CRAFT_SLOT: 'SET_CRAFT_SLOT',
  CLEAR_CRAFT_SLOTS: 'CLEAR_CRAFT_SLOTS',
  SET_NOTICE: 'SET_NOTICE',
}

export default {
  namespaced: true,

  state: () => ({
    // элементы, которые игрок уже открыл (видны в верхнем гриде)
    discovered: [...startElements],
    // содержимое стола: [{ id, quantity }, ...]
    table: [],
    // 9 ячеек крафт-сетки: либо id элемента, либо null (пустая ячейка)
    craftSlots: Array(9).fill(null),
    // текст всплывающего уведомления (null — уведомления нет)
    notice: null,
  }),

  getters: {
    discoveredElements: (state) => state.discovered,

    tableItems: (state) =>
      state.table.map((item) => ({
        ...item,
        ...getElementById(item.id),
      })),

    craftSlots: (state) =>
      state.craftSlots.map((id) => (id ? getElementById(id) : null)),

    hasFreeCraftSlot: (state) => state.craftSlots.some((id) => id === null),

    notice: (state) => state.notice,

    isDiscovered: (state) => (id) => state.discovered.some((el) => el.id === id),
  },

  mutations: {
    [MUTATIONS.DISCOVER_ELEMENT](state, element) {
      const already = state.discovered.some((el) => el.id === element.id)
      if (!already) {
        state.discovered.push(element)
      }
    },

    [MUTATIONS.PUT_ON_TABLE](state, elementId) {
      const item = state.table.find((it) => it.id === elementId)
      if (item) {
        item.quantity += 1
      } else {
        state.table.push({ id: elementId, quantity: 1 })
      }
    },

    [MUTATIONS.CHANGE_TABLE_QTY](state, { id, delta }) {
      const item = state.table.find((it) => it.id === id)
      if (!item) return
      item.quantity += delta
      if (item.quantity <= 0) {
        state.table = state.table.filter((it) => it.id !== id)
      }
    },

    [MUTATIONS.REMOVE_FROM_TABLE](state, { id, amount }) {
      const item = state.table.find((it) => it.id === id)
      if (!item) return
      item.quantity -= amount
      if (item.quantity <= 0) {
        state.table = state.table.filter((it) => it.id !== id)
      }
    },

    [MUTATIONS.CLEAR_TABLE](state) {
      state.table = []
    },

    [MUTATIONS.SET_CRAFT_SLOT](state, { index, elementId }) {
      state.craftSlots[index] = elementId
    },

    [MUTATIONS.CLEAR_CRAFT_SLOTS](state) {
      state.craftSlots = Array(9).fill(null)
    },

    [MUTATIONS.SET_NOTICE](state, text) {
      state.notice = text
    },
  },

  actions: {
    // клик по элементу в верхнем гриде — всегда кладём на стол
    pickElement({ commit }, element) {
      commit(MUTATIONS.PUT_ON_TABLE, element.id)
      commit(MUTATIONS.SET_NOTICE, null)
    },

    increaseTableItem({ commit }, id) {
      commit(MUTATIONS.CHANGE_TABLE_QTY, { id, delta: 1 })
    },

    decreaseTableItem({ commit }, id) {
      commit(MUTATIONS.CHANGE_TABLE_QTY, { id, delta: -1 })
    },

    clearTable({ commit }) {
      commit(MUTATIONS.CLEAR_TABLE)
      commit(MUTATIONS.SET_NOTICE, null)
    },

    // кнопка "Смешать" — берём ВСЕ элементы со стола как один набор ингредиентов
    mixOnTable({ state, commit, getters }) {
      if (!state.table.length) {
        commit(MUTATIONS.SET_NOTICE, 'Стол пуст — выберите элементы')
        return
      }

      const ids = state.table.map((it) => it.id)
      const recipe = findMixRecipe(ids)

      if (!recipe) {
        commit(MUTATIONS.SET_NOTICE, 'Такого рецепта не существует')
        return
      }

      if (getters.isDiscovered(recipe.result)) {
        commit(MUTATIONS.SET_NOTICE, 'Этот элемент уже открыт')
        return
      }

      const newElement = getElementById(recipe.result)
      commit(MUTATIONS.DISCOVER_ELEMENT, newElement)
      commit(MUTATIONS.CLEAR_TABLE)
      commit(MUTATIONS.PUT_ON_TABLE, newElement.id)
      commit(MUTATIONS.SET_NOTICE, `Открыт новый элемент: ${newElement.name}!`)
    },

    // отдельный клик по элементу НА СТОЛЕ — переносит 1 штуку в первый свободный слот крафта
    moveToCraftSlot({ state, commit, getters }, id) {
      const item = state.table.find((it) => it.id === id)
      if (!item) return

      const freeIndex = state.craftSlots.findIndex((slot) => slot === null)
      if (freeIndex === -1) {
        commit(MUTATIONS.SET_NOTICE, 'Все слоты крафта заняты')
        return
      }

      commit(MUTATIONS.SET_CRAFT_SLOT, { index: freeIndex, elementId: id })
      commit(MUTATIONS.CHANGE_TABLE_QTY, { id, delta: -1 })
      commit(MUTATIONS.SET_NOTICE, null)
    },

    // клик по заполненному слоту крафта — возвращает элемент на стол
    returnFromCraftSlot({ state, commit }, index) {
      const elementId = state.craftSlots[index]
      if (!elementId) return

      commit(MUTATIONS.SET_CRAFT_SLOT, { index, elementId: null })
      commit(MUTATIONS.PUT_ON_TABLE, elementId)
    },

    clearCraftSlots({ state, commit }) {
      // всё, что было в слотах, возвращается на стол
      state.craftSlots.forEach((elementId) => {
        if (elementId) commit(MUTATIONS.PUT_ON_TABLE, elementId)
      })
      commit(MUTATIONS.CLEAR_CRAFT_SLOTS)
      commit(MUTATIONS.SET_NOTICE, null)
    },

    // кнопка "Создать" в панели крафта 3х3
    craft({ state, commit, getters }) {
      const recipe = findCraftRecipe(state.craftSlots)

      if (!recipe) {
        commit(MUTATIONS.SET_NOTICE, 'Неверная комбинация для крафта')
        return
      }

      const newElement = getElementById(recipe.result)
      commit(MUTATIONS.DISCOVER_ELEMENT, newElement)
      commit(MUTATIONS.CLEAR_CRAFT_SLOTS)
      commit(MUTATIONS.PUT_ON_TABLE, newElement.id)
      commit(MUTATIONS.SET_NOTICE, `Создан элемент: ${newElement.name}!`)
    },

    clearNotice({ commit }) {
      commit(MUTATIONS.SET_NOTICE, null)
    },
  },
}