import { createStore } from 'vuex';

const MUTATIONS = {
  SET_GRID_WIDTH: 'SET_GRID_WIDTH',
  SET_GRID_HEIGHT: 'SET_GRID_HEIGHT',
  SET_SELECTED_OBJECT: 'SET_SELECTED_OBJECT',
  SET_GAME_MODE: 'SET_GAME_MODE',
  SET_GRID: 'SET_GRID',
  SET_ALL_PLACED_OBJECTS: 'SET_ALL_PLACED_OBJECTS',
  SET_NEXT_OBJECT_ID: 'SET_NEXT_OBJECT_ID',
  ADD_PLACED_OBJECT: 'ADD_PLACED_OBJECT',
  REMOVE_PLACED_OBJECT: 'REMOVE_PLACED_OBJECT',
  OCCUPY_CELLS: 'OCCUPY_CELLS',
  REMOVE_OBJECT_FROM_GRID: 'REMOVE_OBJECT_FROM_GRID',
  SET_ENTRANCE: 'SET_ENTRANCE',
  ADD_VISITORS: 'ADD_VISITORS',
  REMOVE_VISITOR: 'REMOVE_VISITOR',
  UPDATE_VISITOR: 'UPDATE_VISITOR',
  SET_VISITOR_PATH: 'SET_VISITOR_PATH',           
  SET_VISITOR_STATUS: 'SET_VISITOR_STATUS',
  SET_OBJECT_TYPE: 'SET_OBJECT_TYPE', 
  SET_PARK_BALANCE:'SET_PARK_BALANCE', 
  UPGRADE_BUILDING: 'UPGRADE_BUILDING',
  UPGRADE_ROADS: 'UPGRADE_ROADS',
  UPGRADE_MAP: 'UPGRADE_MAP',
  SET_ROAD_COUNT: 'SET_ROAD_COUNT',
  SET_BUILDING_QUEUE: 'SET_BUILDING_QUEUE',
  ADD_TO_BUILDING_QUEUE: 'ADD_TO_BUILDING_QUEUE',
  REMOVE_FROM_BUILDING_QUEUE: 'REMOVE_FROM_BUILDING_QUEUE',
  SET_BUILDING_OCCUPANCY: 'SET_BUILDING_OCCUPANCY',
  INCREMENT_BUILDING_OCCUPANCY: 'INCREMENT_BUILDING_OCCUPANCY',
  DECREMENT_BUILDING_OCCUPANCY: 'DECREMENT_BUILDING_OCCUPANCY',
  UPDATE_BUILDING_BONUS:'UPDATE_BUILDING_BONUS'
};

const BUILDING_TYPES = {
  ATTRACTION: 'attraction', 
  BENCH: 'bench',           
  TOILET: 'toilet',         
  FOOD: 'food'              
};

export default createStore({
  state() {
    return {
      gridWidth: 10,
      gridHeight: 10,
      selectedObject: null,
      gameMode: 'place',
      grid: [],
      allPlacedObjects: [],
      nextObjectId: 1,
      entrance: { row: -1, col: -1 },
      visitors: [],
      parkBalance: 1000,    
      spawningInterval: null,
      upgrades: {
        buildings: {}, 
        roads: 1, 
        map: 1    
      },
      roadCount: 0, 
      buildingQueue: {},    
      buildingOccupancy: {},
    };
  },
  getters: {
    getGridWidth: (state) => state.gridWidth,
    getGridHeight: (state) => state.gridHeight,
    getSelectedObject: (state) => state.selectedObject,
    getGameMode: (state) => state.gameMode,
    getGrid: (state) => state.grid,
    getAllPlacedObjects: (state) => state.allPlacedObjects,
    getNextObjectId: (state) => state.nextObjectId,
    activeVisitors: (state) => state.visitors.filter(v => v.status !== 'left'),
    getVisitorById: (state) => (id) => state.visitors.find(v => v.id === id),
    getEntrance: (state) => state.entrance, 
    getParkBalance: (state) => state.parkBalance,
    maxVisitors: (state, getters) => {
      const baseMax = 5 * getters.hasBuildings.length;
      const roadLevel = getters.getRoadLevel;
      const roadCount = getters.getRoadCount;
      switch (roadLevel) {
        case 1:
          return baseMax;
        case 2:
          return baseMax + roadCount; 
        case 3:
          return baseMax + (roadCount * 2); 
        default:
          return baseMax;
      }
    },
    getRoads: (state) => {
      return state.allPlacedObjects.filter(obj => obj && obj.type === 'road');
    },
    
    getBuildings: (state) => {
      return state.allPlacedObjects.filter(obj => obj && obj.type !== 'road');
    },
    hasRoads: (state, getters) => getters.getRoads,
    hasBuildings: (state, getters) => getters.getBuildings,
    getRoadLevel: (state) => state.upgrades.roads,
    getMapLevel: (state) => state.upgrades.map,
    getBuildingLevel: (state) => (buildingId) => state.upgrades.buildings[buildingId] || 1,
    getRoadCount: (state) => state.roadCount,
    getBuildingIncome: (state, getters) => (buildingId) => {
      const building = state.allPlacedObjects.find(obj => obj.id === buildingId);
      if (!building || building.type === 'road') 
      {
        return 0;
      }
      
      const level = getters.getBuildingLevel(buildingId);
      const baseIncome = building.price_for_visitor || 0;
      
      return Math.floor(baseIncome * (1 + (level - 1) * 0.5));
    },
    getBuildingBonus: (state, getters) => (buildingId) => {
      const building = state.allPlacedObjects.find(obj => obj.id === buildingId);
      if (!building) 
      {
        return {};
      }
      
      const level = getters.getBuildingLevel(buildingId);
      
      if (building.statBonusByLevel) {
        return building.statBonusByLevel[level] || building.statBonusByLevel[1] || {};
      }
      
      if (building.statBonus) {
        return building.statBonus;
      }
      
      return building.statBonus || {};
    },
    getBuildingQueue: (state) => (buildingId) => state.buildingQueue[buildingId] || [],
    getBuildingOccupancy: (state) => (buildingId) => state.buildingOccupancy[buildingId] || 0,
    getBuildingQueueLength: (state) => (buildingId) => (state.buildingQueue[buildingId] || []).length,
    calculateMood: () => (stats) => {
      const { fatigue, hunger, boredom, need } = stats;
      return (fatigue + hunger + boredom + need) / 4;
    },
    calculateDesire: () => (visitorStats, building) => {
      const { stats } = visitorStats;
      let desire = 0;
        
      switch(building.type) {
        case BUILDING_TYPES.FOOD:
          desire = 10 - stats.hunger;
          break;
        case BUILDING_TYPES.TOILET:
          desire = 10 - stats.need;
          break;
        case BUILDING_TYPES.BENCH:
          desire = 10 - stats.fatigue;
          break;
        case BUILDING_TYPES.ATTRACTION:
        default:
          desire = 10 - stats.boredom;
          break;
      } 
      return Math.max(0, Math.min(10, desire));
    }
  },
  mutations: {
    [MUTATIONS.SET_GRID_WIDTH]: (state, width) => {
      state.gridWidth = width;
    },
    [MUTATIONS.SET_GRID_HEIGHT]: (state, height) => {
      state.gridHeight = height;
    },
    [MUTATIONS.SET_SELECTED_OBJECT]: (state, obj) => {
      state.selectedObject = obj;
    },
    [MUTATIONS.SET_GAME_MODE]: (state, mode) => {
      state.gameMode = mode;
    },
    [MUTATIONS.SET_GRID]: (state, gridData) => {
      state.grid = gridData;
    },
    [MUTATIONS.SET_ALL_PLACED_OBJECTS]: (state, objects) => {
      state.allPlacedObjects = objects;
    },
    [MUTATIONS.SET_NEXT_OBJECT_ID]: (state, id) => {
      state.nextObjectId = id;
    },
    [MUTATIONS.ADD_PLACED_OBJECT]: (state, obj) => {
      state.allPlacedObjects.push(obj);
      if (obj.type === 'road') {
        state.roadCount++;
      }
    },
    [MUTATIONS.REMOVE_PLACED_OBJECT]: (state, index) => {
      const removedObj = state.allPlacedObjects[index];
      if (removedObj.type === 'road') {
        state.roadCount--;
      }
      state.allPlacedObjects.splice(index, 1);
    },
    [MUTATIONS.OCCUPY_CELLS]: (state, { cells, objectData }) => {
      cells.forEach(({ row, col }) => {
        const isRoad = objectData.name === 'road';
        state.grid[row][col] = {
          ...state.grid[row][col], 
          isOccupied: true,
          occupyingObjectId: objectData.id,
          occupyingObjectColor: objectData.color,
          type: isRoad ? 'ROAD' : 'BUILDING',
        };
      });
    },
    [MUTATIONS.REMOVE_OBJECT_FROM_GRID]: (state, { objectToDelete }) => {
      objectToDelete.shape.forEach(shapePart => {
        const targetRow = objectToDelete.origin.row + shapePart.y;
        const targetCol = objectToDelete.origin.col + shapePart.x;

        if (targetRow >= 0 && targetRow < state.gridHeight && targetCol >= 0 && targetCol < state.gridWidth) {
          if (state.grid[targetRow][targetCol]?.occupyingObjectId === objectToDelete.id) {
            state.grid[targetRow][targetCol] = {
              ...state.grid[targetRow][targetCol],
              isOccupied: false,
              occupyingObjectId: null,
              occupyingObjectColor: null,
              type: 'EMPTY',
            };
          }
        }
      });
    },
    [MUTATIONS.SET_ENTRANCE]: (state, coords) => {
      if (state.entrance.row !== -1) {
        const oldEntranceCell = state.grid[state.entrance.row]?.[state.entrance.col];
        if (oldEntranceCell) {
          oldEntranceCell.type = 'EMPTY'; 
        }
      }
      state.entrance = coords;
      if (coords.row >= 0 && coords.row < state.gridHeight && coords.col >= 0 && coords.col < state.gridWidth) {
        const cell = state.grid[coords.row]?.[coords.col];
        if (cell) {
          cell.type = 'ENTRANCE';
          cell.isOccupied = false;
          cell.occupyingObjectId = null;
          cell.occupyingObjectColor = null;
        }
      }
    },
    [MUTATIONS.ADD_VISITORS]: (state, visitor) => {
      state.visitors.push(visitor);
    },
    [MUTATIONS.REMOVE_VISITOR]: (state, visitorId) => {
      state.visitors = state.visitors.filter(v => v.id !== visitorId);
    },
    [MUTATIONS.UPDATE_VISITOR]: (state, {id, updates}) => {
      const visitor = state.visitors.find(v => v.id === id);
      if (visitor) {
        Object.assign(visitor, updates);
      }
    },
    [MUTATIONS.SET_VISITOR_PATH]: (state, { id, path }) => {
      const visitor = state.visitors.find(v => v.id === id);
      if (visitor) {
        visitor.path = path;
      }
    },
    [MUTATIONS.SET_VISITOR_STATUS]: (state, { id, status }) => {
      const visitor = state.visitors.find(v => v.id === id);
      if (visitor) {
        visitor.status = status;
      }
    },
    [MUTATIONS.SET_OBJECT_TYPE]: (state, { id, type }) => {
      const selectedObject = state.selectedObject.find(v => v.id === id);
      if (selectedObject) {
        selectedObject.type = type;
      }
    },
    [MUTATIONS.SET_PARK_BALANCE]: (state, balance) => {
      state.parkBalance = balance;
    },
     [MUTATIONS.UPGRADE_BUILDING]: (state, { buildingId, newLevel }) => {
      state.upgrades.buildings[buildingId] = newLevel;
    },
    
    [MUTATIONS.UPGRADE_ROADS]: (state, newLevel) => {
      state.upgrades.roads = newLevel;
    },
    
    [MUTATIONS.UPGRADE_MAP]: (state, newLevel) => {
      state.upgrades.map = newLevel;
    },
    
    [MUTATIONS.SET_ROAD_COUNT]: (state, count) => {
      state.roadCount = count;
    },

    [MUTATIONS.SET_BUILDING_QUEUE]: (state, { buildingId, queue }) => {
      state.buildingQueue[buildingId] = queue;
    },
    
    [MUTATIONS.ADD_TO_BUILDING_QUEUE]: (state, { buildingId, visitorId }) => {
      if (!state.buildingQueue[buildingId]) {
        state.buildingQueue[buildingId] = [];
      }
      if (!state.buildingQueue[buildingId].includes(visitorId)) {
        state.buildingQueue[buildingId].push(visitorId);
      }
    },
    
    [MUTATIONS.REMOVE_FROM_BUILDING_QUEUE]: (state, { buildingId, visitorId }) => {
      if (state.buildingQueue[buildingId]) {
        state.buildingQueue[buildingId] = state.buildingQueue[buildingId].filter(id => id !== visitorId);
      }
    },
    
    [MUTATIONS.SET_BUILDING_OCCUPANCY]: (state, { buildingId, occupancy }) => {
      state.buildingOccupancy[buildingId] = occupancy;
    },
    
    [MUTATIONS.INCREMENT_BUILDING_OCCUPANCY]: (state, buildingId) => {
      state.buildingOccupancy[buildingId] = (state.buildingOccupancy[buildingId] || 0) + 1;
    },
    
    [MUTATIONS.DECREMENT_BUILDING_OCCUPANCY]: (state, buildingId) => {
      if (state.buildingOccupancy[buildingId] > 0) {
        state.buildingOccupancy[buildingId]--;
      }
    },
    [MUTATIONS.UPDATE_BUILDING_BONUS]: (state, { buildingId, bonus }) => {
      const building = state.allPlacedObjects.find(obj => obj.id === buildingId);
      if (building) {
        building.statBonus = bonus;
      }
    },
  },
  actions: {
    setGridWidth: ({ commit }, width) => {
      commit(MUTATIONS.SET_GRID_WIDTH, width);
    },
    setGridHeight: ({ commit }, height) => {
      commit(MUTATIONS.SET_GRID_HEIGHT, height);
    },
    setSelectedObject: ({ commit }, obj) => {
      commit(MUTATIONS.SET_SELECTED_OBJECT, obj);
    },
    setGameMode: ({ commit }, mode) => {
      commit(MUTATIONS.SET_GAME_MODE, mode);
    },
    setGrid: ({ commit }, grid) => {
      commit(MUTATIONS.SET_GRID, grid);
    },
    setAllPlacedObjects: ({ commit }, objects) => {
      commit(MUTATIONS.SET_ALL_PLACED_OBJECTS, objects);
    },
    setNextObjectId: ({ commit }, id) => {
      commit(MUTATIONS.SET_NEXT_OBJECT_ID, id);
    },
    addPlacedObject: ({ commit }, obj) => {
      commit(MUTATIONS.ADD_PLACED_OBJECT, obj);
    },
    removePlacedObject: ({ commit }, index) => {
      commit(MUTATIONS.REMOVE_PLACED_OBJECT, index);
    },
    occupyCells: ({ commit }, { cells, objectData }) => {
      commit(MUTATIONS.OCCUPY_CELLS, { cells, objectData });
    },
    removeObjectFromGrid: ({ commit }, { objectToDelete }) => {
      commit(MUTATIONS.REMOVE_OBJECT_FROM_GRID, { objectToDelete });
    },
    setEntarnce: ({commit}, coords) => {
      commit(MUTATIONS.SET_ENTRANCE, coords);
    },
    addToBuildingQueue: ({ commit }, { buildingId, visitorId }) => {
      commit(MUTATIONS.ADD_TO_BUILDING_QUEUE, { buildingId, visitorId });
    },
    
    removeFromBuildingQueue: ({ commit }, { buildingId, visitorId }) => {
      commit(MUTATIONS.REMOVE_FROM_BUILDING_QUEUE, { buildingId, visitorId });
    },
    
    incrementBuildingOccupancy: ({ commit }, buildingId) => {
      commit(MUTATIONS.INCREMENT_BUILDING_OCCUPANCY, buildingId);
    },
    
    decrementBuildingOccupancy: ({ commit }, buildingId) => {
      commit(MUTATIONS.DECREMENT_BUILDING_OCCUPANCY, buildingId);
    },
    
    clearBuildingQueue: ({ commit }, buildingId) => {
      commit(MUTATIONS.SET_BUILDING_QUEUE, { buildingId, queue: [] });
    },
    updateVisitor: ({ commit }, { id, updates }) => {
      commit(MUTATIONS.UPDATE_VISITOR, { id, updates });
    },

    updateVisitorTimer: ({ commit }, { id, timer }) => {
      commit(MUTATIONS.UPDATE_VISITOR, {
        id,
        updates: { visitorTimer: timer }
      });
    },

    initializeGrid: ({ commit, state }) => {
      const finalGrid = [];
      for (let rowIndex = 0; rowIndex < state.gridHeight; rowIndex++) {
        const rowArray = [];
        for (let colIndex = 0; colIndex < state.gridWidth; colIndex++) {
          rowArray.push({
            row: rowIndex,
            col: colIndex,
            isOccupied: false,
            occupyingObjectId: null,
            occupyingObjectColor: null,
            type: 'EMPTY'
          });
        }
        finalGrid.push(rowArray);
      }
      commit(MUTATIONS.SET_GRID, finalGrid);
      commit(MUTATIONS.SET_ALL_PLACED_OBJECTS, []);
      commit(MUTATIONS.SET_NEXT_OBJECT_ID, 1);
      const entranceCoords = {
        row: state.gridHeight,
        col: Math.floor(state.gridWidth / 2),
      };
      commit(MUTATIONS.SET_ENTRANCE, entranceCoords);
    },

    placeObject: ({ commit, state}, { originRow, originCol }) => {
      if (state.parkBalance < state.selectedObject.cost) {
        alert('Недостаточно средств');
        return;
      }
      if (!state.selectedObject || state.gameMode !== 'place') 
      {
        return;
      }

      const objectShape = state.selectedObject.shape;
      const cellsToOccupy = [];
      let canPlace = true;

      for (const shapePart of objectShape) {
        const targetRow = originRow + shapePart.y;
        const targetCol = originCol + shapePart.x;

        if (targetRow < 0 || targetRow >= state.gridHeight || targetCol < 0 || targetCol >= state.gridWidth) 
        {
          canPlace = false;
          alert('Объект выходит за границы поля');
          return;
        }

        if (state.grid[targetRow]?.[targetCol]?.isOccupied) 
        {
          canPlace = false;
          alert('Невозможно разместить объект: клетки заняты');
          return;
        }
        cellsToOccupy.push({ row: targetRow, col: targetCol });
      }

      if (canPlace)
      {
        const getBottommostCell = (shape, originRow, originCol) => {
          let maxRowPlusCol = null;
          let bottomCell = { row: originRow, col: originCol };
          
          shape.forEach(shapePart => {
            const cellRow = originRow + shapePart.y;
            const cellCol = originCol + shapePart.x;
            const rowPlusCol = cellRow + cellCol;
            
            if (maxRowPlusCol === null || rowPlusCol > maxRowPlusCol) {
              maxRowPlusCol = rowPlusCol;
              bottomCell = { row: cellRow, col: cellCol };
            }
          });
          
          return bottomCell;
        };

        const newObjectId = state.nextObjectId++;
        const entranceCell = getBottommostCell(objectShape, originRow, originCol);

        const placedObjectData = {
          id: newObjectId,
          name: state.selectedObject.name,
          color: state.selectedObject.color,
          colors: state.selectedObject.colors, 
          shape: state.selectedObject.shape,
          origin: { row: originRow, col: originCol },
          height: state.selectedObject.height,
          timer: state.selectedObject.timer,
          visitors: state.selectedObject.visitors,
          cost: state.selectedObject.cost,
          price_for_visitor: state.selectedObject.price_for_visitor,
          buildingEntrance: { row: entranceCell.row, col: entranceCell.col }, 
          type: state.selectedObject.type,
          statBonusByLevel: state.selectedObject.statBonusByLevel,
          statBonus: state.selectedObject.statBonus
        };

        commit(MUTATIONS.OCCUPY_CELLS, { cells: cellsToOccupy, objectData: placedObjectData });
        commit(MUTATIONS.ADD_PLACED_OBJECT, placedObjectData);
        commit(MUTATIONS.SET_PARK_BALANCE, state.parkBalance - state.selectedObject.cost);
        commit(MUTATIONS.SET_SELECTED_OBJECT, null); 
      }
    },

    deleteObject: ({ commit, state }, { row, col }) => {
      if (state.gameMode !== 'delete') 
      {
        return;
      }

      const cellData = state.grid[row]?.[col];
      if (!cellData || !cellData.isOccupied || !cellData.occupyingObjectId) 
      {
        return; 
      }

      const objectIdToDelete = cellData.occupyingObjectId;
      const objectIndex = state.allPlacedObjects.findIndex(obj => obj.id === objectIdToDelete);

      const objectToDelete = state.allPlacedObjects[objectIndex];
      const refund = objectToDelete.cost;

      commit(MUTATIONS.SET_PARK_BALANCE, state.parkBalance + refund);
      commit(MUTATIONS.REMOVE_OBJECT_FROM_GRID, { objectToDelete });
      commit(MUTATIONS.REMOVE_PLACED_OBJECT, objectIndex);

      alert("Объект удалён");
    },
    spawnVisitor: ({ commit, state, getters }) => {
      if (getters.hasRoads.length !== 0 && getters.hasBuildings.length === 0 || getters.hasBuildings.length === 0) {
        return;
      }

      const maxVisitors = 5 * getters.hasBuildings.length;
      if (state.visitors.length >= maxVisitors) {
        return;
      }

      const randomBuilding = getters.hasBuildings[Math.floor(Math.random() * getters.hasBuildings.length)];
 
      const visitor = {
        id: Date.now().toString(),
        x: state.entrance.col,
        y: state.entrance.row,
        targetBuildingId: randomBuilding.id,
        visitorTimer: randomBuilding.timer,
        status: 'spawning',
        path: [],
        direction: 'left',
        lastPosition: 'null',
        balance: Math.floor(Math.random() * 91) + 10,
        stats: {
          fatigue: 10,     
          hunger: 10,       
          boredom: 10,      
          need: 10          
        },
        mood: 10,           
        criticalStats: [],  
        visitedBuildings: [] 
      };
      visitor.mood = getters.calculateMood(visitor.stats);
      commit('ADD_VISITORS', visitor);
    },

    startVisitorSpawning({ state, dispatch }, interval = 3000) {
      if (state.spawningInterval) {
        return;
      }
      state.spawningInterval = setInterval(() => {
        dispatch('spawnVisitor');
      }, interval);
    },

    stopVisitorSpawning({ state }) {
      if (state.spawningInterval) {
        clearInterval(state.spawningInterval);
        state.spawningInterval = null;
      }
    },

    makeFirstStep: ({commit, state}, visitorId) => {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if(!visitor) {
        return;
      }
      const entranceRow = state.entrance.row;
      const entranceCol = state.entrance.col;
      const firstStepX = 0;
      const firstStepY = entranceRow;
      commit(MUTATIONS.UPDATE_VISITOR, {
        id: visitorId,
        updates: {
          lastPosition: { x: entranceCol, y: entranceRow },
          x: entranceCol,
          y: entranceRow - 1,
          direction: 'left',
          status: 'walking',
          path:  [{ x: firstStepX, y: firstStepY }]
        }
      });
    },
    moveVisitor: ({ commit, state, dispatch, getters}, visitorId) => {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if(!visitor || visitor.status !== 'walking') {
        return;
      }

      const stats = { ...visitor.stats };
      
      const probabilities = {
        fatigue: 10 - stats.fatigue,
        hunger: 10 - stats.hunger,
        boredom: 10 - stats.boredom,
        need: 10 - stats.need
      };

      const totalProbability = probabilities.fatigue + probabilities.hunger + 
                              probabilities.boredom + probabilities.need;

       const random = Math.random() * totalProbability;
      
      let currentSum = 0;
      let statToDecrease = null;
      
      for (const [stat, prob] of Object.entries(probabilities)) {
        currentSum += prob;
        if (random < currentSum) {
          statToDecrease = stat;
          break;
        }
      }

      if (statToDecrease && stats[statToDecrease] > 0) {
        stats[statToDecrease]--;
      }

      const criticalStats = [];
      for (const [stat, value] of Object.entries(stats)) {
        if (value < 3) {
          criticalStats.push(stat);
        }
      }

      const mood = getters.calculateMood(stats);

      commit(MUTATIONS.UPDATE_VISITOR, {
        id: visitorId,
        updates: {
          stats: stats,
          criticalStats: criticalStats,
          mood: mood
        }
      });

       const buildings = getters.getBuildings || [];
      
      if (criticalStats.length > 0) {
        const stat = criticalStats[0];
        const statToBuildingType = {
          hunger: BUILDING_TYPES.FOOD,
          fatigue: BUILDING_TYPES.BENCH,
          need: BUILDING_TYPES.TOILET,
          boredom: BUILDING_TYPES.ATTRACTION
        };
        
        const targetType = statToBuildingType[stat];
        
        if (targetType) {
          const suitableBuildings = buildings.filter(b => {
            if (!b) 
            {
              return false;
            }
            if (b.id === visitor.targetBuildingId) 
            {
              return false; 
            }
            return b.type === targetType;
          });
          
          if (suitableBuildings.length > 0) {
            const buildingForCritical = suitableBuildings[Math.floor(Math.random() * suitableBuildings.length)];
            
            commit(MUTATIONS.UPDATE_VISITOR, {
              id: visitorId,
              updates: {
                targetBuildingId: buildingForCritical.id,
                visitorTimer: buildingForCritical.timer || 5
              }
            });
          }
        }
      }

      const updatedVisitor = state.visitors.find(v => v.id === visitorId) || visitor;
      const directions = [
      { dx: 0, dy: 1, dir: 'right', weight: 10 },
      { dx: 1, dy: 0, dir: 'up', weight: 20 },
      { dx: -1, dy: 0, dir: 'down', weight: 20 },
      { dx: 0, dy: -1, dir: 'left', weight: 50 }
      ];

      const roads = getters.getRoads;

      const validDirections = directions.filter(({ dx, dy }) => {
        const newX = updatedVisitor.x + dx;
        const newY = updatedVisitor.y + dy;

        if (newX < 0 || newX >= state.gridWidth || newY < 0 || newY >= state.gridHeight) 
        {
          return false;
        }

        const isRoad = roads.some(road => {
          if (!road || !road.origin) 
          {
            return false;
          }
          
          if (road.shape && Array.isArray(road.shape)) {
            return road.shape.some(shapePart => {
              const roadX = road.origin.col + shapePart.x;
              const roadY = road.origin.row + shapePart.y;
              return roadX === newX && roadY === newY;
            });
          } else {
            return road.origin.col === newX && road.origin.row === newY;
          }
        });

        return isRoad;
      });

      if (validDirections.length === 0) 
      {
        return;
      }

      const forwardDirections = validDirections.filter(({ dx, dy }) => {
        const newX = updatedVisitor.x + dx;
        const newY = updatedVisitor.y + dy;
        if (updatedVisitor.lastPosition && newX === updatedVisitor.lastPosition.x && newY === updatedVisitor.lastPosition.y) 
        {
          return false;
        }
        return true;
      });

      const availableDirections = forwardDirections.length > 0 ? forwardDirections : validDirections;

      const totalWeight = availableDirections.reduce((sum, dir) => sum + dir.weight, 0);
      let randomValue = Math.random() * totalWeight;
      let selectedDir = availableDirections[0];

      for (const dir of availableDirections) {
        randomValue -= dir.weight;
        if (randomValue <= 0) {
          selectedDir = dir;
          break;
        }
      }

      const newX = updatedVisitor.x + selectedDir.dx;
      const newY = updatedVisitor.y + selectedDir.dy;

      commit(MUTATIONS.UPDATE_VISITOR, {
        id: visitorId,
        updates: {
          lastPosition: { x: visitor.x, y: visitor.y },
          x: newX,
          y: newY,
          direction: selectedDir.dir,
          path: [...visitor.path, { x: newX, y: newY }]
        }
      });

      commit(MUTATIONS.UPDATE_VISITOR, {
        id: visitorId,
        updates: {
          lastPosition: { x: updatedVisitor.x, y: updatedVisitor.y },
          x: newX,
          y: newY,
          direction: selectedDir.dir,
          path: [...(updatedVisitor.path || []), { x: newX, y: newY }]
        }
      });

      dispatch('enterToBuilding', visitorId);

      const isNeartheEntrance = 
      (Math.abs(updatedVisitor.y - state.entrance.row) === 1 && updatedVisitor.x === state.entrance.col) ||
      (Math.abs(updatedVisitor.x - state.entrance.col) === 1 && updatedVisitor.y === state.entrance.row);
      if (isNeartheEntrance) {
        dispatch('moveVisitorToExit', visitor.id);
      }
    },

    calculateDesireWithQueue: ({ getters }, { visitorStats, building, buildingId }) => {
      const baseDesire = getters.calculateDesire(visitorStats, building);
      const queueLength = getters.getBuildingQueueLength(buildingId) || 0;
      const maxVisitors = building.visitors || 3;
      
      const maxQueueLength = maxVisitors * 2;
      const queueFactor = Math.max(0.1, 1 - (queueLength / maxQueueLength));
      
      return baseDesire * queueFactor;
    },

    enterToBuilding: ({commit, state, dispatch, getters}, visitorId) => {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if(!visitor || visitor.status !== 'walking') {
        return;
      }

      const buildingEntryId = visitor.targetBuildingId;
      const building = getters.hasBuildings.find(v => v.id === buildingEntryId);

       if (!building) {
        dispatch('findNewTarget', visitorId);
        return;
      }

      const buildingEntry = building.buildingEntrance;

      const isNeartheEntrance = 
      (Math.abs(visitor.y - buildingEntry.row) === 1 && visitor.x === buildingEntry.col) ||
      (Math.abs(visitor.x - buildingEntry.col) === 1 && visitor.y === buildingEntry.row);

      if (isNeartheEntrance) {
        const currentOccupancy = getters.getBuildingOccupancy(buildingEntryId) || 0;
        const maxVisitors = building.visitors || 3;
        const queueLength = getters.getBuildingQueueLength(buildingEntryId) || 0;
        
        if (currentOccupancy < maxVisitors) {
          if (visitor.criticalStats && visitor.criticalStats.length > 0) {
            const criticalStat = visitor.criticalStats[0];
            
            const buildingBonus = getters.getBuildingBonus(buildingEntryId);
            const helpsCritical = buildingBonus && buildingBonus[criticalStat];
            
            if (!helpsCritical) {
              if (visitor.mood < 4) { 
                const suitableBuildings = getters.hasBuildings.filter(b => {
                  if (!b || b.id === buildingEntryId)
                  {
                    return false;
                  }
                  const bBonus = getters.getBuildingBonus(b.id);
                  return bBonus && bBonus[criticalStat];
                });
                
                if (suitableBuildings.length > 0) {
                  const suitableBuilding = suitableBuildings[0];
                  commit(MUTATIONS.UPDATE_VISITOR, {
                    id: visitorId,
                    updates: {
                      targetBuildingId: suitableBuilding.id,
                      visitorTimer: suitableBuilding.timer || 5,
                      status: 'walking'
                    }
                  });
                  return;
                } else if (visitor.mood < 2) {
                  dispatch('moveVisitorToExit', visitorId);
                  return;
                }
              }
            }
          }
          
          const buildingIncome = getters.getBuildingIncome(buildingEntryId) || 0;
          
          if (buildingIncome > 0) { 
            if (visitor.balance < buildingIncome) {
              dispatch('findNewTarget', visitorId);
              return;
            }
            
            visitor.balance = visitor.balance - buildingIncome;
            
            commit(MUTATIONS.SET_PARK_BALANCE, state.parkBalance + buildingIncome);
          }
          
        
          dispatch('incrementBuildingOccupancy', buildingEntryId);
          
          const buildingBonus = getters.getBuildingBonus(buildingEntryId);
          const newStats = { ...visitor.stats };
          
          if (buildingBonus) {
            for (const [stat, bonus] of Object.entries(buildingBonus)) {
              newStats[stat] = Math.min(10, Math.max(0, newStats[stat] + bonus));
            }
          }
          
          const buildingLevel = getters.getBuildingLevel(buildingEntryId);
          const baseTimer = building.timer || 5;
          const stayTimer = Math.max(3, baseTimer + (buildingLevel - 1));
          
          const newMood = getters.calculateMood(newStats);
          
          const newCriticalStats = Object.entries(newStats)
            .filter(([_, value]) => value < 3)
            .map(([stat]) => stat);
          
          commit(MUTATIONS.UPDATE_VISITOR, {
            id: visitorId,
            updates: {
              lastPosition: { x: visitor.x, y: visitor.y },
              x: buildingEntry.col,
              y: buildingEntry.row,
              status: 'inBuilding',
              stats: newStats,
              mood: newMood,
              criticalStats: newCriticalStats,
              visitorTimer: stayTimer,
              lastPayment: buildingIncome > 0 ? buildingIncome : 0
            }
          });
          
          if (!visitor.visitedBuildings.includes(buildingEntryId)) {
            visitor.visitedBuildings.push(buildingEntryId);
          }
          
          if (!visitor.visitedBuildingLevels) {
            visitor.visitedBuildingLevels = {};
          }
          visitor.visitedBuildingLevels[buildingEntryId] = buildingLevel;
          
        } else {
          const maxQueueLength = 4; 
          
          if (queueLength >= maxQueueLength) {
            dispatch('findNewTarget', visitorId);
            return;
          }
          
          if (visitor.criticalStats && visitor.criticalStats.length > 0) {
            const criticalStat = visitor.criticalStats[0];
            const buildingBonus = getters.getBuildingBonus(buildingEntryId);
            const helpsCritical = buildingBonus && buildingBonus[criticalStat];
            
            if (!helpsCritical && visitor.mood < 3) {
              dispatch('findNewTarget', visitorId);
              return;
            }
          }
          
          const buildingIncome = getters.getBuildingIncome(buildingEntryId) || 0;
          if (buildingIncome > 0 && visitor.balance < buildingIncome) {
            dispatch('findNewTarget', visitorId);
            return;
          }
          
          dispatch('addToBuildingQueue', { buildingId: buildingEntryId, visitorId });
          
          commit(MUTATIONS.UPDATE_VISITOR, {
            id: visitorId,
            updates: {
              status: 'inQueue',
              queuePosition: queueLength + 1,
              queueBuildingId: buildingEntryId,
              queueWaitTime: 0,
              lastPosition: { x: visitor.x, y: visitor.y } 
            }
          });
          
          commit(MUTATIONS.UPDATE_VISITOR_POSITION, {
            id: visitorId,
            x: visitor.x,
            y: visitor.y
          });
        }
      }
    },

    findNewTarget: ({ commit, state, getters, dispatch }, visitorId) => {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if (!visitor)
      {
        return;
      }
      
      const buildings = getters.getBuildings;
      if (buildings.length === 0) 
      {
        dispatch('moveVisitorToExit', visitorId);
        return;
      }
      
      const buildingDesires = buildings.map(building => {
        const baseDesire = getters.calculateDesire(visitor, building);
        
        const queueLength = getters.getBuildingQueueLength(building.id) || 0;
        const maxVisitors = building.visitors || 3;
        
        const maxQueueLength = 4;
        const queueFactor = Math.max(0.1, 1 - (queueLength / maxQueueLength));
        
        return {
          building,
          desire: baseDesire * queueFactor
        };
      });
      
      buildingDesires.sort((a, b) => b.desire - a.desire);
      
      const bestBuilding = buildingDesires[0].building;
      
      commit(MUTATIONS.UPDATE_VISITOR, {
        id: visitorId,
        updates: {
          targetBuildingId: bestBuilding.id,
          visitorTimer: bestBuilding.timer,
          status: 'walking', 
          queueBuildingId: null,
          queuePosition: null,
          queueWaitTime: 0
        }
      });
      
      if (visitor.queueBuildingId && visitor.queueBuildingId !== bestBuilding.id) {
        dispatch('removeFromBuildingQueue', { 
          buildingId: visitor.queueBuildingId, 
          visitorId 
        });
      }
      
      dispatch('moveVisitor', visitorId);
    },

    exitTheBuilding: ({commit, state, dispatch, getters}, visitorId) => {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if(!visitor || !visitor.targetBuildingId) {
        return;
      }
      const buildingEntryId = visitor.targetBuildingId;

      dispatch('decrementBuildingOccupancy', buildingEntryId);

      const queue = getters.getBuildingQueue(buildingEntryId) || [];
      if (queue.length > 0) {
        const nextVisitorId = queue[0];
        dispatch('removeFromBuildingQueue', { buildingId: buildingEntryId, visitorId: nextVisitorId });
        
        const updatedQueue = getters.getBuildingQueue(buildingEntryId) || [];
        updatedQueue.forEach((queuedVisitorId, index) => {
          const queuedVisitor = state.visitors.find(v => v.id === queuedVisitorId);
          if (queuedVisitor && queuedVisitor.status === 'inQueue') {
            commit(MUTATIONS.UPDATE_VISITOR, {
              id: queuedVisitorId,
              updates: {
                queuePosition: index + 1
              }
            });
          }
        });
        
        dispatch('checkQueueEntry', { buildingId: buildingEntryId });
      }
      const buildingEntry = getters.hasBuildings.find(v => v.id === buildingEntryId).buildingEntrance;
      var randomBuilding = getters.hasBuildings[Math.floor(Math.random() * getters.hasBuildings.length)];
      if (getters.hasBuildings.length === 1) 
      {
        dispatch('moveVisitorToExit', visitor.id);
        return; 
      }
      while (randomBuilding.id === buildingEntryId)
      {
        randomBuilding = getters.hasBuildings[Math.floor(Math.random() * getters.hasBuildings.length)];
      }
      if (!buildingEntry) 
      {
        return;
      }
      commit(MUTATIONS.UPDATE_VISITOR, {
        id: visitorId,
        updates: {
          lastPosition: { x: buildingEntry.col, y: buildingEntry.row },
          x: buildingEntry.col,
          y: buildingEntry.row,
          status: 'walking',
          targetBuildingId: randomBuilding.id,
          visitorTimer: randomBuilding.timer,
          }
      });
    },

    checkQueueEntry: ({ dispatch, getters, state }, { buildingId }) => {
      const building = getters.hasBuildings.find(v => v.id === buildingId);
      if (!building)
      {
        return;
      }
      
      const currentOccupancy = getters.getBuildingOccupancy(buildingId) || 0;
      const maxVisitors = building.visitors || 3;
      
      if (currentOccupancy < maxVisitors) {
        const queue = getters.getBuildingQueue(buildingId) || [];
        if (queue.length > 0) {
          const nextVisitorId = queue[0];
          const nextVisitor = state.visitors.find(v => v.id === nextVisitorId);
          if (nextVisitor && nextVisitor.status === 'inQueue') {
            dispatch('removeFromBuildingQueue', { buildingId, visitorId: nextVisitorId });
            
            const buildingEntry = building.buildingEntrance;
            
            dispatch('updateVisitor', {
              id: nextVisitorId,
              updates: {
                x: buildingEntry.col,
                y: buildingEntry.row,
                status: 'walking',
                queueBuildingId: null,
                queuePosition: null,
                queueWaitTime: 0,
                targetBuildingId: buildingId,
                visitorTimer: building.timer
              }
            });
            
            setTimeout(() => {
              dispatch('enterToBuilding', nextVisitorId);
            }, 100);
          }
        }
      }
    },
    moveVisitorToExit({ commit, state}, visitorId) {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if (!visitor || visitor.status !== 'walking') 
      { 
        return;
      }

      if (visitor.queueBuildingId) {
        dispatch('removeFromBuildingQueue', { 
          buildingId: visitor.queueBuildingId, 
          visitorId 
        });
      }

      const entrance = state.entrance;

      commit(MUTATIONS.UPDATE_VISITOR, {
        id: visitorId,
        updates: {
          x: entrance.col,
          y: entrance.row,
          status: 'exit',
          queueBuildingId: null,
          queuePosition: null,
          queueWaitTime: 0
        }
      });

      setTimeout(() => {
        commit(MUTATIONS.REMOVE_VISITOR, visitorId)
      }, 2000)
    },
    stepAllVisitors ({ dispatch, state }) {
      const visitorsCopy = [...state.visitors];
      visitorsCopy.forEach(v => {
        if (!v || !v.id)
        {
          return;
        }
        if (v.status == 'spawning'){
          dispatch('makeFirstStep',v.id)
        } else if (v.status == 'walking') {
          dispatch('moveVisitor', v.id);
        } else if (v.status === 'inBuilding') {
          if (v.visitorTimer !== undefined) {
            const newTimer = v.visitorTimer - 1;
            if (newTimer <= 0) {
              dispatch('exitTheBuilding', v.id);
              if (v.balance < 5) {
                dispatch('moveVisitorToExit', v.id);
              }
            } else {
                dispatch('updateVisitorTimer', { id: v.id, timer: newTimer });
            }
            
          }
        } else if (v.status === 'inQueue') {
          dispatch('checkQueuePatience', v.id);
        }
      });
    },

    checkQueuePatience: ({ commit, dispatch, state }, visitorId) => {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if (!visitor || visitor.status !== 'inQueue')
      {
        return;
      }
      
      const waitTime = (visitor.queueWaitTime || 0) + 1;
      commit(MUTATIONS.UPDATE_VISITOR, {
        id: visitorId,
        updates: { queueWaitTime: waitTime }
      });
      if (waitTime > 10) {
        dispatch('findNewTarget', visitorId);
      }
    },
    upgradeBuilding: ({ commit, state, getters }, buildingId) => {
      const currentLevel = getters.getBuildingLevel(buildingId);
  
      if (currentLevel >= 3) {
        alert('Достигнут максимальный уровень');
        return;
      }
      
      const upgradeCost = currentLevel * 250;
      if (state.parkBalance < upgradeCost) {
        alert('Недостаточно средств для улучшения');
        return;
      }
      
      const building = state.allPlacedObjects.find(obj => obj.id === buildingId);
      if (!building)
      {
        return;
      }
      
      const newLevel = currentLevel + 1;
      
      commit(MUTATIONS.UPGRADE_BUILDING, { buildingId, newLevel });
      
      if (building.colors && building.colors[newLevel]) {
        const newColor = building.colors[newLevel];
        building.color = newColor;
        
        building.shape.forEach(shapePart => {
          const targetRow = building.origin.row + shapePart.y;
          const targetCol = building.origin.col + shapePart.x;
          
          if (state.grid[targetRow]?.[targetCol]) {
            state.grid[targetRow][targetCol].occupyingObjectColor = newColor;
          }
        });
      }
  
      if (building.statBonusByLevel && building.statBonusByLevel[newLevel]) {
        const newBonus = building.statBonusByLevel[newLevel];
        commit(MUTATIONS.UPDATE_BUILDING_BONUS, { buildingId, bonus: newBonus });
      }
      commit(MUTATIONS.SET_PARK_BALANCE, state.parkBalance - upgradeCost);
      
      alert('Здание "' + building.name + '" улучшено до ' + newLevel + ' уровня');
    },
    
    upgradeRoads: ({ commit, state, getters }) => {
      const currentLevel = getters.getRoadLevel;
      if (currentLevel >= 3) {
        alert('Дороги уже максимального уровня');
        return;
      }
      
      const upgradeCost = currentLevel * 150;
      if (state.parkBalance < upgradeCost) {
        alert('Недостаточно средств для улучшения дорог');
        return;
      }
      
      const newLevel = currentLevel + 1;
      commit(MUTATIONS.UPGRADE_ROADS, newLevel);
      commit(MUTATIONS.SET_PARK_BALANCE, state.parkBalance - upgradeCost);
      
      alert('Дороги улучшены до ' + newLevel +  ' уровня');
    },
    
    upgradeMap: ({ commit, state, getters, dispatch }) => {
      const currentLevel = getters.getMapLevel;
      if (currentLevel >= 3) {
        alert('Карта уже максимального размера');
        return;
      }
      
      const upgradeCost = currentLevel * 500; 
      if (state.parkBalance < upgradeCost) {
        alert('Недостаточно средств для расширения карты');
        return;
      }
      
      const newLevel = currentLevel + 1;
      commit(MUTATIONS.UPGRADE_MAP, newLevel);
      commit(MUTATIONS.SET_PARK_BALANCE, state.parkBalance - upgradeCost);
    
      dispatch('expandMap', newLevel);
      
      alert('Карта расширена до ' + newLevel + ' уровня');
    },

    expandMap: ({ commit, state, getters }) => {
      const mapLevel = getters.getMapLevel || 1;
      
      const levelSizes = {
        1: { width: 10, height: 10 },
        2: { width: 12, height: 12 },
        3: { width: 14, height: 14 }  
      };
      
      const newSize = levelSizes[mapLevel];
      if (!newSize) 
      {
        return;
      }

      const oldWidth = state.gridWidth;
      const oldHeight = state.gridHeight;
      const oldGrid = [...state.grid];
      
      const widthIncrease = newSize.width - oldWidth;
      const heightIncrease = newSize.height - oldHeight;
      
      const colsToAddLeft = Math.floor(widthIncrease / 2);
      const colsToAddRight = widthIncrease - colsToAddLeft;
      
      const rowsToAddTop = heightIncrease;
      
      const newGrid = [];
      for (let newRow = 0; newRow < newSize.height; newRow++) {
        const row = [];
        for (let newCol = 0; newCol < newSize.width; newCol++) {
          const oldRow = newRow - rowsToAddTop;
          const oldCol = newCol - colsToAddLeft;
          
          if (
            oldRow >= 0 && oldRow < oldHeight &&
            oldCol >= 0 && oldCol < oldWidth &&
            oldGrid[oldRow] && 
            oldGrid[oldRow][oldCol]
          ) {
            const oldCell = oldGrid[oldRow][oldCol];
            row.push({
              ...oldCell,
              row: newRow,
              col: newCol
            });
          } else {
            row.push({
              row: newRow,
              col: newCol,
              isOccupied: false,
              occupyingObjectId: null,
              occupyingObjectColor: null,
              type: 'EMPTY'
            });
            
          }
        }
        newGrid.push(row);
      }
      
      commit(MUTATIONS.SET_GRID_WIDTH, newSize.width);
      commit(MUTATIONS.SET_GRID_HEIGHT, newSize.height);
      commit(MUTATIONS.SET_GRID, newGrid);
      
      const colsToAddEachSide = colsToAddLeft;
      
      state.allPlacedObjects.forEach(building => {
        if (building.origin) {
          building.origin.row += rowsToAddTop;
          building.origin.col += colsToAddEachSide;
          
          if (building.buildingEntrance) {
            building.buildingEntrance.row += rowsToAddTop;
            building.buildingEntrance.col += colsToAddEachSide;
          }
        }
      });
      
      state.visitors.forEach(visitor => {
        if (visitor.x !== undefined && visitor.y !== undefined) {
          visitor.x += colsToAddEachSide;
          visitor.y += rowsToAddTop;
        }
        if (visitor.lastPosition) {
          visitor.lastPosition.x += colsToAddEachSide;
          visitor.lastPosition.y += rowsToAddTop;
        }
        if (visitor.path && Array.isArray(visitor.path)) {
          visitor.path = visitor.path.map(point => ({
            x: point.x + colsToAddEachSide,
            y: point.y + rowsToAddTop
          }));
        }
      });
      
      const entranceRow = newSize.height; 
      const entranceCol = Math.floor(newSize.width / 2);
      
      if (
        entranceRow >= 0 && entranceRow < newSize.height &&
        entranceCol >= 0 && entranceCol < newSize.width &&
        newGrid[entranceRow] && 
        newGrid[entranceRow][entranceCol]
      ) {
        if (newGrid[entranceRow][entranceCol].isOccupied) {
          newGrid[entranceRow][entranceCol] = {
            row: entranceRow,
            col: entranceCol,
            isOccupied: false,
            occupyingObjectId: null,
            occupyingObjectColor: null,
            type: 'ENTRANCE'
          };
        } else {
          newGrid[entranceRow][entranceCol].type = 'ENTRANCE';
        }
      }
      
      commit(MUTATIONS.SET_ENTRANCE, { row: entranceRow, col: entranceCol });
      commit(MUTATIONS.SET_GRID, newGrid);
    },
    
    updateVisitorStatsOnStep: ({ commit }, visitorId) => {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if (!visitor) 
      {
        return null;
      }
      const stats = { ...visitor.stats };
      const mood = calculateMood(stats);
      commit(MUTATIONS.UPDATE_VISITOR, {id: visitorId,updates: { stats, mood }});
      return { stats, mood };
    },
      
    findBuildingForStat: ({ state, getters }, { stat, excludeBuildingId = null }) => {
      const statToBuildingType = {
        hunger: BUILDING_TYPES.FOOD,
        fatigue: BUILDING_TYPES.BENCH,
        need: BUILDING_TYPES.TOILET,
        boredom: BUILDING_TYPES.ATTRACTION
      };
        
      const targetType = statToBuildingType[stat];
      if (!targetType)
      { 
        return null;
      }
        
      const buildings = getters.getBuildings.filter(b => {
        if (!b)
        {
          return false;
        }
        if (excludeBuildingId && b.id === excludeBuildingId)
        {
           return false;
        }
        return b.type === targetType;
      });
        
      if (buildings.length === 0) 
      {
        return null;
      }
      return buildings[Math.floor(Math.random() * buildings.length)];
    }
  }
});