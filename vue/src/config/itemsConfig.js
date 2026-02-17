export const itemsConfig = [
{ level: 1, name: 'Камень', emoji: '🗻', color: '#95a5a6', points: 10 },
{ level: 2, name: 'Дерево', emoji: '🌳', color: '#8b4513', points: 25 },
{ level: 3, name: 'Железо', emoji: '⚙️', color: '#7f8c8d', points: 50 },
{ level: 4, name: 'Золото', emoji: '🏆', color: '#f39c12', points: 100 },
{ level: 5, name: 'Алмаз', emoji: '💎', color: '#3498db', points: 200 },
{ level: 6, name: 'Рубин', emoji: '💍', color: '#e74c3c', points: 400 },
{ level: 7, name: 'Изумруд', emoji: '🌟', color: '#2ecc71', points: 800 },
{ level: 8, name: 'Корона', emoji: '👑', color: '#9b59b6', points: 1600 }
];

export const GRID_SIZE = 8;
export const INITIAL_ITEMS_COUNT = 5;
export const MAX_LEVEL = itemsConfig.length;

export function getItemByLevel(level) {
return itemsConfig.find(item => item.level === level) || itemsConfig[0];
}

export function getRandomLevel(maxLevel = 3) {
return Math.floor(Math.random() * maxLevel) + 1;
}