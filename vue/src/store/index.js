import { createStore } from 'vuex'

const MUTATIONS = {
  SET_GRID: 'SET_GRID',
  SET_SELECTED_SHAPE: 'SET_SELECTED_SHAPE', 
  SET_GAME_MODE: 'SET_GAME_MODE',
  ADD_SHAPE: 'ADD_SHAPE',
  REMOVE_SHAPE: 'REMOVE_SHAPE',
  SET_PREVIEW_CELLS: 'SET_PREVIEW_CELLS',
  SET_GRID_SIZE: 'SET_GRID_SIZE',
  SET_PARK_BALANCE: 'SET_PARK_BALANCE',
  ADD_PERSON: 'ADD_PERSON',
  REMOVE_PERSON: 'REMOVE_PERSON',
  UPDATE_PERSON: 'UPDATE_PERSON',
  SET_MAX_VISITORS: 'SET_MAX_VISITORS',
  ADD_ROAD: 'ADD_ROAD',
  REMOVE_ROAD: 'REMOVE_ROAD',
  SET_ROAD_MODE: 'SET_ROAD_MODE',
  ADD_BUILDING_ENTRY: 'ADD_BUILDING_ENTRY',
  REMOVE_BUILDING_ENTRY: 'REMOVE_BUILDING_ENTRY'
}

export default createStore({
  state () {
    return {
      grid: [],
      gridSizeX: 8,
      gridSizeY: 8,
      selectedShape: null,
      gameMode: 'add',
      previewCells: [],
      nextShapeId: 1,
      parkBalance: 1000,
      people: [],
      maxVisitors: 0,
      nextPersonId: 1,
      roads: [],
      isRoadMode: false,
      buildingEntries: [], 
      availableShapes: [
        {
          id: 1,
          name: 'Дом',
          type: 'square',
          color: '#3d171cff',
          layout: [
            { x: 0, y: 0 }, { x: 1, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }
          ],
          cost: 200,
          capacity: 5,
          visitTime: 10,
          entry: { x: 1, y: 1 } 
        },
        {
          id: 2,
          name: 'Теплица',
          type: 'line',
          color: '#72abe1ff',
          layout: [
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }
          ],
          cost: 100,
          capacity: 2,
          visitTime: 5,
          entry: { x: 2, y: 0 } 
        },
        {
          id: 3,
          name: 'Магазин',
          type: 'lshape',
          color: '#fc7a10ff',
          layout: [
            { x: 0, y: 0 }, { x: 1, y: 0 }
          ],
          cost: 100,
          capacity: 3,
          visitTime: 18,
          entry: { x: 1, y: 0 } 
        },
        {
          id: 4,
          name: 'Куст',
          type: 'single',
          color: '#92eb3eff',
          layout: [{ x: 0, y: 0 }],
          cost: 50,
          capacity: 0,
          visitTime: 0,
          entry: { x: 0, y: 0 }
        }
      ]
    }
  },
  getters: {
    getGrid: (state) => state.grid,
    getGridSizeX: (state) => state.gridSizeX,
    getGridSizeY: (state) => state.gridSizeY,
    getSelectedShape: (state) => state.selectedShape,
    getGameMode: (state) => state.gameMode,
    getPreviewCells: (state) => state.previewCells,
    getAvailableShapes: (state) => state.availableShapes,
    getParkBalance: (state) => state.parkBalance,
    getPeople: (state) => state.people,
    getMaxVisitors: (state) => state.maxVisitors,
    getRoads: (state) => state.roads,
    getIsRoadMode: (state) => state.isRoadMode,
    getVisitorsCount: (state) => state.people.length,
    getBuildingEntries: (state) => state.buildingEntries
  },
  mutations: {
    [MUTATIONS.SET_GRID]: (state, grid) => {
      state.grid = grid
    },
    [MUTATIONS.SET_GRID_SIZE]: (state, payload) => {
      state.gridSizeX = payload.gridSizeX
      state.gridSizeY = payload.gridSizeY
    },
    [MUTATIONS.SET_SELECTED_SHAPE]: (state, shape) => {
      state.selectedShape = shape
    },
    [MUTATIONS.SET_GAME_MODE]: (state, mode) => {
      state.gameMode = mode
    },
    [MUTATIONS.ADD_SHAPE]: (state, payload) => {
      payload.cells.forEach(({ row, col }) => {
        if (!state.grid[row]) state.grid[row] = []
        state.grid[row][col] = {
          id: payload.shapeId,
          type: payload.shapeType,
          color: payload.color,
          capacity: payload.capacity,
          visitTime: payload.visitTime,
          entry: payload.entry
        }
      })
      state.nextShapeId++
    },
    [MUTATIONS.REMOVE_SHAPE]: (state, payload) => {
      for (let row = 0; row < payload.gridSizeY; row++) {
        for (let col = 0; col < payload.gridSizeX; col++) {
          if (state.grid[row]?.[col]?.id === payload.shapeId) {
            state.grid[row][col] = null
          }
        }
      }
    },
    [MUTATIONS.SET_PREVIEW_CELLS]: (state, previewCells) => {
      state.previewCells = previewCells
    },
    [MUTATIONS.SET_PARK_BALANCE]: (state, balance) => {
      state.parkBalance = balance
    },
    [MUTATIONS.ADD_PERSON]: (state, person) => {
      state.people.push(person)
    },
    [MUTATIONS.REMOVE_PERSON]: (state, personId) => {
      state.people = state.people.filter(p => p.id !== personId)
    },
    [MUTATIONS.UPDATE_PERSON]: (state, { personId, updates }) => {
      const person = state.people.find(p => p.id === personId)
      if (person) {
        Object.assign(person, updates)
      }
    },
    [MUTATIONS.SET_MAX_VISITORS]: (state, count) => {
      state.maxVisitors = count
    },
    [MUTATIONS.ADD_ROAD]: (state, road) => {
      state.roads.push(road)
    },
    [MUTATIONS.REMOVE_ROAD]: (state, { row, col }) => {
      state.roads = state.roads.filter(road => !(road.row === row && road.col === col))
    },
    [MUTATIONS.SET_ROAD_MODE]: (state, isRoadMode) => {
      state.isRoadMode = isRoadMode
    },
    [MUTATIONS.ADD_BUILDING_ENTRY]: (state, entry) => {
      state.buildingEntries.push(entry)
    },
    [MUTATIONS.REMOVE_BUILDING_ENTRY]: (state, shapeId) => {
      state.buildingEntries = state.buildingEntries.filter(entry => entry.shapeId !== shapeId)
    }
  },
  actions: {
    initializeGrid: (store, payload = {}) => {
      const gridSizeX = payload.gridSizeX || store.state.gridSizeX
      const gridSizeY = payload.gridSizeY || store.state.gridSizeY
      
      store.commit(MUTATIONS.SET_GRID_SIZE, { gridSizeX, gridSizeY })
      
      const grid = Array(gridSizeY)
        .fill(null)
        .map(() => Array(gridSizeX).fill(null))
      store.commit(MUTATIONS.SET_GRID, grid)
     
      const entranceRow = Math.floor(gridSizeY / 2)
      store.commit(MUTATIONS.ADD_ROAD, { row: entranceRow, col: -1 })
      
      for (let i = 0; i < 3; i++) {
        setTimeout(() => store.dispatch('addVisitor'), i * 1000)
      }
    },
    
    setSelectedShape: (store, shape) => {
      store.commit(MUTATIONS.SET_SELECTED_SHAPE, shape)
    },
    
    setGameMode: (store, mode) => {
      store.commit(MUTATIONS.SET_GAME_MODE, mode)
    },
    
    addShape: (store, payload) => {
      const gridSizeX = payload.gridSizeX || store.state.gridSizeX
      const gridSizeY = payload.gridSizeY || store.state.gridSizeY
 
      if (store.state.parkBalance < payload.shape.cost) {
        alert('Недостаточно средств')
        return
      }
      
      const cellsToFill = []
      for (const part of payload.shape.layout) {
        const targetRow = payload.startRow + part.y
        const targetCol = payload.startCol + part.x
        cellsToFill.push({ row: targetRow, col: targetCol })
      }

      const entryRow = payload.startRow + payload.shape.entry.y
      const entryCol = payload.startCol + payload.shape.entry.x
      
      store.commit(MUTATIONS.ADD_SHAPE, {
        cells: cellsToFill,
        shapeId: store.state.nextShapeId,
        shapeType: payload.shape.type,
        color: payload.shape.color,
        capacity: payload.shape.capacity,
        visitTime: payload.shape.visitTime,
        entry: payload.shape.entry
      })

      store.commit(MUTATIONS.ADD_BUILDING_ENTRY, {
        shapeId: store.state.nextShapeId,
        row: entryRow,
        col: entryCol,
        building: payload.shape
      })
    
      store.commit(MUTATIONS.SET_PARK_BALANCE, store.state.parkBalance - payload.shape.cost)
   
      store.dispatch('updateMaxVisitors')
    },
    
    removeShape: (store, payload) => {
      const gridSizeX = payload.gridSizeX || store.state.gridSizeX
      const gridSizeY = payload.gridSizeY || store.state.gridSizeY

      const building = store.state.availableShapes.find(s => 
        store.state.grid.some(row => row.some(cell => cell?.id === payload.shapeId))
      )
      if (building) {
        store.commit(MUTATIONS.SET_PARK_BALANCE, store.state.parkBalance + Math.floor(building.cost * 0.5))
      }

      store.commit(MUTATIONS.REMOVE_BUILDING_ENTRY, payload.shapeId)
      
      store.commit(MUTATIONS.REMOVE_SHAPE, {
        shapeId: payload.shapeId,
        gridSizeX,
        gridSizeY
      })
      
      store.dispatch('updateMaxVisitors')
    },
    
    updatePreview: (store, payload) => {
      if (!store.state.selectedShape) {
        store.commit(MUTATIONS.SET_PREVIEW_CELLS, [])
        return
      }
            
      const shapeLayout = store.state.selectedShape.layout
      const preview = []
      
      for (const part of shapeLayout) {
        const targetRow = payload.row + part.y
        const targetCol = payload.col + part.x

        preview.push({ row: targetRow, col: targetCol})
      }
      
      store.commit(MUTATIONS.SET_PREVIEW_CELLS, preview)
    },
    
    clearPreview: (store) => {
      store.commit(MUTATIONS.SET_PREVIEW_CELLS, [])
    },
    
    addRoad: (store, { row, col }) => {
      if (store.state.parkBalance >= 10) {
        store.commit(MUTATIONS.ADD_ROAD, { row, col })
        store.commit(MUTATIONS.SET_PARK_BALANCE, store.state.parkBalance - 10)
      } else {
        alert('Недостаточно средств для постройки дороги')
      }
    },
    
    removeRoad: (store, { row, col }) => {
      store.commit(MUTATIONS.REMOVE_ROAD, { row, col })
      store.commit(MUTATIONS.SET_PARK_BALANCE, store.state.parkBalance + 5)
    },
    
    setRoadMode: (store, isRoadMode) => {
      store.commit(MUTATIONS.SET_ROAD_MODE, isRoadMode)
    },
    
    addVisitor: (store) => {
      if (store.state.people.length < store.state.maxVisitors) {
        const entranceRow = Math.floor(store.state.gridSizeY / 2)
        const person = {
          id: store.state.nextPersonId,
          x: -1,
          y: entranceRow,
          state: 'waiting',
          balance: Math.floor(Math.random() * 91) + 10,
          targetBuilding: null,
          buildingTimer: 0,
          spawnTimer: 2,
          path: [],
          lastPosition: null,
          direction: 'right'
        }
        store.commit(MUTATIONS.ADD_PERSON, person)
        store.state.nextPersonId++
      }
    },
    
    updateMaxVisitors: (store) => {
      const buildingIds = new Set()
      for (let row = 0; row < store.state.gridSizeY; row++) {
        for (let col = 0; col < store.state.gridSizeX; col++) {
          const cell = store.state.grid[row]?.[col]
          if (cell && cell.type && cell.type !== 'single' && cell.id) {
            buildingIds.add(cell.id)
          }
        }
      }
      const buildingCount = buildingIds.size
      const maxVisitors = 5 * buildingCount
      store.commit(MUTATIONS.SET_MAX_VISITORS, maxVisitors)
    },
    
    updatePeople: (store) => {
      store.state.people.forEach(person => {
        if (person.state === 'waiting') {
          person.spawnTimer--
          if (person.spawnTimer <= 0) {
            store.dispatch('movePersonFromEntrance', person.id)
          }
        } else if (person.state === 'walking') {
          store.dispatch('movePersonRandomly', person.id)
        } else if (person.state === 'inBuilding') {
          person.buildingTimer--
          if (person.buildingTimer <= 0) {
            store.dispatch('leaveBuilding', person.id)
          }
        }
      })
      
      if (store.state.people.length < store.state.maxVisitors && Math.random() < 0.1) {
        store.dispatch('addVisitor')
      }
    },
    
    movePersonFromEntrance: (store, personId) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person) return
      
      const entranceRow = Math.floor(store.state.gridSizeY / 2)
      
      const firstStepX = 0
      const firstStepY = entranceRow
      
      store.commit(MUTATIONS.UPDATE_PERSON, {
        personId,
        updates: {
          x: firstStepX,
          y: firstStepY,
          state: 'walking',
          path: [{x: firstStepX, y: firstStepY}],
          lastPosition: {x: -1, y: entranceRow},
          direction: 'right'
        }
      })
    },
    
    movePersonRandomly: (store, personId) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person || person.state !== 'walking') return
      
      const directions = [
        { dx: 1, dy: 0, dir: 'right', weight: 40 },   
        { dx: 0, dy: -1, dir: 'up', weight: 25 },     
        { dx: 0, dy: 1, dir: 'down', weight: 25 },    
        { dx: -1, dy: 0, dir: 'left', weight: 10 }   
      ]
      
      const validDirections = directions.filter(({ dx, dy }) => {
        const newX = person.x + dx
        const newY = person.y + dy
        
        const isRoad = store.state.roads.some(road => road.row === newY && road.col === newX)
        
        return isRoad
      })
      
      if (validDirections.length > 0) {
        const forwardDirections = validDirections.filter(({ dx, dy }) => {
          const newX = person.x + dx
          const newY = person.y + dy
          
          if (person.lastPosition && 
              newX === person.lastPosition.x && 
              newY === person.lastPosition.y) {
            return false
          }
          
          return true
        })
       
        const availableDirections = forwardDirections.length > 0 ? forwardDirections : validDirections
       
        const totalWeight = availableDirections.reduce((sum, dir) => sum + dir.weight, 0)
        let randomValue = Math.random() * totalWeight
        
        let selectedDir = availableDirections[0]
        for (const dir of availableDirections) {
          randomValue -= dir.weight
          if (randomValue <= 0) {
            selectedDir = dir
            break
          }
        }
        
        const newX = person.x + selectedDir.dx
        const newY = person.y + selectedDir.dy
        
        store.commit(MUTATIONS.UPDATE_PERSON, {
          personId,
          updates: {
            lastPosition: { x: person.x, y: person.y },
            x: newX,
            y: newY,
            direction: selectedDir.dir,
            path: [...person.path, {x: newX, y: newY}]
          }
        })

        if (Math.random() < 0.2) {
          store.dispatch('checkBuildingEntry', personId)
        }
      
        const entranceRow = Math.floor(store.state.gridSizeY / 2)
        if (newX === -1 && newY === entranceRow) {
          store.dispatch('removePersonFromEntrance', personId)
          return
        }
      }
    },

    removePersonFromEntrance: (store, personId) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person) return
      
      store.commit(MUTATIONS.UPDATE_PERSON, {
        personId,
        updates: { state: 'leaving' }
      })
      
      setTimeout(() => {
        store.commit(MUTATIONS.REMOVE_PERSON, personId)
      }, 2000)
    },
    
    checkBuildingEntry: (store, personId) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person || person.state !== 'walking') return

      for (const entry of store.state.buildingEntries) {

        const isAdjacentToEntry = 
          (Math.abs(person.y - entry.row) === 1 && person.x === entry.col) || 
          (Math.abs(person.x - entry.col) === 1 && person.y === entry.row)    
        
        if (isAdjacentToEntry) {
          const visitorsInBuilding = store.state.people.filter(p => 
            p.targetBuilding?.id === entry.shapeId && p.state === 'inBuilding'
          ).length
          
          if (visitorsInBuilding < entry.building.capacity) {
            const spendAmount = Math.min(person.balance, Math.floor(Math.random() * 20) + 5)

            store.commit(MUTATIONS.UPDATE_PERSON, {
              personId,
              updates: {
                x: entry.col, 
                y: entry.row, 
                state: 'inBuilding',
                targetBuilding: { ...entry.building, id: entry.shapeId },
                buildingTimer: entry.building.visitTime,
                balance: person.balance - spendAmount,
                lastPosition: { x: person.x, y: person.y } 
              }
            })
            
            store.commit(MUTATIONS.SET_PARK_BALANCE, store.state.parkBalance + spendAmount)
            return
          }
        }
      }
    },

    leaveBuilding: (store, personId) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person || !person.targetBuilding) return

      const entry = store.state.buildingEntries.find(e => e.shapeId === person.targetBuilding.id)
      
      if (entry) {
        store.commit(MUTATIONS.UPDATE_PERSON, {
          personId,
          updates: {
            x: entry.col,
            y: entry.row,
            state: 'walking',
            targetBuilding: null,
            path: [{x: entry.col, y: entry.row}],
            lastPosition: {x: person.x, y: person.y}
          }
        })
        
        if (person.balance <= 5) {
          store.dispatch('moveToExit', personId)
        }
      }
    },
    
    moveToExit: (store, personId) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person) return
      
      const entranceRow = Math.floor(store.state.gridSizeY / 2)
      
      store.commit(MUTATIONS.UPDATE_PERSON, {
        personId,
        updates: {
          x: -1,
          y: entranceRow,
          state: 'leaving'
        }
      })
      
      setTimeout(() => {
        store.commit(MUTATIONS.REMOVE_PERSON, personId)
      }, 2000)
    }
  }
})