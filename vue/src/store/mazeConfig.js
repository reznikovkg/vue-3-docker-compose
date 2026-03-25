// 0 - empty, 1 - tree, 2 - wall
export const MAZE_LAYOUT = [ 
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 2, 2, 1, 2, 1, 2, 1, 2, 1,
  1, 2, 1, 1, 2, 1, 1, 1, 1, 1,
  1, 1, 1, 2, 2, 1, 2, 2, 1, 2,
  2, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 1, 2, 2, 1, 2, 2, 1, 2, 1,
  2, 1, 2, 1, 1, 1, 1, 1, 2, 1,
  2, 1, 2, 1, 2, 1, 2, 2, 2, 1,
  2, 1, 1, 1, 1, 1, 1, 1, 2, 1,
  2, 1, 2, 1, 2, 2, 2, 1, 1, 1
]
export const MAZE_CONFIG = {
  rows: 10,
  cols: 10,
  layout: MAZE_LAYOUT
}
export const parseMazeToGrid = (mazeArray) => {
  if (!Array.isArray(mazeArray)) {
    return []
  }
  return mazeArray.map(value => ({ t: value }))
}
export const getInitialGrid = () => parseMazeToGrid(MAZE_LAYOUT)