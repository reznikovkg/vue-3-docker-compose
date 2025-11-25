import type { TackleItem, ShopItem } from '@/types'

export const tackleItems: TackleItem[] = [
  {
    id: 'rod_basic',
    name: 'Простая удочка',
    type: 'rod',
    level: 1,
    price: 0,
    strengthBonus: 0,
    description: 'Базовая удочка для начинающих (не ломается)'
  },
  {
    id: 'rod_advanced',
    name: 'Продвинутая удочка',
    type: 'rod',
    level: 2,
    price: 200,
    strengthBonus: 2,
    description: 'Прочная удочка для опытных рыбаков'
  },
  {
    id: 'rod_pro',
    name: 'Профессиональная удочка',
    type: 'rod',
    level: 3,
    price: 500,
    strengthBonus: 5,
    description: 'Высококачественная удочка для профессионалов'
  },
  {
    id: 'reel_basic',
    name: 'Простая катушка',
    type: 'reel',
    level: 1,
    price: 30,
    strengthBonus: 0,
    description: 'Базовая катушка'
  },
  {
    id: 'reel_advanced',
    name: 'Продвинутая катушка',
    type: 'reel',
    level: 2,
    price: 150,
    strengthBonus: 1,
    description: 'Катушка с улучшенной системой'
  },
  {
    id: 'line_basic',
    name: 'Простая леска',
    type: 'line',
    level: 1,
    price: 20,
    strengthBonus: 0,
    description: 'Обычная леска'
  },
  {
    id: 'line_strong',
    name: 'Прочная леска',
    type: 'line',
    level: 2,
    price: 80,
    strengthBonus: 1,
    description: 'Прочная леска для крупной рыбы'
  },
  {
    id: 'bait_worm',
    name: 'Червяк',
    type: 'bait',
    level: 1,
    price: 5,
    strengthBonus: 1,
    description: 'Обычная наживка'
  },
  {
    id: 'bait_bread',
    name: 'Хлеб',
    type: 'bait',
    level: 1,
    price: 3,
    strengthBonus: 0,
    description: 'Простая наживка для мирной рыбы'
  },
  {
    id: 'bait_insect',
    name: 'Насекомое',
    type: 'bait',
    level: 2,
    price: 8,
    strengthBonus: 2,
    description: 'Эффективная наживка для хищной рыбы'
  }
]

export const shopItems: ShopItem[] = [
  {
    id: 'rod_basic',
    name: 'Простая удочка',
    type: 'tackle',
    price: 0,
    description: 'Базовая удочка для начинающих (всегда бесплатная)',
    properties: { strengthBonus: 0, level: 1 }
  },
  {
    id: 'rod_advanced',
    name: 'Продвинутая удочка',
    type: 'tackle',
    price: 200,
    description: 'Прочная удочка для опытных рыбаков',
    properties: { strengthBonus: 2, level: 2 }
  },
  {
    id: 'reel_basic',
    name: 'Простая катушка',
    type: 'tackle',
    price: 30,
    description: 'Базовая катушка',
    properties: { strengthBonus: 0, level: 1 }
  },
  {
    id: 'line_basic',
    name: 'Простая леска',
    type: 'tackle',
    price: 20,
    description: 'Обычная леска',
    properties: { strengthBonus: 0, level: 1 }
  },
  {
    id: 'bait_worm',
    name: 'Червяк',
    type: 'bait',
    price: 5,
    description: 'Обычная наживка',
    properties: { strengthBonus: 1 }
  },
  {
    id: 'bait_bread',
    name: 'Хлеб',
    type: 'bait',
    price: 3,
    description: 'Простая наживка для мирной рыбы',
    properties: { strengthBonus: 0 }
  },
  {
    id: 'bait_insect',
    name: 'Насекомое',
    type: 'bait',
    price: 8,
    description: 'Эффективная наживка для хищной рыбы',
    properties: { strengthBonus: 2 }
  }
]

export const tackleUpgrades: ShopItem[] = [
  {
    id: 'upgrade_rod_2',
    name: 'Улучшение удочки до уровня 2',
    type: 'tackle',
    price: 150,
    description: 'Увеличивает бонус силы удочки',
    properties: { strengthBonus: 2, level: 2 }
  },
  {
    id: 'upgrade_rod_3',
    name: 'Улучшение удочки до уровня 3',
    type: 'tackle',
    price: 300,
    description: 'Значительно увеличивает бонус силы удочки',
    properties: { strengthBonus: 5, level: 3 }
  },
  {
    id: 'upgrade_reel_2',
    name: 'Улучшение катушки до уровня 2',
    type: 'tackle',
    price: 120,
    description: 'Увеличивает бонус силы катушки',
    properties: { strengthBonus: 1, level: 2 }
  },
  {
    id: 'upgrade_line_2',
    name: 'Улучшение лески до уровня 2',
    type: 'tackle',
    price: 60,
    description: 'Увеличивает прочность лески',
    properties: { strengthBonus: 1, level: 2 }
  }
]