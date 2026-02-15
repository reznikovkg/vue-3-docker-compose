export const gameConfig = {
// Размеры игрового поля
field: {
    width: 2800,
    height: 2400
},

// Настройки игрока
player: {
    width: 50,
    height: 60,
    x: 100,
    groundY: 340,
    jumpForce: 15,
    gravity: 0.8,
    speed: 5
},

// Настройки урона
damage: {
    bullet: 1,
    collision: 1,
    enemy: 1
},

// Настройки врагов
enemies: {
    fighter: {
      width: 35,
      height: 55,
      speed: 4,
      health: 1,
      color: '#e74c3c'
    },
    shooter: {
      width: 20,
      height: 50,
      speed: 3,
      health: 1,
      shootInterval: 2000,
      color: '#9b59b6'
    }
},

// Настройки препятствий
obstacle: {
    width: 30,
    height: 40,
    speed: 5,
    color: '#34495e'
},

// Настройки монет
coin: {
    size: 20,
    speed: 5,
    points: 10,
    color: '#f39c12'
},

// Настройки пуль
bullet: {
    width: 15,
    height: 8,
    speed: 8,
    color: '#e67e22'
},

// Игровые параметры
game: {
    lives: 3,
    pointsPerDistance: 1,
    spawnInterval: 1500,
    backgroundSpeed: 3
}
};