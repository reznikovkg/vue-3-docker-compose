import { createStore } from 'vuex'
import { recipes } from './recipes' 
import { craftRecipes } from './craftRecipes'

const MUTATIONS = {
  ADD_TO_TABLE: 'ADD_TO_TABLE',
  DECREASE_FROM_TABLE: 'DECREASE_FROM_TABLE',
  CLEAR_TABLE: 'CLEAR_TABLE',
  OPEN_ELEMENT: 'OPEN_ELEMENT',
  PLACE_IN_SLOT: 'PLACE_IN_SLOT',
  CLEAR_CRAFT: 'CLEAR_CRAFT',
  ADD_TO_INVENTORY: 'ADD_TO_INVENTORY',
  REMOVE_FROM_INVENTORY: 'REMOVE_FROM_INVENTORY',
  ASSIGN_WORKER: 'ASSIGN_WORKER',
  UPDATE_WORKER_PROGRESS: 'UPDATE_WORKER_PROGRESS',
  CLEAR_WORKER_JOB: 'CLEAR_WORKER_JOB',
  RETURN_TO_INVENTORY: 'RETURN_TO_INVENTORY'
}

export default createStore({
  state() {
    return {
      elements: [
        { id: 1, name: 'Огонь', picture: '/src/assets/elements/fire.png', opened: true, level: 1 },
        { id: 2, name: 'Вода', picture: '/src/assets/elements/water.png', opened: true, level: 1 },
        { id: 3, name: 'Земля', picture: '/src/assets/elements/earth.png', opened: true, level: 1 },
        { id: 4, name: 'Воздух', picture: '/src/assets/elements/air.png', opened: true, level: 1 },
        { id: 5, name: 'Пар', picture: '/src/assets/elements/steam.png', opened: false, level: 1 },
        { id: 6, name: 'Лава', picture: '/src/assets/elements/lava.png', opened: false, level: 1 },
        { id: 7, name: 'Грязь', picture: '/src/assets/elements/mud.png', opened: false, level: 1 },
        { id: 8, name: 'Море', picture: '/src/assets/elements/sea.png', opened: false, level: 2 },
        { id: 9, name: 'Энергия', picture: '/src/assets/elements/energy.png', opened: false, level: 2 },
        { id: 10, name: 'Туман', picture: '/src/assets/elements/fog.png', opened: false, level: 2 },
        { id: 11, name: 'Пыль', picture: '/src/assets/elements/dust.png', opened: false, level: 2 },
        { id: 12, name: 'Камень', picture: '/src/assets/elements/stone.png', opened: false, level: 2 },
        { id: 13, name: 'Кирпич', picture: '/src/assets/elements/brick.png', opened: false, level: 3 },
        { id: 14, name: 'Облако', picture: '/src/assets/elements/cloud.png', opened: false, level: 3 },
        { id: 15, name: 'Металл', picture: '/src/assets/elements/metal.png', opened: false, level: 3 },
        { id: 16, name: 'Жизнь', picture: '/src/assets/elements/life.png', opened: false, level: 3 }
      ],
      table: [],
      craftGrid: [
        null,null,null,
        null,null,null,
        null,null,null
      ],
      inventory: {
        1: 1,
        2: 1,
        3: 1,
        4: 1 
      },
      workers: [
        { id: 1, job: null, progress: 0 },
        { id: 2, job: null, progress: 0 },
        { id: 3, job: null, progress: 0 },
        { id: 4, job: null, progress: 0 },
        { id: 5, job: null, progress: 0 }
      ]
    }
  },

  getters: {
    openedElements: state => state.elements.filter(e => e.opened),
    tableElements: state => state.table,
    getElementById: state => id => state.elements.find(e => e.id === id),
    craftSlots: state => state.craftGrid,
    freeWorkers: state => state.workers.filter(w => !w.job),
    allWorkers: state => state.workers,
    busyWorkers: state => state.workers.filter(w => w.job),
    workersCount: state => state.workers.length,
    resources: state => state.elements.filter(e => e.resource),
    inventoryItems: state =>
      Object.entries(state.inventory)
        .map(([id, count]) => ({
          id: Number(id),
          count
        })),
    getInventoryCount: state => id => {
      return state.inventory[id] || 0
    }
  },

  mutations: {
    [MUTATIONS.ADD_TO_TABLE](state, id) {
      const item = state.table.find(i => i.id === id)
      if (item) {
        item.count++
      } else {
        state.table.push({ id, count: 1 })
      }
    },

    [MUTATIONS.DECREASE_FROM_TABLE](state, id) {
      const item = state.table.find(i => i.id === id)
      if (!item) return
      if (item.count > 1) {
        item.count--
      } else {
        state.table = state.table.filter(i => i.id !== id)
      }
    },

    [MUTATIONS.CLEAR_TABLE](state) {
      state.table.forEach(item => {
        state.inventory[item.id] =
          (state.inventory[item.id] || 0) + item.count
      })
      state.table = []
    },

    [MUTATIONS.OPEN_ELEMENT](state, id) {
      const element = state.elements.find(e => e.id === id)
      if (element) element.opened = true
    },

    [MUTATIONS.PLACE_IN_SLOT](state,{slot,id}){
      state.craftGrid[slot] = id
    },

    [MUTATIONS.CLEAR_CRAFT](state){
      state.craftGrid = Array(9).fill(null)
    },

    [MUTATIONS.ADD_TO_INVENTORY](state, id) {
      state.inventory[id] = (state.inventory[id] || 0) + 1
    },

    [MUTATIONS.REMOVE_FROM_INVENTORY](state, id) {
      if (!state.inventory[id]) return
      state.inventory[id]--
      if (state.inventory[id] <= 0) {
        state.inventory[id] = 0
      }
    },

    [MUTATIONS.ASSIGN_WORKER](state, { workerId, job }) {
      const worker = state.workers.find(w => w.id === workerId)
      if (worker) {
        worker.job = job
        worker.progress = 0
      }
    },

    [MUTATIONS.UPDATE_WORKER_PROGRESS](state, { workerId, progress }) {
      const worker = state.workers.find(w => w.id === workerId)
      if (worker) {
        worker.progress = progress
      }
    },

    [MUTATIONS.CLEAR_WORKER_JOB](state, workerId) {
      const worker = state.workers.find(w => w.id === workerId)
      if (worker) {
        worker.job = null
        worker.progress = 0
      }
    },

    [MUTATIONS.RETURN_TO_INVENTORY](state, id) {
      state.inventory[id] = (state.inventory[id] || 0) + 1
    }
  },

  actions: {
    addToTable({ commit, state }, id) {
      const currentCount = state.inventory[id] || 0
      if (currentCount <= 0) {
        alert('У вас нет этого ресурса!')
        return
      }
      commit(MUTATIONS.ADD_TO_TABLE, id)
      commit(MUTATIONS.REMOVE_FROM_INVENTORY, id)
    },

    decreaseFromTable({ commit, state }, id) {
      const tableItem = state.table.find(i => i.id === id)
      if (!tableItem) return
      commit(MUTATIONS.ADD_TO_INVENTORY, id)
      commit(MUTATIONS.DECREASE_FROM_TABLE, id)
    },

    clearTable({ commit }) {
      commit(MUTATIONS.CLEAR_TABLE)
    },

    placeInSlot({commit, state},payload){
      const { slot, id } = payload
      const currentCount = state.inventory[id] || 0
      if (currentCount <= 0) {
        alert('У вас нет этого ресурса!')
        return
      }
      const currentSlotItem = state.craftGrid[slot]
      if (currentSlotItem) {
        commit(MUTATIONS.ADD_TO_INVENTORY, currentSlotItem)
      }
      commit(MUTATIONS.PLACE_IN_SLOT, payload)
      commit(MUTATIONS.REMOVE_FROM_INVENTORY, id)
    },

    clearCraft({commit, state}){
      state.craftGrid.forEach(slot => {
      if (slot !== null) {
        commit(MUTATIONS.ADD_TO_INVENTORY, slot)
      }
      })
      commit(MUTATIONS.CLEAR_CRAFT)
    },

    mix({ state, commit, getters }) {
      if (state.table.length === 0) return

      const key = state.table
        .map(item => Array(item.count).fill(item.id)) 
        .flat()
        .sort((a, b) => a - b)
        .join('+')

      const resultId = recipes[key]

      if (resultId) {
        const worker = state.workers.find(w => !w.job)

        if (!worker) {
          alert('Нет свободных рабочих')
          return
        }

        const element = getters.getElementById(resultId)

        commit(MUTATIONS.ASSIGN_WORKER, {
          workerId: worker.id,
          job: { type: 'mix', elementId: resultId }
        })

        const time = 5 * Math.pow(3, element.level - 1) * 1000
        let progress = 0
        const step = 100 / (time / 100)
        const interval = setInterval(() => {
          progress += step
          commit(MUTATIONS.UPDATE_WORKER_PROGRESS, {
            workerId: worker.id,
            progress
          })
        }, 100)

        setTimeout(() => {
          clearInterval(interval)
          if (!element.opened) {
            commit(MUTATIONS.OPEN_ELEMENT, resultId)
            alert(`Вы открыли новый элемент: ${element.name}`)
          }
          commit(MUTATIONS.CLEAR_TABLE)
          commit(MUTATIONS.ADD_TO_TABLE, resultId)
          commit(MUTATIONS.CLEAR_WORKER_JOB, worker.id)
        }, time)
      } else {
        alert('Ничего не получилось')
      }
    },

    craftMix({state,commit,getters}){
      const key = state.craftGrid
        .map(i => i ?? 0)
        .join(',')

      const resultId = craftRecipes[key]

      if (resultId) {
        const worker = state.workers.find(w => !w.job)

        if (!worker) {
          alert('Нет свободных рабочих')
          return
        }

        const element = getters.getElementById(resultId)

        commit(MUTATIONS.ASSIGN_WORKER, {
          workerId: worker.id,
          job: { type: 'craft', elementId: resultId }
        })

        const time = 5 * Math.pow(3, element.level - 1) * 1000
        let progress = 0
        const step = 100 / (time / 100)
        const interval = setInterval(() => {
          progress += step
          commit(MUTATIONS.UPDATE_WORKER_PROGRESS, {
            workerId: worker.id,
            progress
          })
        }, 100)

        setTimeout(() => {
          clearInterval(interval)
          if (!element.opened) {
            commit(MUTATIONS.OPEN_ELEMENT, resultId)
            alert(`Вы открыли новый элемент: ${element.name}`)
          }
          commit(MUTATIONS.ADD_TO_INVENTORY, resultId)
          commit(MUTATIONS.CLEAR_CRAFT)
          commit(MUTATIONS.CLEAR_WORKER_JOB, worker.id)
        }, time)
      } else {
        alert('Ничего не получилось')
      }
    },

    startMining({ state, commit }, id) {

      const element = state.elements.find(e => e.id === id)
      if (!element) return

      const worker = state.workers.find(w => !w.job)

      if (!worker) {
        alert('Нет рабочих')
        return
      }

      const time = 5 * Math.pow(3, element.level - 1) * 1000

      commit(MUTATIONS.ASSIGN_WORKER, {
        workerId: worker.id,
        job: { type: 'mining', elementId: id }
      })

      let progress = 0
      const step = 100 / (time / 100)
      const interval = setInterval(() => {
        progress += step
        commit(MUTATIONS.UPDATE_WORKER_PROGRESS, {
          workerId: worker.id,
          progress
        })
      }, 100)

      setTimeout(() => {
        clearInterval(interval)
        commit(MUTATIONS.ADD_TO_INVENTORY, id)
        commit(MUTATIONS.CLEAR_WORKER_JOB, worker.id)
      }, time)
    }
  }
})