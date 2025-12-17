import type { TackleItem, ShopItem } from '@/types'
import type { GroundbaitType, NetItem } from '@/types'

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
  },
  {
    id: 'groundbait_basic',
    name: 'Базовая прикормка',
    type: 'groundbait',
    price: 50,
    description: 'Простая прикормка для мелкой рыбы (3 заброса)',
    properties: {
      level: 1,
      radius: 15,
      uses: 3,
      fishAttraction: [
        { fishName: 'Карась', attractionMultiplier: 1.5 },
        { fishName: 'Плотва', attractionMultiplier: 1.3 },
        { fishName: 'Ротан', attractionMultiplier: 1.2 }
      ],
      color: '#8BC34A'
    }
  },
  {
    id: 'groundbait_advanced',
    name: 'Продвинутая прикормка',
    type: 'groundbait',
    price: 120,
    description: 'Прикормка для средней рыбы (3 заброса)',
    properties: {
      level: 1,
      radius: 18,
      uses: 3,
      fishAttraction: [
        { fishName: 'Окунь', attractionMultiplier: 1.6 },
        { fishName: 'Лещ', attractionMultiplier: 1.4 },
        { fishName: 'Голавль', attractionMultiplier: 1.3 },
        { fishName: 'Линь', attractionMultiplier: 1.2 }
      ],
      color: '#2196F3'
    }
  },
  {
    id: 'groundbait_pro',
    name: 'Профессиональная прикормка',
    type: 'groundbait',
    price: 250,
    description: 'Прикормка для крупной хищной рыбы (3 заброса)',
    properties: {
      level: 1,
      radius: 20,
      uses: 3,
      fishAttraction: [
        { fishName: 'Щука', attractionMultiplier: 1.7 },
        { fishName: 'Карп', attractionMultiplier: 1.5 },
        { fishName: 'Судак', attractionMultiplier: 1.4 },
        { fishName: 'Форель', attractionMultiplier: 1.3 },
        { fishName: 'Сом', attractionMultiplier: 1.2 }
      ],
      color: '#FF9800'
    }
  },
  {
    id: 'groundbait_special',
    name: 'Специальная морская прикормка',
    type: 'groundbait',
    price: 350,
    description: 'Прикормка для морской рыбы (3 заброса)',
    properties: {
      level: 1,
      radius: 22,
      uses: 3,
      fishAttraction: [
        { fishName: 'Камбала', attractionMultiplier: 1.6 },
        { fishName: 'Морской окунь', attractionMultiplier: 1.5 },
        { fishName: 'Скат', attractionMultiplier: 1.4 },
        { fishName: 'Кефаль', attractionMultiplier: 1.3 },
        { fishName: 'Барабулька', attractionMultiplier: 1.2 }
      ],
      color: '#00BCD4'
    }
  },
  {
    id: 'net_basic',
    name: 'Сачок новичка',
    type: 'net',
    price: 150,
    description: 'Базовый сачок для вылова небольшой рыбы',
    properties: {
      strengthBonus: 1,
      level: 1,
      maxWeight: 1,
      durability: 100,
      uses: 5
    }
  },
  {
    id: 'net_standard',
    name: 'Обычный сачок',
    type: 'net',
    price: 300,
    description: 'Надежный сачок для большинства рыб',
    properties: {
      strengthBonus: 2,
      level: 2,
      maxWeight: 3,
      durability: 100,
      uses: 10
    }
  },
  {
    id: 'net_professional',
    name: 'Профессиональный сачок',
    type: 'net',
    price: 500,
    description: 'Профессиональный сачок для крупной рыбы',
    properties: {
      strengthBonus: 3,
      level: 3,
      maxWeight: 5,
      durability: 100,
      uses: 15
    }
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

export const groundbaitTypes: GroundbaitType[] = [
  {
    id: 'groundbait_basic',
    name: 'Базовая прикормка',
    description: 'Простая прикормка для мелкой рыбы',
    level: 1,
    maxLevel: 5,
    price: 50,
    radius: 15,
    uses: 3,
    maxUses: 3,
    fishAttraction: [
      { fishName: 'Карась', attractionMultiplier: 1.5 },
      { fishName: 'Плотва', attractionMultiplier: 1.3 },
      { fishName: 'Ротан', attractionMultiplier: 1.2 }
    ],
    color: '#8BC34A',
    emoji: '🍚'
  },
  {
    id: 'groundbait_advanced',
    name: 'Продвинутая прикормка',
    description: 'Прикормка для средней рыбы',
    level: 1,
    maxLevel: 5,
    price: 120,
    radius: 18,
    uses: 3,
    maxUses: 3,
    fishAttraction: [
      { fishName: 'Окунь', attractionMultiplier: 1.6 },
      { fishName: 'Лещ', attractionMultiplier: 1.4 },
      { fishName: 'Голавль', attractionMultiplier: 1.3 },
      { fishName: 'Линь', attractionMultiplier: 1.2 }
    ],
    color: '#2196F3',
    emoji: '🥣'
  },
  {
    id: 'groundbait_pro',
    name: 'Профессиональная прикормка',
    description: 'Прикормка для крупной хищной рыбы',
    level: 1,
    maxLevel: 5,
    price: 250,
    radius: 20,
    uses: 3,
    maxUses: 3,
    fishAttraction: [
      { fishName: 'Щука', attractionMultiplier: 1.7 },
      { fishName: 'Карп', attractionMultiplier: 1.5 },
      { fishName: 'Судак', attractionMultiplier: 1.4 },
      { fishName: 'Форель', attractionMultiplier: 1.3 },
      { fishName: 'Сом', attractionMultiplier: 1.2 }
    ],
    color: '#FF9800',
    emoji: '🎯'
  },
  {
    id: 'groundbait_special',
    name: 'Специальная морская прикормка',
    description: 'Прикормка для морской рыбы',
    level: 1,
    maxLevel: 5,
    price: 350,
    radius: 22,
    uses: 3,
    maxUses: 3,
    fishAttraction: [
      { fishName: 'Камбала', attractionMultiplier: 1.6 },
      { fishName: 'Морской окунь', attractionMultiplier: 1.5 },
      { fishName: 'Скат', attractionMultiplier: 1.4 },
      { fishName: 'Кефаль', attractionMultiplier: 1.3 },
      { fishName: 'Барабулька', attractionMultiplier: 1.2 }
    ],
    color: '#00BCD4',
    emoji: '🌊'
  }
]

export const netItems: NetItem[] = [
  {
    id: 'net_small',
    name: 'Маленький сачок',
    type: 'net',
    level: 1,
    price: 150,
    strengthBonus: 0,
    description: 'Сачок для мелкой рыбы (до 3 кг)',
    maxWeight: 3,
    durability: 100,
    usesLeft: 10,
    isActive: false
  },
  {
    id: 'net_medium',
    name: 'Средний сачок',
    type: 'net',
    level: 2,
    price: 300,
    strengthBonus: 1,
    description: 'Сачок для средней рыбы (до 7 кг)',
    maxWeight: 7,
    durability: 100,
    usesLeft: 15,
    isActive: false
  },
  {
    id: 'net_large',
    name: 'Большой сачок',
    type: 'net',
    level: 3,
    price: 500,
    strengthBonus: 2,
    description: 'Сачок для крупной рыбы (до 15 кг)',
    maxWeight: 15,
    durability: 100,
    usesLeft: 20,
    isActive: false
  },
  {
    id: 'net_pro',
    name: 'Профессиональный сачок',
    type: 'net',
    level: 4,
    price: 800,
    strengthBonus: 3,
    description: 'Сачок для трофейной рыбы (до 30 кг)',
    maxWeight: 30,
    durability: 100,
    usesLeft: 30,
    isActive: false
  }
]