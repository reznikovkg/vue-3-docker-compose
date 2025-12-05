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
  SET_PARK_BALANCE:'SET_PARK_BALANCE' 
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
      spawningInterval: null
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
    maxVisitors: (state) => {
      return 5 * state.allPlacedObjects.length;
    },
    hasRoads: (state) => {
      return state.allPlacedObjects.filter(obj => obj.name === 'Road');
    },
    hasBuildings: (state) => {
      return state.allPlacedObjects.filter(obj => obj.name !== 'Road');
    },
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
    },
    [MUTATIONS.REMOVE_PLACED_OBJECT]: (state, index) => {
      state.allPlacedObjects.splice(index, 1);
    },
    [MUTATIONS.OCCUPY_CELLS]: (state, { cells, objectData }) => {
      cells.forEach(({ row, col }) => {
        const isRoad = objectData.name === 'Road';
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
    }
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
        const newObjectId = state.nextObjectId++;
        const placedObjectData = {
          id: newObjectId,
          name: state.selectedObject.name,
          color: state.selectedObject.color,
          shape: state.selectedObject.shape,
          origin: { row: originRow, col: originCol },
          height: state.selectedObject.height,
          timer: state.selectedObject.timer,
          visitors: state.selectedObject.visitors,
          cost: state.selectedObject.cost,
          price_for_visitor: state.selectedObject.price_for_visitor,
          buildingEntrance: {row: originRow + state.selectedObject.height - 1, col: originCol}
        };

        commit(MUTATIONS.OCCUPY_CELLS, { cells: cellsToOccupy, objectData: placedObjectData });
        commit(MUTATIONS.ADD_PLACED_OBJECT, placedObjectData);
        commit(MUTATIONS.SET_SELECTED_OBJECT, placedObjectData); 
        commit(MUTATIONS.SET_PARK_BALANCE, state.parkBalance - state.selectedObject.cost);
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
      };
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
      const directions = [
      { dx: 0, dy: 1, dir: 'right', weight: 10 },
      { dx: 1, dy: 0, dir: 'up', weight: 20 },
      { dx: -1, dy: 0, dir: 'down', weight: 20 },
      { dx: 0, dy: -1, dir: 'left', weight: 50 }
      ];

      const validDirections = directions.filter(({ dx, dy }) => {
        const newX = visitor.x + dx;
        const newY = visitor.y + dy;
        const isRoad = getters.hasRoads.some(road => road.origin.row === newY && road.origin.col === newX);
        return isRoad;
      });

      const forwardDirections = validDirections.filter(({ dx, dy }) => {
        const newX = visitor.x + dx;
        const newY = visitor.y + dy;
        if (visitor.lastPosition && newX === visitor.lastPosition.x && newY === visitor.lastPosition.y) {
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

      const newX = visitor.x + selectedDir.dx;
      const newY = visitor.y + selectedDir.dy;

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

      dispatch('enterToBuilding', visitorId);

      const isNeartheEntrance = 
      (Math.abs(visitor.y - state.entrance.row) === 1 && visitor.x === state.entrance.col) ||
      (Math.abs(visitor.x - state.entrance.col) === 1 && visitor.y === state.entrance.row);
      if (isNeartheEntrance) {
        dispatch('moveVisitorToExit', visitor.id);
      }
    },

    enterToBuilding: ({commit, state, dispatch, getters}, visitorId) => {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if(!visitor || visitor.status !== 'walking') {
        return;
      }

      const buildingEntryId = visitor.targetBuildingId;
      const building = getters.hasBuildings.find(v => v.id === buildingEntryId);
      const buildingEntry = getters.hasBuildings.find(v => v.id === buildingEntryId).buildingEntrance;

      const isNeartheEntrance = 
      (Math.abs(visitor.y - buildingEntry.row) === 1 && visitor.x === buildingEntry.col) ||
      (Math.abs(visitor.x - buildingEntry.col) === 1 && visitor.y === buildingEntry.row);

      if (isNeartheEntrance) {
        const visitorsInBuilding = state.visitors.filter(v => 
            v.targetBuildingId === buildingEntryId && v.status === 'inBuilding').length

        if (visitorsInBuilding < building.visitors) {
          const spendInBuilding = building.price_for_visitor;
          if (visitor.balance <= spendInBuilding)
          {
            dispatch('exitTheBuilding', visitor.id);
            return;
          }

          commit(MUTATIONS.UPDATE_VISITOR, {
            id: visitorId,
            updates: {
              lastPosition: { x: visitor.x, y: visitor.y },
              x: buildingEntry.col,
              y: buildingEntry.row,
              status: 'inBuilding',
              balance: visitor.balance - spendInBuilding,
            }
          });

          commit(MUTATIONS.SET_PARK_BALANCE, state.parkBalance + spendInBuilding);
        }
      }
    },

    exitTheBuilding: ({commit, state, dispatch, getters}, visitorId) => {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if(!visitor || !visitor.targetBuildingId) {
        return;
      }
      const buildingEntryId = visitor.targetBuildingId;
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
    moveVisitorToExit({ commit, state}, visitorId) {
      const visitor = state.visitors.find(v => v.id === visitorId);
      if (!visitor || visitor.status !== 'walking') 
      { 
        return;
      }

      const entrance = state.entrance;

      commit(MUTATIONS.UPDATE_VISITOR, {
        id: visitorId,
        updates: {
          x: entrance.col,
          y: entrance.row,
          status: 'exit',
        }
      });

      setTimeout(() => {
        commit(MUTATIONS.REMOVE_VISITOR, visitorId)
      }, 2000)
    },
    stepAllVisitors ({ dispatch, state }) {
      state.visitors.forEach(v => 
        {
          if (v.status == 'spawning')
          {
            dispatch('makeFirstStep',v.id)
          } else if (v.status == 'walking') 
          {
            dispatch('moveVisitor', v.id);
          }
          else if ('inBuilding', v.id) 
          {
            v.visitorTimer--
            if (v.visitorTimer <= 0 )
            {
              dispatch('exitTheBuilding', v.id)
              if (v.balance < 5) {
              dispatch('moveVisitorToExit', v.id);
              }
            }
          }
        }  
      )
    }
  }
});