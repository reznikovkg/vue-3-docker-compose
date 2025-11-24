import type { Location } from '../types'

export const locations: Location[] = [
  {
    id: 1,
    name: 'Тихая Заводь',
    image: '/images/lake.jpg',
    description: 'Спокойное озеро с обильной растительностью',
    fish: [
      {
        name: 'Карась',
        emoji: '🐟',
        strength: 3,
        sizes: [
          { name: 'Мелкий', minWeight: 100, maxWeight: 300, rarity: 0.5 },
          { name: 'Средний', minWeight: 301, maxWeight: 600, rarity: 0.3 },
          { name: 'Крупный', minWeight: 601, maxWeight: 1000, rarity: 0.15 },
          { name: 'Трофейный', minWeight: 1001, maxWeight: 2000, rarity: 0.05, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 1.8,
          escapeChance: 2.0,
          value: 3.0
        }
      },
      {
        name: 'Окунь',
        emoji: '🐠',
        strength: 4,
        sizes: [
          { name: 'Мелкий', minWeight: 80, maxWeight: 200, rarity: 0.4 },
          { name: 'Средний', minWeight: 201, maxWeight: 500, rarity: 0.35 },
          { name: 'Крупный', minWeight: 501, maxWeight: 1200, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 1201, maxWeight: 2500, rarity: 0.05, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 2.0,
          escapeChance: 1.8,
          value: 3.5
        }
      },
      {
        name: 'Плотва',
        emoji: '🎣',
        strength: 2,
        sizes: [
          { name: 'Мелкий', minWeight: 50, maxWeight: 150, rarity: 0.6 },
          { name: 'Средний', minWeight: 151, maxWeight: 300, rarity: 0.3 },
          { name: 'Крупный', minWeight: 301, maxWeight: 600, rarity: 0.1 }
        ],
        sizeMultipliers: {
          strength: 1.5,
          escapeChance: 1.6,
          value: 2.5
        }
      },
      {
        name: 'Линь',
        emoji: '🐡',
        strength: 5,
        sizes: [
          { name: 'Мелкий', minWeight: 200, maxWeight: 500, rarity: 0.4 },
          { name: 'Средний', minWeight: 501, maxWeight: 1000, rarity: 0.3 },
          { name: 'Крупный', minWeight: 1001, maxWeight: 2500, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 2501, maxWeight: 5000, rarity: 0.1, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 2.2,
          escapeChance: 2.2,
          value: 4.0
        }
      }
    ],
    hotSpots: [
      {
        id: 'spot1_lake',
        name: 'Заросли кувшинок',
        type: 'fishing',
        multiplier: 1.5,
        description: 'Рыба любит прятаться в растительности',
        active: true,
        chance: 0.15,
        visualEffect: 'bubbles',
        color: '#4CAF50',
        effects: {
          strengthMultiplier: 1.2,
          biteTimeReduction: 0.3,
          valueMultiplier: 1.3
        }
      },
      {
        id: 'spot2_lake',
        name: 'Глубокий омут',
        type: 'bigFish',
        multiplier: 2.0,
        description: 'Здесь водятся крупные экземпляры',
        active: true,
        chance: 0.08,
        visualEffect: 'deep',
        color: '#2196F3',
        effects: {
          strengthMultiplier: 1.8,
          valueMultiplier: 1.8,
          rareFishChance: 0.1
        }
      },
      {
        id: 'spot3_lake',
        name: 'Тихая заводь',
        type: 'bonus',
        multiplier: 1.3,
        description: 'Спокойное место с частыми поклевками',
        active: true,
        chance: 0.12,
        visualEffect: 'calm',
        color: '#8BC34A',
        effects: {
          strengthMultiplier: 1.1,
          biteTimeReduction: 0.5,
          valueMultiplier: 1.2
        }
      }
    ]
  },
  {
    id: 2,
    name: 'Быстрая Река',
    image: '/images/river.jpg',
    description: 'Горная река с сильным течением',
    fish: [
      {
        name: 'Форель',
        emoji: '🐡',
        strength: 6,
        sizes: [
          { name: 'Мелкий', minWeight: 150, maxWeight: 400, rarity: 0.3 },
          { name: 'Средний', minWeight: 401, maxWeight: 800, rarity: 0.4 },
          { name: 'Крупный', minWeight: 801, maxWeight: 2000, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 2001, maxWeight: 4500, rarity: 0.1, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 2.5,
          escapeChance: 2.3,
          value: 5.0
        }
      },
      {
        name: 'Голавль',
        emoji: '🐟',
        strength: 5,
        sizes: [
          { name: 'Мелкий', minWeight: 100, maxWeight: 300, rarity: 0.4 },
          { name: 'Средний', minWeight: 301, maxWeight: 700, rarity: 0.35 },
          { name: 'Крупный', minWeight: 701, maxWeight: 1500, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 1501, maxWeight: 3000, rarity: 0.05, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 2.0,
          escapeChance: 2.0,
          value: 4.0
        }
      },
      {
        name: 'Хариус',
        emoji: '🐠',
        strength: 4,
        sizes: [
          { name: 'Мелкий', minWeight: 80, maxWeight: 250, rarity: 0.5 },
          { name: 'Средний', minWeight: 251, maxWeight: 500, rarity: 0.3 },
          { name: 'Крупный', minWeight: 501, maxWeight: 1000, rarity: 0.15 },
          { name: 'Трофейный', minWeight: 1001, maxWeight: 2000, rarity: 0.05, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 1.8,
          escapeChance: 1.8,
          value: 3.5
        }
      },
      {
        name: 'Ёрш',
        emoji: '🎣',
        strength: 3,
        sizes: [
          { name: 'Мелкий', minWeight: 30, maxWeight: 80, rarity: 0.7 },
          { name: 'Средний', minWeight: 81, maxWeight: 150, rarity: 0.25 },
          { name: 'Крупный', minWeight: 151, maxWeight: 250, rarity: 0.05 }
        ],
        sizeMultipliers: {
          strength: 1.4,
          escapeChance: 1.5,
          value: 2.0
        }
      }
    ],
    hotSpots: [
      {
        id: 'spot1_river',
        name: 'Стремительный перекат',
        type: 'fishing',
        multiplier: 1.8,
        description: 'Быстрое течение привлекает хищную рыбу',
        active: true,
        chance: 0.12,
        visualEffect: 'current',
        color: '#FF9800',
        effects: {
          strengthMultiplier: 1.4,
          biteTimeReduction: 0.4,
          valueMultiplier: 1.5
        }
      },
      {
        id: 'spot2_river',
        name: 'Заводь за валуном',
        type: 'rare',
        multiplier: 2.2,
        description: 'Укрытие для крупной форели',
        active: true,
        chance: 0.05,
        visualEffect: 'rare',
        color: '#9C27B0',
        effects: {
          strengthMultiplier: 1.6,
          valueMultiplier: 2.0,
          rareFishChance: 0.25
        }
      },
      {
        id: 'spot3_river',
        name: 'Пенный водоворот',
        type: 'bigFish',
        multiplier: 1.9,
        description: 'Кислородная вода привлекает крупную рыбу',
        active: true,
        chance: 0.07,
        visualEffect: 'whirlpool',
        color: '#00BCD4',
        effects: {
          strengthMultiplier: 1.7,
          valueMultiplier: 1.7,
          rareFishChance: 0.15
        }
      }
    ]
  },
  {
    id: 3,
    name: 'Глубокое Озеро',
    image: '/images/deep-lake.jpg',
    description: 'Глубокий водоем с крупной рыбой',
    fish: [
      {
        name: 'Щука',
        emoji: '🐊',
        strength: 8,
        sizes: [
          { name: 'Мелкий', minWeight: 500, maxWeight: 1500, rarity: 0.2 },
          { name: 'Средний', minWeight: 1501, maxWeight: 3500, rarity: 0.4 },
          { name: 'Крупный', minWeight: 3501, maxWeight: 7000, rarity: 0.3 },
          { name: 'Трофейный', minWeight: 7001, maxWeight: 15000, rarity: 0.1, emojiModifier: '👑' }
        ],
        sizeMultipliers: {
          strength: 3.0,
          escapeChance: 3.0,
          value: 8.0
        }
      },
      {
        name: 'Карп',
        emoji: '🐟',
        strength: 7,
        sizes: [
          { name: 'Мелкий', minWeight: 1000, maxWeight: 3000, rarity: 0.3 },
          { name: 'Средний', minWeight: 3001, maxWeight: 6000, rarity: 0.4 },
          { name: 'Крупный', minWeight: 6001, maxWeight: 12000, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 12001, maxWeight: 25000, rarity: 0.1, emojiModifier: '👑' }
        ],
        sizeMultipliers: {
          strength: 2.8,
          escapeChance: 2.5,
          value: 7.0
        }
      },
      {
        name: 'Лещ',
        emoji: '🐠',
        strength: 5,
        sizes: [
          { name: 'Мелкий', minWeight: 300, maxWeight: 800, rarity: 0.4 },
          { name: 'Средний', minWeight: 801, maxWeight: 1500, rarity: 0.35 },
          { name: 'Крупный', minWeight: 1501, maxWeight: 3000, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 3001, maxWeight: 6000, rarity: 0.05, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 2.2,
          escapeChance: 2.0,
          value: 4.5
        }
      },
      {
        name: 'Сом',
        emoji: '🐡',
        strength: 9,
        sizes: [
          { name: 'Мелкий', minWeight: 1000, maxWeight: 5000, rarity: 0.2 },
          { name: 'Средний', minWeight: 5001, maxWeight: 15000, rarity: 0.3 },
          { name: 'Крупный', minWeight: 15001, maxWeight: 30000, rarity: 0.3 },
          { name: 'Трофейный', minWeight: 30001, maxWeight: 80000, rarity: 0.2, emojiModifier: '👑' }
        ],
        sizeMultipliers: {
          strength: 3.5,
          escapeChance: 3.5,
          value: 12.0
        }
      }
    ],
    hotSpots: [
      {
        id: 'spot1_deep',
        name: 'Подводная бровка',
        type: 'bigFish',
        multiplier: 2.5,
        description: 'Излюбленное место охоты щуки',
        active: true,
        chance: 0.06,
        visualEffect: 'deep',
        color: '#3F51B5',
        effects: {
          strengthMultiplier: 2.0,
          valueMultiplier: 2.2,
          rareFishChance: 0.2
        }
      },
      {
        id: 'spot2_deep',
        name: 'Зона термоклина',
        type: 'rare',
        multiplier: 2.8,
        description: 'Граница температур привлекает разную рыбу',
        active: true,
        chance: 0.04,
        visualEffect: 'thermal',
        color: '#E91E63',
        effects: {
          strengthMultiplier: 1.8,
          valueMultiplier: 2.5,
          rareFishChance: 0.35
        }
      },
      {
        id: 'spot3_deep',
        name: 'Затопленный лес',
        type: 'fishing',
        multiplier: 1.7,
        description: 'Естественные укрытия для крупной рыбы',
        active: true,
        chance: 0.10,
        visualEffect: 'forest',
        color: '#795548',
        effects: {
          strengthMultiplier: 1.5,
          valueMultiplier: 1.6,
          rareFishChance: 0.12
        }
      }
    ]
  },
  {
    id: 4,
    name: 'Лесной Пруд',
    image: '/images/pond.jpg',
    description: 'Небольшой заросший пруд в лесу',
    fish: [
      {
        name: 'Линь',
        emoji: '🐡',
        strength: 4,
        sizes: [
          { name: 'Мелкий', minWeight: 150, maxWeight: 400, rarity: 0.5 },
          { name: 'Средний', minWeight: 401, maxWeight: 800, rarity: 0.3 },
          { name: 'Крупный', minWeight: 801, maxWeight: 1500, rarity: 0.15 },
          { name: 'Трофейный', minWeight: 1501, maxWeight: 3000, rarity: 0.05, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 1.8,
          escapeChance: 1.8,
          value: 3.5
        }
      },
      {
        name: 'Карась',
        emoji: '🐟',
        strength: 3,
        sizes: [
          { name: 'Мелкий', minWeight: 80, maxWeight: 200, rarity: 0.6 },
          { name: 'Средний', minWeight: 201, maxWeight: 400, rarity: 0.3 },
          { name: 'Крупный', minWeight: 401, maxWeight: 800, rarity: 0.1 }
        ],
        sizeMultipliers: {
          strength: 1.6,
          escapeChance: 1.7,
          value: 2.8
        }
      },
      {
        name: 'Ротан',
        emoji: '🎣',
        strength: 2,
        sizes: [
          { name: 'Мелкий', minWeight: 30, maxWeight: 100, rarity: 0.7 },
          { name: 'Средний', minWeight: 101, maxWeight: 200, rarity: 0.25 },
          { name: 'Крупный', minWeight: 201, maxWeight: 400, rarity: 0.05 }
        ],
        sizeMultipliers: {
          strength: 1.3,
          escapeChance: 1.4,
          value: 2.2
        }
      },
      {
        name: 'Верховка',
        emoji: '🐠',
        strength: 1,
        sizes: [
          { name: 'Мелкий', minWeight: 5, maxWeight: 15, rarity: 0.8 },
          { name: 'Средний', minWeight: 16, maxWeight: 30, rarity: 0.2 }
        ],
        sizeMultipliers: {
          strength: 1.2,
          escapeChance: 1.3,
          value: 1.8
        }
      }
    ],
    hotSpots: [
      {
        id: 'spot1_pond',
        name: 'Тенистый залив',
        type: 'fishing',
        multiplier: 1.4,
        description: 'Прохладная вода под сенью деревьев',
        active: true,
        chance: 0.18,
        visualEffect: 'shadow',
        color: '#607D8B',
        effects: {
          strengthMultiplier: 1.1,
          biteTimeReduction: 0.6,
          valueMultiplier: 1.3
        }
      },
      {
        id: 'spot2_pond',
        name: 'Заросли тростника',
        type: 'bonus',
        multiplier: 1.6,
        description: 'Идеальное укрытие для линя',
        active: true,
        chance: 0.11,
        visualEffect: 'reeds',
        color: '#4CAF50',
        effects: {
          strengthMultiplier: 1.3,
          valueMultiplier: 1.5,
          rareFishChance: 0.08
        }
      },
      {
        id: 'spot3_pond',
        name: 'Родниковая воронка',
        type: 'rare',
        multiplier: 2.1,
        description: 'Источник свежей воды привлекает рыбу',
        active: true,
        chance: 0.05,
        visualEffect: 'spring',
        color: '#00BCD4',
        effects: {
          strengthMultiplier: 1.4,
          valueMultiplier: 1.9,
          rareFishChance: 0.18
        }
      }
    ]
  },
  {
    id: 5,
    name: 'Водохранилище',
    image: '/images/reservoir.jpg',
    description: 'Большой искусственный водоем',
    fish: [
      {
        name: 'Судак',
        emoji: '🐊',
        strength: 7,
        sizes: [
          { name: 'Мелкий', minWeight: 300, maxWeight: 800, rarity: 0.3 },
          { name: 'Средний', minWeight: 801, maxWeight: 2000, rarity: 0.4 },
          { name: 'Крупный', minWeight: 2001, maxWeight: 5000, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 5001, maxWeight: 12000, rarity: 0.1, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 2.5,
          escapeChance: 2.4,
          value: 6.0
        }
      },
      {
        name: 'Лещ',
        emoji: '🐟',
        strength: 5,
        sizes: [
          { name: 'Мелкий', minWeight: 400, maxWeight: 1000, rarity: 0.4 },
          { name: 'Средний', minWeight: 1001, maxWeight: 2000, rarity: 0.35 },
          { name: 'Крупный', minWeight: 2001, maxWeight: 4000, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 4001, maxWeight: 8000, rarity: 0.05, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 2.0,
          escapeChance: 1.9,
          value: 4.0
        }
      },
      {
        name: 'Плотва',
        emoji: '🐠',
        strength: 3,
        sizes: [
          { name: 'Мелкий', minWeight: 80, maxWeight: 200, rarity: 0.5 },
          { name: 'Средний', minWeight: 201, maxWeight: 400, rarity: 0.35 },
          { name: 'Крупный', minWeight: 401, maxWeight: 700, rarity: 0.15 }
        ],
        sizeMultipliers: {
          strength: 1.5,
          escapeChance: 1.6,
          value: 2.5
        }
      },
      {
        name: 'Язь',
        emoji: '🐡',
        strength: 6,
        sizes: [
          { name: 'Мелкий', minWeight: 200, maxWeight: 600, rarity: 0.4 },
          { name: 'Средний', minWeight: 601, maxWeight: 1500, rarity: 0.35 },
          { name: 'Крупный', minWeight: 1501, maxWeight: 3000, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 3001, maxWeight: 6000, rarity: 0.05, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 2.2,
          escapeChance: 2.1,
          value: 4.5
        }
      }
    ],
    hotSpots: [
      {
        id: 'spot1_reservoir',
        name: 'Старое русло реки',
        type: 'bigFish',
        multiplier: 2.3,
        description: 'Глубокий канал - дом для судака',
        active: true,
        chance: 0.07,
        visualEffect: 'riverbed',
        color: '#795548',
        effects: {
          strengthMultiplier: 1.9,
          valueMultiplier: 2.1,
          rareFishChance: 0.22
        }
      },
      {
        id: 'spot2_reservoir',
        name: 'Плотина',
        type: 'fishing',
        multiplier: 1.9,
        description: 'Обогащенная кислородом вода',
        active: true,
        chance: 0.09,
        visualEffect: 'dam',
        color: '#9E9E9E',
        effects: {
          strengthMultiplier: 1.6,
          biteTimeReduction: 0.4,
          valueMultiplier: 1.7
        }
      },
      {
        id: 'spot3_reservoir',
        name: 'Залив с коряжником',
        type: 'rare',
        multiplier: 2.4,
        description: 'Идеальные условия для хищника',
        active: true,
        chance: 0.04,
        visualEffect: 'snags',
        color: '#8D6E63',
        effects: {
          strengthMultiplier: 2.1,
          valueMultiplier: 2.3,
          rareFishChance: 0.3
        }
      },
      {
        id: 'spot4_reservoir',
        name: 'Мелководный залив',
        type: 'bonus',
        multiplier: 1.5,
        description: 'Нерестилище для белой рыбы',
        active: true,
        chance: 0.14,
        visualEffect: 'shallow',
        color: '#FFC107',
        effects: {
          strengthMultiplier: 1.2,
          biteTimeReduction: 0.7,
          valueMultiplier: 1.4
        }
      }
    ]
  },
  {
    id: 6,
    name: 'Морской Залив',
    image: '/images/sea-bay.jpg',
    description: 'Соленые воды морского залива',
    fish: [
      {
        name: 'Камбала',
        emoji: '🐠',
        strength: 6,
        sizes: [
          { name: 'Мелкий', minWeight: 200, maxWeight: 600, rarity: 0.4 },
          { name: 'Средний', minWeight: 601, maxWeight: 1500, rarity: 0.35 },
          { name: 'Крупный', minWeight: 1501, maxWeight: 3000, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 3001, maxWeight: 6000, rarity: 0.05, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 2.0,
          escapeChance: 1.9,
          value: 4.0
        }
      },
      {
        name: 'Кефаль',
        emoji: '🐟',
        strength: 5,
        sizes: [
          { name: 'Мелкий', minWeight: 150, maxWeight: 400, rarity: 0.5 },
          { name: 'Средний', minWeight: 401, maxWeight: 800, rarity: 0.3 },
          { name: 'Крупный', minWeight: 801, maxWeight: 1500, rarity: 0.15 },
          { name: 'Трофейный', minWeight: 1501, maxWeight: 3000, rarity: 0.05, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 1.8,
          escapeChance: 1.8,
          value: 3.5
        }
      },
      {
        name: 'Барабулька',
        emoji: '🎣',
        strength: 4,
        sizes: [
          { name: 'Мелкий', minWeight: 50, maxWeight: 150, rarity: 0.6 },
          { name: 'Средний', minWeight: 151, maxWeight: 300, rarity: 0.3 },
          { name: 'Крупный', minWeight: 301, maxWeight: 500, rarity: 0.1 }
        ],
        sizeMultipliers: {
          strength: 1.5,
          escapeChance: 1.6,
          value: 2.8
        }
      },
      {
        name: 'Морской окунь',
        emoji: '🐡',
        strength: 7,
        sizes: [
          { name: 'Мелкий', minWeight: 300, maxWeight: 800, rarity: 0.3 },
          { name: 'Средний', minWeight: 801, maxWeight: 2000, rarity: 0.4 },
          { name: 'Крупный', minWeight: 2001, maxWeight: 4000, rarity: 0.2 },
          { name: 'Трофейный', minWeight: 4001, maxWeight: 8000, rarity: 0.1, emojiModifier: '⭐' }
        ],
        sizeMultipliers: {
          strength: 2.3,
          escapeChance: 2.2,
          value: 5.0
        }
      },
      {
        name: 'Скат',
        emoji: '🐠',
        strength: 8,
        sizes: [
          { name: 'Мелкий', minWeight: 1000, maxWeight: 3000, rarity: 0.2 },
          { name: 'Средний', minWeight: 3001, maxWeight: 8000, rarity: 0.4 },
          { name: 'Крупный', minWeight: 8001, maxWeight: 15000, rarity: 0.3 },
          { name: 'Трофейный', minWeight: 15001, maxWeight: 30000, rarity: 0.1, emojiModifier: '👑' }
        ],
        sizeMultipliers: {
          strength: 2.8,
          escapeChance: 2.7,
          value: 7.0
        }
      }
    ],
    hotSpots: [
      {
        id: 'spot1_sea',
        name: 'Каменная гряда',
        type: 'bigFish',
        multiplier: 2.6,
        description: 'Укрытие для морских хищников',
        active: true,
        chance: 0.05,
        visualEffect: 'rocks',
        color: '#607D8B',
        effects: {
          strengthMultiplier: 2.2,
          valueMultiplier: 2.4,
          rareFishChance: 0.25
        }
      },
      {
        id: 'spot2_sea',
        name: 'Песчаная отмель',
        type: 'fishing',
        multiplier: 1.8,
        description: 'Место кормежки донной рыбы',
        active: true,
        chance: 0.11,
        visualEffect: 'sand',
        color: '#FFC107',
        effects: {
          strengthMultiplier: 1.5,
          biteTimeReduction: 0.5,
          valueMultiplier: 1.6
        }
      },
      {
        id: 'spot3_sea',
        name: 'Устье реки',
        type: 'rare',
        multiplier: 2.7,
        description: 'Смешение соленой и пресной воды',
        active: true,
        chance: 0.03,
        visualEffect: 'estuary',
        color: '#4CAF50',
        effects: {
          strengthMultiplier: 2.0,
          valueMultiplier: 2.6,
          rareFishChance: 0.4
        }
      },
      {
        id: 'spot4_sea',
        name: 'Подводная скала',
        type: 'bigFish',
        multiplier: 2.9,
        description: 'Пристанище крупной рыбы',
        active: true,
        chance: 0.02,
        visualEffect: 'cliff',
        color: '#3F51B5',
        effects: {
          strengthMultiplier: 2.5,
          valueMultiplier: 2.8,
          rareFishChance: 0.35
        }
      },
      {
        id: 'spot5_sea',
        name: 'Приливная лужа',
        type: 'bonus',
        multiplier: 1.7,
        description: 'Богатая микроорганизмами вода',
        active: true,
        chance: 0.13,
        visualEffect: 'tidal',
        color: '#00BCD4',
        effects: {
          strengthMultiplier: 1.4,
          biteTimeReduction: 0.8,
          valueMultiplier: 1.5
        }
      }
    ]
  },
]
