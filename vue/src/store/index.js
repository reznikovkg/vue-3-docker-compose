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
  REMOVE_OBJECT_FROM_GRID: 'REMOVE_OBJECT_FROM_GRID'
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
      nextObjectId: 1
    };
  },
  getters: {
    getGridWidth: (state) => state.gridWidth,
    getGridHeight: (state) => state.gridHeight,
    getSelectedObject: (state) => state.selectedObject,
    getGameMode: (state) => state.gameMode,
    getGrid: (state) => state.grid,
    getAllPlacedObjects: (state) => state.allPlacedObjects,
    getNextObjectId: (state) => state.nextObjectId
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
        state.grid[row][col] = {
          ...state.grid[row][col], 
          isOccupied: true,
          occupyingObjectId: objectData.id,
          occupyingObjectColor: objectData.color,
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

    initializeGrid: ({ commit, state }) => {
      const finalGrid = Array(state.gridHeight).fill(null).map((_, rowIndex) =>
        Array(state.gridWidth).fill(null).map((_, colIndex) => ({
          row: rowIndex,
          col: colIndex,
          isOccupied: false,
          occupyingObjectId: null,
          occupyingObjectColor: null,
        }))
      );
      commit(MUTATIONS.SET_GRID, finalGrid);
      commit(MUTATIONS.SET_ALL_PLACED_OBJECTS, []);
      commit(MUTATIONS.SET_NEXT_OBJECT_ID, 1);
    },

    placeObject: ({ commit, state, dispatch }, { originRow, originCol }) => {
      if (!state.selectedObject || state.gameMode !== 'place') {
        return;
      }

      const objectShape = state.selectedObject.shape;
      const cellsToOccupy = [];
      let canPlace = true;

      for (const shapePart of objectShape) {
        const targetRow = originRow + shapePart.y;
        const targetCol = originCol + shapePart.x;

        if (targetRow < 0 || targetRow >= state.gridHeight || targetCol < 0 || targetCol >= state.gridWidth) {
          canPlace = false;
          alert('Объект выходит за границы поля');
          return;
        }

        if (state.grid[targetRow]?.[targetCol]?.isOccupied) {
          canPlace = false;
          alert('Невозможно разместить объект: клетки заняты');
          return;
        }
        cellsToOccupy.push({ row: targetRow, col: targetCol });
      }

      if (canPlace) {
        const newObjectId = state.nextObjectId++;
        const placedObjectData = {
          id: newObjectId,
          color: state.selectedObject.color,
          shape: state.selectedObject.shape,
          origin: { row: originRow, col: originCol }
        };

        commit(MUTATIONS.OCCUPY_CELLS, { cells: cellsToOccupy, objectData: placedObjectData });
        commit(MUTATIONS.ADD_PLACED_OBJECT, placedObjectData);
        commit(MUTATIONS.SET_SELECTED_OBJECT,  null); 
      }
    },

    deleteObject: ({ commit, state }, { row, col }) => {
      if (state.gameMode !== 'delete') {
        return;
      }

      const cellData = state.grid[row]?.[col];
      if (!cellData || !cellData.isOccupied || !cellData.occupyingObjectId) {
        return; 
      }

      const objectIdToDelete = cellData.occupyingObjectId;
      const objectIndex = state.allPlacedObjects.findIndex(obj => obj.id === objectIdToDelete);

      if (objectIndex === -1) {
        console.error(`Object with ID ${objectIdToDelete} not found in allPlacedObjects.`);
        return;
      }

      const objectToDelete = state.allPlacedObjects[objectIndex];
      commit(MUTATIONS.REMOVE_OBJECT_FROM_GRID, { objectToDelete });
      commit(MUTATIONS.REMOVE_PLACED_OBJECT, objectIndex);

      alert("Объект удалён");
    }
  }
});