export const COLOR_VALUES = ['blue', 'green', 'orange', 'pink', 'purple', 'red', 'yellow']

export const COLOR_NAMES = {
  blue: 'Синий',
  green: 'Зеленый',
  orange: 'Оранжевый',
  pink: 'Розовый',
  purple: 'Фиолетовый',
  red: 'Красный',
  yellow: 'Желтый'
}

export const COLOR_LIST = COLOR_VALUES.map((value) => ({
  value,
  label: COLOR_NAMES[value]
}))