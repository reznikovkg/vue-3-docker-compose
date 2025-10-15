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
    isCellOccupied: (state) => (row, col) => {
      if (row < 0 || row >= state.gridHeight || col < 0 || col >= state.gridWidth) {
        return true;
      }
      return state.grid[row][col] !== null;
    },
  },
  mutations: {
    [MUTATIONS.SET_GRID_WIDTH]: (state, width) => {
      state.gridWidth = width
    },
    [MUTATIONS.SET_GRID_HEIGHT]: (state, height) => {
      state.gridHeight = height
    },
    [MUTATIONS.SET_SELECTED_OBJECT]: (state, obj) => {
      state.selectedObject = obj
    },
    [MUTATIONS.SET_GAME_MODE]: (state, mode) => {
      state.gameMode = mode
    },
    [MUTATIONS.SET_GRID]: (state, grid) => {
      state.grid = grid
    },
    [MUTATIONS.SET_ALL_PLACED_OBJECTS]: (state, objects) => {
      state.allPlacedObjects = objects
    },
    [MUTATIONS.SET_NEXT_OBJECT_ID]: (state, id) => {
      state.nextObjectId = id
    },
    [MUTATIONS.ADD_PLACED_OBJECT]: (state, obj) => {
      state.allPlacedObjects.push(obj)
    },
    [MUTATIONS.REMOVE_PLACED_OBJECT]: (state, index) => {
      state.allPlacedObjects.splice(index, 1)
    },
    [MUTATIONS.OCCUPY_CELLS]: (state, { cells, objectData }) => {
      cells.forEach(({ row, col }) => {
        state.grid[row][col] = {
          objectId: objectData.id,
          color: objectData.color,
        };
      });
    },
    [MUTATIONS.REMOVE_OBJECT_FROM_GRID]: (state, { objectToDelete }) => {
      objectToDelete.shape.forEach(shapePart => {
        const targetRow = objectToDelete.origin.row + shapePart.y;
        const targetCol = objectToDelete.origin.col + shapePart.x;

        if (targetRow >= 0 && targetRow < state.gridHeight && targetCol >= 0 && targetCol < state.gridWidth) {
          if (state.grid[targetRow][targetCol]?.objectId === objectToDelete.id) {
            state.grid[targetRow][targetCol] = null;
          }
        }
      });
    },
  },
  actions: {
    setGridWidth: ({ commit }, width) => {
      commit(MUTATIONS.SET_GRID_WIDTH, width)
    },
    setGridHeight: ({ commit }, height) => {
      commit(MUTATIONS.SET_GRID_HEIGHT, height)
    },
    setSelectedObject: ({ commit }, obj) => {
      commit(MUTATIONS.SET_SELECTED_OBJECT, obj)
    },
    setGameMode: ({ commit }, mode) => {
      commit(MUTATIONS.SET_GAME_MODE, mode)
    },
    setGrid: ({ commit }, grid) => {
      commit(MUTATIONS.SET_GRID, grid)
    },
    setAllPlacedObjects: ({ commit }, objects) => {
      commit(MUTATIONS.SET_ALL_PLACED_OBJECTS, objects)
    },
    setNextObjectId: ({ commit }, id) => {
      commit(MUTATIONS.SET_NEXT_OBJECT_ID, id)
    },
    addPlacedObject: ({ commit }, obj) => {
      commit(MUTATIONS.ADD_PLACED_OBJECT, obj)
    },
    removePlacedObject: ({ commit }, index) => {
      commit(MUTATIONS.REMOVE_PLACED_OBJECT, index)
    },
    occupyCells: ({ commit }, { cells, objectData }) => {
      commit(MUTATIONS.OCCUPY_CELLS, { cells, objectData })
    },
    removeObjectFromGrid: ({ commit }, { objectToDelete }) => {
      commit(MUTATIONS.REMOVE_OBJECT_FROM_GRID, { objectToDelete })
    },

    initializeGrid: ({ commit, state }) => {
      const newGrid = Array(state.gridHeight)
        .fill(null)
        .map(() => Array(state.gridWidth).fill(null));
      commit(MUTATIONS.SET_GRID, newGrid);
      commit(MUTATIONS.SET_ALL_PLACED_OBJECTS, []);
      commit(MUTATIONS.SET_NEXT_OBJECT_ID, 1);
    },
    placeObject: ({ commit, state, dispatch }, { originRow, originCol }) => {
      if (!state.selectedObject || state.gameMode !== 'place') return;

      const objectShape = state.selectedObject.shape;
      const cellsToOccupy = [];
      let canPlace = true;

      for (const shapePart of objectShape) {
        const targetRow = originRow + shapePart.y;
        const targetCol = originCol + shapePart.x;

        if (targetRow < 0 || targetRow >= state.gridHeight || targetCol < 0 || targetCol >= state.gridWidth) {
          canPlace = false;
          alert('Объект выходит за границы поля');
          break;
        }

        if (state.grid[targetRow]?.[targetCol] !== null) {
          canPlace = false;
          alert('Невозможно разместить объект: клетки заняты');
          break;
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
        commit(MUTATIONS.SET_SELECTED_OBJECT, null);
      }

    },
    deleteObject: ({ commit, state }, { row, col }) => {
      if (state.gameMode !== 'delete') return;

      const cellData = state.grid[row]?.[col];
      if (!cellData || !cellData.objectId) return;

      const objectIdToDelete = cellData.objectId;
      const objectIndex = state.allPlacedObjects.findIndex(obj => obj.id === objectIdToDelete);

      if (objectIndex === -1) return;

      const objectToDelete = state.allPlacedObjects[objectIndex];
      commit(MUTATIONS.REMOVE_OBJECT_FROM_GRID, { objectToDelete });
      commit(MUTATIONS.REMOVE_PLACED_OBJECT, objectIndex);

      alert("Объект удалён");
    },
  }
});