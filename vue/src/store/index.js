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
  REMOVE_BUILDING_ENTRY: 'REMOVE_BUILDING_ENTRY',
  INCREMENT_NEXT_SHAPE_ID: 'INCREMENT_NEXT_SHAPE_ID',
  INCREMENT_NEXT_PERSON_ID: 'INCREMENT_NEXT_PERSON_ID',
  UPGRADE_BUILDINGS: 'UPGRADE_BUILDINGS',
  UPGRADE_ROADS: 'UPGRADE_ROADS',
  UPGRADE_MAP: 'UPGRADE_MAP'
}

const INDICATOR_TYPES = {
  FATIGUE: 'fatigue',
  HUNGER: 'hunger',
  BOREDOM: 'boredom',
  NATURAL_NEED: 'naturalNeed'
} 

const MOOD_COLORS = {
  GOOD: '#4CAF50',    
  MEDIUM: '#FFC107',  
  BAD: '#F44336'     
} 

const MOOD_THRESHOLDS = {
  GOOD: 7,
  MEDIUM: 4
} 

const moodUtils = {

  getMoodColor(moodValue) {
    if (moodValue >= MOOD_THRESHOLDS.GOOD) {
      return MOOD_COLORS.GOOD
    } else if (moodValue >= MOOD_THRESHOLDS.MEDIUM) {
      return MOOD_COLORS.MEDIUM
    } else {
      return MOOD_COLORS.BAD
    }
  },
  
  calculateMoodValue(indicators) {
    const { FATIGUE, HUNGER, BOREDOM, NATURAL_NEED } = INDICATOR_TYPES
    
    const values = [
      indicators[FATIGUE] || 0,
      indicators[HUNGER] || 0,
      indicators[BOREDOM] || 0,
      indicators[NATURAL_NEED] || 0
    ]
    
    const average = values.reduce((sum, value) => sum + value, 0) / values.length
    return parseFloat(average.toFixed(1))
  },
  
  getCriticalIndicators(indicators, threshold = 3) {
    const criticalIndicators = []
    
    Object.values(INDICATOR_TYPES).forEach(indicatorType => {
      if (indicators[indicatorType] < threshold) {
        criticalIndicators.push(indicatorType)
      }
    })
    
    return criticalIndicators
  },
  
  generateInitialIndicators() {
    const getRandomValue = () => Math.floor(Math.random() * 4) + 5
    
    return {
      [INDICATOR_TYPES.FATIGUE]: getRandomValue(),
      [INDICATOR_TYPES.HUNGER]: getRandomValue(),
      [INDICATOR_TYPES.BOREDOM]: getRandomValue(),
      [INDICATOR_TYPES.NATURAL_NEED]: getRandomValue()
    }
  }
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
      upgrades: {
        buildings: 1,
        roads: 1,
        map: 1
      },
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
          entry: { x: 1, y: 1 },
          income: 30,
          level: 1
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
          entry: { x: 2, y: 0 },
          income: 20,
          level: 1
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
          visitTime: 8,
          entry: { x: 1, y: 0 },
          income: 5,
          level: 1
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
          entry: { x: 0, y: 0 },
          income: 0,
          level: 1
        },
        {
          id: 5,
          name: 'Туалет',
          type: 'toilet',
          color: '#907a5fff',
          layout: [{ x: 0, y: 0 }],
          cost: 80,
          capacity: 3,
          visitTime: 3,
          entry: { x: 0, y: 0 },
          income: 0,
          level: 1
        },
        {
          id: 6,
          name: 'Лавочка',
          type: 'bench',
          color: '#A0522D',
          layout: [{ x: 0, y: 0 }],
          cost: 60,
          capacity: 2,
          visitTime: 4,
          entry: { x: 0, y: 0 },
          income: 0,
          level: 1
        }
      ],
      buildingEffects: {
        square: { 
          [INDICATOR_TYPES.BOREDOM]: 6, 
          [INDICATOR_TYPES.FATIGUE]: 5, 
          [INDICATOR_TYPES.NATURAL_NEED]:3
        },        
        line: { 
          [INDICATOR_TYPES.HUNGER]: 5 
        },               
        lshape: { 
          [INDICATOR_TYPES.BOREDOM]: 4,
          [INDICATOR_TYPES.HUNGER]: 4 
        },                     
        toilet: { 
          [INDICATOR_TYPES.NATURAL_NEED]: 5 
        },             
        bench: { 
          [INDICATOR_TYPES.FATIGUE]: 3 
        }                    
      }
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
    getBuildingEntries: (state) => state.buildingEntries,
    getUpgrades: (state) => state.upgrades,
    getRoadCapacityBonus: (state) => {
      switch (state.upgrades.roads) {
        case 1: return 0;
        case 2: return state.roads.length;
        case 3: return state.roads.length * 2;
        default: return 0;
      }
    },
    getBuildingEffects: (state) => state.buildingEffects,
    getIndicatorDisplayNames: () => {
      return {
        [INDICATOR_TYPES.FATIGUE]: 'усталость',
        [INDICATOR_TYPES.HUNGER]: 'голод',
        [INDICATOR_TYPES.BOREDOM]: 'скука',
        [INDICATOR_TYPES.NATURAL_NEED]: 'нужда'
      }
    }
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
          entry: payload.entry,
          income: payload.income,
          level: payload.level || 1,
          effect: payload.effect
        }
      })
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
    },
    [MUTATIONS.INCREMENT_NEXT_SHAPE_ID]: (state) => {
      state.nextShapeId++
    },
    [MUTATIONS.INCREMENT_NEXT_PERSON_ID]: (state) => {
      state.nextPersonId++
    },
    [MUTATIONS.UPGRADE_BUILDINGS]: (state) => {
      state.upgrades.buildings += 1
      for (let row = 0; row < state.gridSizeY; row++) {
        for (let col = 0; col < state.gridSizeX; col++) {
          const cell = state.grid[row]?.[col]
          if (cell && cell.type && cell.type !== 'single' && cell.income > 0) {
            cell.level += 1
            cell.income = Math.floor(cell.income * 1.5)
            cell.capacity += 1
          }
        }
      }
    },
    [MUTATIONS.UPGRADE_ROADS]: (state) => {
      state.upgrades.roads += 1
    },
    [MUTATIONS.UPGRADE_MAP]: (state) => {
      state.upgrades.map += 1
      
      const oldGrid = [...state.grid]
      const oldSizeX = state.gridSizeX
      const oldSizeY = state.gridSizeY
      
      state.gridSizeX = oldSizeX + 2
      state.gridSizeY = oldSizeY + 2
      
      const newGrid = Array(state.gridSizeY)
        .fill(null)
        .map(() => Array(state.gridSizeX).fill(null))
    
      for (let row = 0; row < oldSizeY; row++) {
        for (let col = 0; col < oldSizeX; col++) {
          newGrid[row + 1][col + 1] = oldGrid[row]?.[col] || null
        }
      }
      
      state.grid = newGrid
     
      state.buildingEntries = state.buildingEntries.map(entry => ({
        ...entry,
        row: entry.row + 1,
        col: entry.col + 1
      }))
    
      state.roads = state.roads.map(road => ({
        ...road,
        row: road.row + 1,
        col: road.col + 1
      }))
     
      const entranceRow = Math.floor(state.gridSizeY / 2)
      const hasEntranceRoad = state.roads.some(road => road.row === entranceRow && road.col === -1)
      if (!hasEntranceRoad) {
      state.roads.push({ row: entranceRow, col: -1 })
      }
 
      state.people.forEach(person => {
        person.x += 1
        person.y += 1
        if (person.lastPosition) {
          person.lastPosition.x += 1
          person.lastPosition.y += 1
        }
        person.path = person.path.map(pos => ({
          x: pos.x + 1,
          y: pos.y + 1
        }))
      })
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
        entry: payload.shape.entry,
        income: payload.shape.income,
        effect: payload.shape.effect,
        level: 1
      })

      store.commit(MUTATIONS.ADD_BUILDING_ENTRY, {
        shapeId: store.state.nextShapeId,
        row: entryRow,
        col: entryCol,
        building: payload.shape
      })

      store.commit(MUTATIONS.INCREMENT_NEXT_SHAPE_ID)
    
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
      const maxWithBonus = store.state.maxVisitors + store.getters.getRoadCapacityBonus
      if (store.state.people.length < maxWithBonus) {
        const entranceRow = Math.floor(store.state.gridSizeY / 2)

        const initialIndicators = moodUtils.generateInitialIndicators()

        const initialMood = moodUtils.calculateMoodValue(initialIndicators)
        const initialMoodColor = moodUtils.getMoodColor(initialMood)
        const initialCriticalIndicators = moodUtils.getCriticalIndicators(initialIndicators)
        
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
          direction: 'right',
          indicators: initialIndicators,
          mood: initialMood,
          moodColor: initialMoodColor,
          criticalIndicators: initialCriticalIndicators
        }
        
        store.commit(MUTATIONS.ADD_PERSON, person)
        store.commit(MUTATIONS.INCREMENT_NEXT_PERSON_ID)

        store.dispatch('updatePersonTooltip', person.id)
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
          if (Math.random() < 0.3) {
            store.dispatch('decreaseRandomIndicator', person.id)
          }
          store.dispatch('movePersonRandomly', person.id)
        } else if (person.state === 'inBuilding') {
          person.buildingTimer--
          if (person.buildingTimer <= 0) {
            store.dispatch('leaveBuilding', person.id)
          }
        }
      })
      
      if (store.state.people.length < (store.state.maxVisitors + store.getters.getRoadCapacityBonus) && Math.random() < 0.1) {
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

        if (person.balance > 5 && Math.random() < 0.4) {
          store.dispatch('checkBuildingEntry', personId)
        }
      
        const entranceRow = Math.floor(store.state.gridSizeY / 2)
        if (newX === -1 && newY === entranceRow) {
          store.dispatch('removePersonFromEntrance', personId)
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
      
      if (!person || person.state !== 'walking' || person.balance <= 5) return

      const hasCritical = person.criticalIndicators && person.criticalIndicators.length > 0
      const baseChance = hasCritical ? 0.8 : 0.4
      
      if (Math.random() > baseChance) return

      const availableBuildings = []
      
      for (const entry of store.state.buildingEntries) {
        const isAdjacentToEntry = 
          (Math.abs(person.y - entry.row) === 1 && person.x === entry.col) || 
          (Math.abs(person.x - entry.col) === 1 && person.y === entry.row)
        
        if (!isAdjacentToEntry) continue
 
        const visitorsInBuilding = store.state.people.filter(p => 
          p.targetBuilding?.id === entry.shapeId && p.state === 'inBuilding'
        ).length
        
        if (visitorsInBuilding >= entry.building.capacity) continue
        
        const buildingEffects = store.state.buildingEffects
        const effect = buildingEffects[entry.building.type] || {}

        if (hasCritical) {
          const solvesCritical = person.criticalIndicators.some(indicator => 
            Object.keys(effect).includes(indicator)
          )

          if (!solvesCritical) {
            continue
          }
        }
        
        const desire = store.dispatch('calculateBuildingDesire', {
          personId,
          buildingType: entry.building.type
        })
        
        availableBuildings.push({
          entry,
          desire
        })
      }

      if (availableBuildings.length > 0) {
        availableBuildings.sort((a, b) => b.desire - a.desire)

        const selected = availableBuildings[0]
        
        const spendAmount = selected.entry.building.income > 0 ? 
          Math.min(person.balance, selected.entry.building.income) : 0

        store.commit(MUTATIONS.UPDATE_PERSON, {
          personId,
          updates: {
            x: selected.entry.col, 
            y: selected.entry.row, 
            state: 'inBuilding',
            targetBuilding: { ...selected.entry.building, id: selected.entry.shapeId },
            buildingTimer: selected.entry.building.visitTime,
            balance: person.balance - spendAmount,
            lastPosition: { x: person.x, y: person.y } 
          }
        })

        store.dispatch('applyBuildingEffect', {
          personId,
          buildingType: selected.entry.building.type
        })
        
        if (spendAmount > 0) {
          store.commit(MUTATIONS.SET_PARK_BALANCE, store.state.parkBalance + spendAmount)
        }
      }
    },

    updatePersonTooltip: (store, personId) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person) return
      
      const indicators = person.indicators || {}
      const critical = person.criticalIndicators || []
      
      let tooltip = `Настроение: ${person.mood?.toFixed(1) || '?'}/10\n`
      tooltip += `Усталость: ${indicators[INDICATOR_TYPES.FATIGUE] || 0}${critical.includes(INDICATOR_TYPES.FATIGUE) ? ' !' : ''}\n`
      tooltip += `Голод: ${indicators[INDICATOR_TYPES.HUNGER] || 0}${critical.includes(INDICATOR_TYPES.HUNGER) ? ' !' : ''}\n`
      tooltip += `Скука: ${indicators[INDICATOR_TYPES.BOREDOM] || 0}${critical.includes(INDICATOR_TYPES.BOREDOM) ? ' !' : ''}\n`
      tooltip += `Нужда: ${indicators[INDICATOR_TYPES.NATURAL_NEED] || 0}${critical.includes(INDICATOR_TYPES.NATURAL_NEED) ? ' !' : ''}\n`
      tooltip += `Баланс: ${person.balance}`
      
      if (critical.length > 0) {
        tooltip += `\n\n!Критические показатели!`
      }

      person.tooltipText = tooltip
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
      }
    },

    upgradeBuildings: (store, cost) => {
      if (store.state.parkBalance >= cost) {
        store.commit(MUTATIONS.UPGRADE_BUILDINGS)
        store.commit(MUTATIONS.SET_PARK_BALANCE, store.state.parkBalance - cost)
        alert('Все здания улучшены до уровня ' + store.state.upgrades.buildings)
      } else {
        alert('Недостаточно средств для улучшения зданий')
      }
    },

    upgradeRoads: (store, cost) => {
      if (store.state.parkBalance >= cost) {
        store.commit(MUTATIONS.UPGRADE_ROADS)
        store.commit(MUTATIONS.SET_PARK_BALANCE, store.state.parkBalance - cost)
        alert('Дороги улучшены до уровня ' + store.state.upgrades.roads)
      } else {
        alert('Недостаточно средств для улучшения дорог')
      }
    },

    upgradeMap: (store, cost) => {
      if (store.state.parkBalance >= cost) {
        store.commit(MUTATIONS.SET_PARK_BALANCE, store.state.parkBalance - cost)
        store.commit(MUTATIONS.UPGRADE_MAP)
        store.dispatch('updateMaxVisitors')
        alert('Карта улучшена до уровня ' + store.state.upgrades.map)
      } else {
        alert('Недостаточно средств для улучшения карты')
      }
    },
   
    updateMood: (store, personId) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person || !person.indicators) return

      const moodValue = moodUtils.calculateMoodValue(person.indicators)
      const moodColor = moodUtils.getMoodColor(moodValue)
      const criticalIndicators = moodUtils.getCriticalIndicators(person.indicators)
      
      store.commit(MUTATIONS.UPDATE_PERSON, {
        personId,
        updates: {
          mood: moodValue,
          moodColor,
          criticalIndicators
        }
      })
   
      store.dispatch('updatePersonTooltip', personId)
    },
 
    decreaseRandomIndicator: (store, personId) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person || !person.indicators) return
      
      const indicators = person.indicators

      const weights = {}
      Object.values(INDICATOR_TYPES).forEach(indicatorType => {
        weights[indicatorType] = Math.max(1, 10 - (indicators[indicatorType] || 0))
      })
      
      const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
      let random = Math.random() * totalWeight
      
      let selectedIndicator = null
      for (const [indicator, weight] of Object.entries(weights)) {
        random -= weight
        if (random <= 0) {
          selectedIndicator = indicator
          break
        }
      }
      
      if (selectedIndicator && person.indicators[selectedIndicator] > 0) {
        const updatedIndicators = { ...person.indicators }
        updatedIndicators[selectedIndicator] = Math.max(0, updatedIndicators[selectedIndicator] - 1)
        
        store.commit(MUTATIONS.UPDATE_PERSON, {
          personId,
          updates: { indicators: updatedIndicators }
        })
  
        store.dispatch('updateMood', personId)
      }
    },
    
    applyBuildingEffect: (store, { personId, buildingType }) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person || !person.indicators) return
      
      const buildingEffects = store.state.buildingEffects
      const effect = buildingEffects[buildingType] || {}
      
      const updatedIndicators = { ...person.indicators }

      Object.entries(effect).forEach(([indicator, value]) => {
        if (updatedIndicators[indicator] !== undefined) {
          updatedIndicators[indicator] = Math.min(10, updatedIndicators[indicator] + value)
        }
      })
      
      store.commit(MUTATIONS.UPDATE_PERSON, {
        personId,
        updates: { indicators: updatedIndicators }
      })
 
      store.dispatch('updateMood', personId)
    },

    calculateBuildingDesire: (store, { personId, buildingType }) => {
      const person = store.state.people.find(p => p.id === personId)
      if (!person || !person.indicators) return 0
      
      const buildingEffects = store.state.buildingEffects
      const effect = buildingEffects[buildingType] || {}
      
      let desire = 0
      Object.entries(effect).forEach(([indicator, value]) => {
        if (person.indicators[indicator] !== undefined) {
          const needLevel = 10 - person.indicators[indicator] 
          desire += needLevel * (value / 10) * 2
        }
      })
      
      return Math.min(10, Math.max(0, desire))
    }
  }
})