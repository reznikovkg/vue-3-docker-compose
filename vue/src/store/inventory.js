import store from "@/store/index.js";

const MUTATIONS = {
    ADD_TO_INVENTORY: 'ADD_TO_INVENTORY',
    SELECT_INVENTORY_ITEM: 'SELECT_INVENTORY_ITEM',
    USE_ITEM: 'USE_ITEM',
    RESET: 'RESET',
}

export default {
    namespaced: true,
    state () {
        return {
            inventoryItems: [],
            inventorySelectedIndex: -1,
        }
    },
    getters: {
        getInventory: (state) => state.inventoryItems,
        getInventorySelectedIndex: (state) => state.inventorySelectedIndex,
        getEmptySlotsCount: (state) => state.inventoryItems.filter(slot => slot.id.length === 0).length,
        getSelectedItem: (state) => state.inventorySelectedIndex < 0 ? "" : state.inventoryItems[state.inventorySelectedIndex]
    },
    mutations: {
        [MUTATIONS.ADD_TO_INVENTORY]: (state, item) => {
            let key = item.id
            let inventoryItem = state.inventoryItems.find(item => item.id === key);
            if(inventoryItem) {
                inventoryItem.count += item.count;
            } else {
                let empty = state.inventoryItems.find(item => item.id.length === 0);
                if (empty) {
                    empty.id = key;
                    empty.count = item.count;
                }
            }
        },
        [MUTATIONS.USE_ITEM]: (state) => {
            let item = state.inventoryItems[state.inventorySelectedIndex];
            if(item.count > 0 && item.id !== "") {
                item.count -= 1;
                if(item.count <= 0) {
                    item.id = "";
                }
            }
        },
        [MUTATIONS.SELECT_INVENTORY_ITEM]: (state, id) => {
            state.inventorySelectedIndex = id;
        },
        [MUTATIONS.RESET]: (state) => {
            state.inventorySelectedIndex = -1;
            state.inventoryItems = Array.from({ length: 7 }, () => ({ id: "", count: 0 }));
        }
    },
    actions: {
        addToInventory: (store, item) => {
            store.commit(MUTATIONS.ADD_TO_INVENTORY, item)
        },
        useSelectedItem: (store) => {
            store.commit(MUTATIONS.USE_ITEM)
        },
        selectInventoryItem: (store, id) => {
            store.commit(MUTATIONS.SELECT_INVENTORY_ITEM, id);
        },
        reset: (store) => {
            store.commit(MUTATIONS.RESET);
        }
    }
}