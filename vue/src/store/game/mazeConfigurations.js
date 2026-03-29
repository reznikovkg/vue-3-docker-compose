import { CELL_TYPES } from './constants'

const createMazeConfiguration = ({
  id,
  name,
  description,
  rows,
  playerPosition,
}) => ({
  id,
  name,
  description,
  rows,
  playerPosition,
})

const createMazeRowsFromLayout = (layout) => {
  return layout.map((row) => {
    return row
      .split('')
      .map((cell) => (cell === '#' ? CELL_TYPES.WALL : CELL_TYPES.PATH))
  })
}

const mazeConfigurations = [
  createMazeConfiguration({
    id: 'training-ground',
    name: 'Training ground',
    description: 'Main testing Layout',
    rows: [
      [
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
      ],
    ],
    playerPosition: {
      row: 1,
      column: 1,
    },
  }),
  createMazeConfiguration({
    id: 'wide-corridor',
    name: 'Wide corridor',
    description: 'Alternative layout for testing',
    rows: [
      [
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
      ],
    ],
    playerPosition: {
      row: 1,
      column: 1,
    },
  }),
  createMazeConfiguration({
    id: 'labyrinth-16',
    name: 'Labyrinth 16x16',
    description: 'Large maze layout with branches and dead ends',
    rows: createMazeRowsFromLayout([
      '################',
      '#..............#',
      '##############.#',
      '#.......######.#',
      '#.#####.######.#',
      '#.#####.######.#',
      '#.#####.######.#',
      '#.#####.######.#',
      '#.#####.######.#',
      '#.#####.######.#',
      '#.#####.######.#',
      '#............#.#',
      '######.#######.#',
      '#......#.......#',
      '#...........#..#',
      '################',
    ]),
    playerPosition: {
      row: 1,
      column: 1,
    },
  }),
]

export default mazeConfigurations
