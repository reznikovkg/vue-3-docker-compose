export const SLOT_RECIPES = [
  {
    pattern: [
      [1, 2, null],
      [3, 4, null],
      [null, null, null]
    ],
    result: 13
  },
  {
    pattern: [
      [4, null, null],
      [2, null, null],
      [3, null, null]
    ],
    result: 8
  },
  {
    pattern: [
      [1, null, 4],
      [null, null, null],
      [null, null, null]
    ],
    result: 9
  },
  {
    pattern: [
      [1, null, null],
      [null, 2, null],
      [null, null, 3]
    ],
    result: 10
  },
  {
    pattern: [
      [2, null, null],
      [null, 4, null],
      [null, null, 1]
    ],
    result: 11
  },
  {
    pattern: [
      [3, 2, null],
      [null, 1, null],
      [null, null, null]
    ],
    result: 12
  }
]

export const TABLE_RECIPES = [
  { ingredients: { 1:1, 2:1 }, result: 5 },
  { ingredients: { 3:1, 2:1 }, result: 6 },
  { ingredients: { 1:1, 3:1 }, result: 7 },
  { ingredients: { 7:1, 10:1 }, result: 14 }
]