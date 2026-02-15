<template>
<div class="app">
    <div class="app__game-area">
      <GameField 
        ref="gameFieldRef"
        :config="gameConfig"
        :is-playing="gameState.isPlaying"
      />
    </div>
    
    <div class="app__control-area">
      <GameControls
        :is-playing="gameState.isPlaying"
        :game-over="gameState.gameOver"
        :lives="gameState.lives"
        :max-lives="gameConfig.game.lives"
        :score="gameState.score"
        :distance="gameState.distance"
        :can-jump="!gameField.player.isJumping"
        :can-shoot="canShoot"
        @start="startGame"
        @jump="jump"
        @shoot="shoot"
      />
    </div>
</div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import GameField from './components/Game/GameField.vue';
import GameControls from './components/Game/GameControls.vue';
import { gameConfig } from './config/gameConfig.js';
import { useGameLoop } from './composables/useGameLoop.js';

const gameFieldRef = ref(null);
const lastShootTime = ref(0);
const spawnTimer = ref(0);
const distanceCounter = ref(0);
let entityIdCounter = 0;

const gameState = reactive({
isPlaying: false,
gameOver: false,
lives: gameConfig.game.lives,
score: 0,
distance: 0
});

const gameField = computed(() => gameFieldRef.value || {
backgroundPosition: 0,
player: { x: 0, y: 0, velocityY: 0, isJumping: false },
enemies: [],
obstacles: [],
coins: [],
bullets: []
});

const canShoot = ref(true);

// Игровой цикл
const { start: startLoop, stop: stopLoop } = useGameLoop((deltaTime) => {
updateGame(deltaTime);
});

function startGame() {
// Сброс состояния
gameState.isPlaying = true;
gameState.gameOver = false;
gameState.lives = gameConfig.game.lives;
gameState.score = 0;
gameState.distance = 0;

if (gameFieldRef.value) {
    gameField.value.backgroundPosition = 0;
    gameField.value.player.y = 0;
    gameField.value.player.velocityY = 0;
    gameField.value.player.isJumping = false;
    gameField.value.enemies = [];
    gameField.value.obstacles = [];
    gameField.value.coins = [];
    gameField.value.bullets = [];
}

spawnTimer.value = 0;
distanceCounter.value = 0;

startLoop();
}

function endGame() {
gameState.isPlaying = false;
gameState.gameOver = true;
stopLoop();
}

function jump() {
if (!gameField.value.player.isJumping && gameState.isPlaying) {
    gameField.value.player.isJumping = true;
    gameField.value.player.velocityY = gameConfig.player.jumpForce;
}
}

function shoot() {
if (!canShoot.value || !gameState.isPlaying) return;

canShoot.value = false;

gameField.value.bullets.push({
    id: `bullet-player-${entityIdCounter++}`,
    x: gameField.value.player.x + gameConfig.player.width,
    y: gameField.value.player.y + gameConfig.player.height / 2,
    width: gameConfig.bullet.width,
    height: gameConfig.bullet.height,
    isPlayer: true
});

setTimeout(() => {
  canShoot.value = true;
}, 500)
}

function updateGame(deltaTime) {
const dt = Math.min(deltaTime / 16, 2); // Нормализация до ~60fps

// Обновление фона
gameField.value.backgroundPosition -= gameConfig.game.backgroundSpeed * dt;

// Обновление счетчика дистанции
distanceCounter.value += gameConfig.game.backgroundSpeed * dt;
if (distanceCounter.value >= 10) {
    gameState.distance += 1;
    gameState.score += gameConfig.game.pointsPerDistance;
    distanceCounter.value = 0;
}

// Обновление игрока
updatePlayer(dt);

// Спавн объектов
spawnTimer.value += deltaTime;
if (spawnTimer.value >= gameConfig.game.spawnInterval) {
    spawnEntity();
    spawnTimer.value = 0;
}

// Обновление врагов
updateEnemies(dt);

// Обновление препятствий
updateObstacles(dt);

// Обновление монет
updateCoins(dt);

// Обновление пуль
updateBullets(dt);

// Проверка столкновений
checkCollisions();
}

function updatePlayer(dt) {
const player = gameField.value.player;

if (player.isJumping) {
    player.velocityY -= gameConfig.player.gravity * dt;
    player.y += player.velocityY * dt;
    
    if (player.y <= 0) {
      player.y = 0;
      player.velocityY = 0;
      player.isJumping = false;
    }
}
}

function spawnEntity() {
const rand = Math.random();
const fieldWidth = gameConfig.field.width;

if (rand < 0.3) {
    // Спавн препятствия
    gameField.value.obstacles.push({
      id: `obstacle-${entityIdCounter++}`,
      x: fieldWidth,
      y: 0,
      width: gameConfig.obstacle.width,
      height: gameConfig.obstacle.height,
      color: gameConfig.obstacle.color
    });
} else if (rand < 0.6) {
    // Спавн врага
    const enemyType = Math.random() < 0.5 ? 'fighter' : 'shooter';
    const enemyConfig = gameConfig.enemies[enemyType];
    
    const enemy = {
      id: `enemy-${entityIdCounter++}`,
      x: fieldWidth,
      y: 0,
      width: enemyConfig.width,
      height: enemyConfig.height,
      type: enemyType,
      color: enemyConfig.color,
      speed: enemyConfig.speed,
      health: enemyConfig.health,
      lastShoot: Date.now()
    };
    
    gameField.value.enemies.push(enemy);
} else {
    // Спавн монеты
    const isHigh = Math.random() < 0.4;
    const coinY = isHigh ? 100 : 20;
    
    gameField.value.coins.push({
      id: `coin-${entityIdCounter++}`,
      x: fieldWidth,
      y: coinY,
      size: gameConfig.coin.size
    });
}
}

function updateEnemies(dt) {
gameField.value.enemies = gameField.value.enemies.filter(enemy => {
    enemy.x -= enemy.speed * dt;
    
    // Стрельба врага
    if (enemy.type === 'shooter') {
      const timeSinceLastShoot = Date.now() - enemy.lastShoot;
      if (timeSinceLastShoot >= gameConfig.enemies.shooter.shootInterval) {
        enemy.lastShoot = Date.now();
        
        gameField.value.bullets.push({
          id: `bullet-enemy-${entityIdCounter++}`,
          x: enemy.x,
          y: enemy.y + enemy.height / 2,
          width: gameConfig.bullet.width,
          height: gameConfig.bullet.height,
          isPlayer: false
        });
      }
    }
    
    return enemy.x + enemy.width > 0;
});
}

function updateObstacles(dt) {
gameField.value.obstacles = gameField.value.obstacles.filter(obstacle => {
    obstacle.x -= gameConfig.obstacle.speed * dt;
    return obstacle.x + obstacle.width > 0;
});
}

function updateCoins(dt) {
gameField.value.coins = gameField.value.coins.filter(coin => {
    coin.x -= gameConfig.coin.speed * dt;
    return coin.x + coin.size > 0;
});
}

function updateBullets(dt) {
gameField.value.bullets = gameField.value.bullets.filter(bullet => {
    if (bullet.isPlayer) {
      bullet.x += gameConfig.bullet.speed * dt;
      return bullet.x < gameConfig.field.width;
    } else {
      bullet.x -= gameConfig.bullet.speed * dt;
      return bullet.x + bullet.width > 0;
    }
});
}

function checkCollisions() {
const player = gameField.value.player;
const playerBounds = {
    x: player.x,
    y: player.y,
    width: gameConfig.player.width,
    height: gameConfig.player.height
};

// Проверка столкновения с монетами
gameField.value.coins = gameField.value.coins.filter(coin => {
    if (isColliding(playerBounds, {
      x: coin.x,
      y: coin.y,
      width: coin.size,
      height: coin.size
    })) {
      gameState.score += gameConfig.coin.points;
      return false;
    }
    return true;
});

// Проверка столкновения с препятствиями
for (const obstacle of gameField.value.obstacles) {
    if (isColliding(playerBounds, {
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height
    })) {
      takeDamage(gameConfig.damage.collision);
      break;
    }
}

// Проверка столкновения с врагами
for (const enemy of gameField.value.enemies) {
    if (isColliding(playerBounds, {
      x: enemy.x,
      y: enemy.y,
      width: enemy.width,
      height: enemy.height
    })) {
      takeDamage(gameConfig.damage.enemy);
      gameField.value.enemies = gameField.value.enemies.filter(e => e.id !== enemy.id);
      break;
    }
}

// Проверка столкновения с пулями врагов
for (const bullet of gameField.value.bullets) {
    if (!bullet.isPlayer && isColliding(playerBounds, {
      x: bullet.x,
      y: bullet.y,
      width: bullet.width,
      height: bullet.height
    })) {
      takeDamage(gameConfig.damage.bullet);
      gameField.value.bullets = gameField.value.bullets.filter(b => b.id !== bullet.id);
      break;
    }
}

// Проверка попадания пуль игрока по врагам
for (const bullet of gameField.value.bullets) {
    if (bullet.isPlayer) {
      for (const enemy of gameField.value.enemies) {
        if (isColliding(
          { x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height },
          { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height }
        )) {
          enemy.health -= 1;
          gameField.value.bullets = gameField.value.bullets.filter(b => b.id !== bullet.id);
          
          if (enemy.health <= 0) {
            gameState.score += 20;
            gameField.value.enemies = gameField.value.enemies.filter(e => e.id !== enemy.id);
          }
          break;
        }
      }
    }
}
}

function isColliding(rect1, rect2) {
return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

function takeDamage(damage) {
gameState.lives -= damage;

if (gameState.lives <= 0) {
    gameState.lives = 0;
    endGame();
}
}

import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
})

function handleKeyPress(e) {
  if(!gameState.isPlaying && e.code === 'Enter'){
    startGame();
  }

  if(!gameState.isPlaying) return;

  if(e.code === 'Space') {
    e.preventDefault();
    jump();
  } else if (e.code === 'KeyC') {
    e.preventDefault();
    shoot();
  }
}
</script>

<style lang="less">
* {
margin: 0 !important;
padding: 0 !important;
box-sizing: border-box;
}

body {
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
overflow: hidden;
}

.app {
width: 100vw;
height: 100vh;
display: flex;
flex-direction: column;
position: fixed;
top: 0;
left: 0;

&__game-area {
    height: 66.666%;
    position: relative;
}

&__control-area {
    height: 33.333%;
    position: relative;
}
}
</style>