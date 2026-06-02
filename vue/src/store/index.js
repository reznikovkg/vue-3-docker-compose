import { createStore } from "vuex";
import recipeBook from "@/utils/recipeBook";

const MUTATIONS = {
  ADD_TO_TABLE: "ADD_TO_TABLE",
  DECREASE_FROM_TABLE: "DECREASE_FROM_TABLE",
  REMOVE_FROM_TABLE: "REMOVE_FROM_TABLE",
  CLEAR_TABLE: "CLEAR_TABLE",
  OPEN_ELEMENT: "OPEN_ELEMENT",
  SET_NOTICE: "SET_NOTICE",
  SET_SELECTED: "SET_SELECTED",
  SET_SLOT: "SET_SLOT",
  CLEAR_SLOTS: "CLEAR_SLOTS",
};

export default createStore({
  state() {
    return {
      opened: [...recipeBook.startElements],
      table: {},
      notice: null,
      slots: Array(9).fill(null),
      selected: null,
    };
  },
  getters: {
    openedElements: (state) => state.opened,
    tableElements: (state) => state.table,
    notice: (state) => state.notice,
    craftSlots: (state) => state.slots,
    selectedElement: (state) => state.selected,
    getElement: () => (key) => recipeBook.getElement(key),
    craftRecipes: () => recipeBook.craftRecipes,
    openedCount: (state) => state.opened.length,
    totalCount: () => recipeBook.totalCount(),
  },
  mutations: {
    [MUTATIONS.ADD_TO_TABLE](state, key) {
      if (!state.table[key]) {
        state.table[key] = 0;
      }
      state.table[key]++;
    },
    [MUTATIONS.DECREASE_FROM_TABLE](state, key) {
      if (!state.table[key]) {
        return;
      }
      state.table[key]--;
      if (state.table[key] <= 0) {
        delete state.table[key];
      }
    },
    [MUTATIONS.REMOVE_FROM_TABLE](state, key) {
      delete state.table[key];
    },
    [MUTATIONS.CLEAR_TABLE](state) {
      state.table = {};
    },
    [MUTATIONS.OPEN_ELEMENT](state, key) {
      if (!state.opened.includes(key)) {
        state.opened.push(key);
      }
    },
    [MUTATIONS.SET_NOTICE](state, text) {
      state.notice = text;
    },
    [MUTATIONS.SET_SELECTED](state, key) {
      state.selected = key;
    },
    [MUTATIONS.SET_SLOT](state, payload) {
      state.slots[payload.index] = payload.key;
    },
    [MUTATIONS.CLEAR_SLOTS](state) {
      state.slots = Array(9).fill(null);
    },
  },
  actions: {
    addToTable(store, key) {
      store.commit(MUTATIONS.ADD_TO_TABLE, key);
    },
    decreaseFromTable(store, key) {
      store.commit(MUTATIONS.DECREASE_FROM_TABLE, key);
    },
    removeFromTable(store, key) {
      store.commit(MUTATIONS.REMOVE_FROM_TABLE, key);
    },
    clearTable(store) {
      store.commit(MUTATIONS.CLEAR_TABLE);
    },
    clearNotice(store) {
      store.commit(MUTATIONS.SET_NOTICE, null);
    },
    selectElement(store, key) {
      store.commit(MUTATIONS.SET_SELECTED, key);
    },
    placeInSlot(store, index) {
      if (store.state.slots[index]) {
        store.commit(MUTATIONS.SET_SLOT, { index, key: null });
        return;
      }
      if (!store.state.selected) {
        store.commit(MUTATIONS.SET_NOTICE, "Сначала выберите материал на столе");
        return;
      }
      store.commit(MUTATIONS.SET_SLOT, { index, key: store.state.selected });
    },
    clearSlots(store) {
      store.commit(MUTATIONS.CLEAR_SLOTS);
    },
    craft(store) {
      const slots = store.state.slots;
      if (slots.every((key) => key === null)) {
        store.commit(MUTATIONS.SET_NOTICE, "Расставьте материалы в сетке");
        return;
      }

      const recipe = recipeBook.findCraft(slots);
      if (!recipe) {
        store.commit(MUTATIONS.SET_NOTICE, "Такой рецепт крафта не найден 🤔");
        return;
      }

      const result = recipeBook.getElement(recipe.result);
      const isNew = !store.state.opened.includes(recipe.result);

      store.commit(MUTATIONS.OPEN_ELEMENT, recipe.result);
      store.commit(MUTATIONS.CLEAR_SLOTS);

      if (isNew) {
        store.commit(MUTATIONS.SET_NOTICE, `Скрафчено: ${result.name} ${result.icon}`);
      } else {
        store.commit(MUTATIONS.SET_NOTICE, `Уже было: ${result.name} ${result.icon}`);
      }
    },
    mix(store) {
      const table = store.state.table;
      if (Object.keys(table).length === 0) {
        store.commit(MUTATIONS.SET_NOTICE, "Стол пуст — добавьте стихии");
        return;
      }

      const recipe = recipeBook.findRecipe(table);
      if (!recipe) {
        store.commit(MUTATIONS.SET_NOTICE, "Из этих стихий ничего не выходит 🤔");
        return;
      }

      const result = recipeBook.getElement(recipe.result);
      const isNew = !store.state.opened.includes(recipe.result);

      store.commit(MUTATIONS.OPEN_ELEMENT, recipe.result);
      store.commit(MUTATIONS.CLEAR_TABLE);
      store.commit(MUTATIONS.ADD_TO_TABLE, recipe.result);

      if (isNew) {
        store.commit(MUTATIONS.SET_NOTICE, `Новая стихия: ${result.name} ${result.icon}`);
      } else {
        store.commit(MUTATIONS.SET_NOTICE, `Получилось: ${result.name} ${result.icon}`);
      }
    },
  },
});
