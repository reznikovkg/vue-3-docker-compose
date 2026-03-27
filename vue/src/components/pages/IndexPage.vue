<!-- components/pages/IndexPage.vue -->
<template>
  <div class="game" ref="game" @mousemove="(e) => comMouseMove(e)">
    <div class="game__hud">
      <div class="game__time">Время: {{ trueTime }}</div>
      <div class="game__killed">Убито: {{ enemiesKilled }}</div>
      <div class="game__coins">Монеты: {{ coins }}</div>
      <button class="game__pause-button" @click="() => doPause()">
        {{ isPaused ? 'Продолжить' : 'Пауза' }}</button>
    </div>

    <div class="game__world">
      <div
        class="game__player"
        :class="`game__player--${player.direction}`"
        :style="{
          left: player.x + 'px',
          top: player.y + 'px'
        }"
      ></div>

      <div
        v-for="(bullet, index) in bullets"
        :key="index"
        class="game__bullet"
        :style="{
          left: bullet.x + 'px',
          top: bullet.y + 'px'
        }"
      ></div>

      <div v-for="(bullet,index) in enemyBullets"
      :key="'eb-'+ index"
      class="game__enemy-bullet"
      :style="{
        left: bullet.x + 'px',
        top: bullet.y + 'px'
      }"
      ></div>

      <div
        v-for="(enemy, index) in enemies"
        :key="index"
        class="game__enemy"
        :class="[`game__enemy--${enemy.type}`,
         `game__enemy--${enemy.type}-${enemy.direction}`]"
        :style="{
          left: enemy.x + 'px',
          top: enemy.y + 'px'
        }"
      ></div>
    </div>
    
    <div v-if="!gameActive" class="game__game-over">
      <h2 class="game__game-over-title">Игра окончена!</h2>
      <p class="game__game-over-time">Время: {{ trueTime }}</p>
      <p class="game__game-over-killed">Убито врагов: {{ enemiesKilled }}</p>
      <button class="game__game-over-button" @click="() => restartGame()">Играть снова</button>
    </div>

    <div v-if="isPaused && gameActive" class="game__pause">
      <h2 class="game__pause-title">Прокачка</h2>
      <div class="game__stats">
        <div>Здоровье: {{ playerStats.health }}/{{ playerStats.maxHealth }}</div>
        <div>Мана: {{ playerStats.mana }}/{{ playerStats.maxMana }}</div>
        <div>Урон: {{ playerStats.damage }}</div>
        <div>Монеты: {{ coins }}</div>
      </div>
      <div class="game__shop">
        <div class="game__shop-item">
          <button @click="() => buyHealthPotion()" :disabled="coins<10">Купить хил</button>
        </div>
        <div class="game__shop-item">
          <button @click="() => buyManaPotion()" :disabled="coins<10">Купить хил маны</button>
        </div>
        <div class="game__shop-item">
          <button @click="() => upgradeDamage()" :disabled="coins<10">+1 к урону</button>
        </div>
        <div class="game__shop-item">
          <button @click="() => upgradeMaxHealth()" :disabled="coins<10">+20 к максимальному здоровью</button>
        </div>
        <div class="game__shop-item">
          <button @click="() => upgradeMaxMana()" :disabled="coins<10">+20 к максимальноq мане</button>
        </div>
        <div class="game__shop-item">
          <button @click="() => useHealthPotion()" :disabled="playerStats.healthPotionCount === 0 ||
          playerStats.health >= playerStats.maxHealth">хил (+30)</button>
        </div>
        <div class="game__shop-item">
          <button @click="() => useManaPotion()" :disabled="playerStats.manaPotionCount === 0 ||
          playerStats.mana >= playerStats.maxMana">хил маны (+20)</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'GamePage',
  data() {
    return {
      animationFrame: null,
      loop: null,
      lastShotTime: 0,
      lastEnemyAppear: 0,
      shotCD: 500,
      enemySpawnCD: 1000,
      enemyShotCD: 2000,
      damageCD: 500,
      lastDamage: 0,
      gameTime: 0,
      lastTimeUpd: 0,
      enemiesKilled: 0,
      gameActive: true,
      keysPressed: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false
      },
      worldSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  },
  computed: {
    ...mapGetters('game', [
      'getPlayer',
      'getMousePosition',
      'getEnemies',
      'getEnemyBullets',
      'getBullets',
      'getPauseState',
      'getCoins',
      'getStats'
    ]),
    player() { 
      return this.getPlayer 
    },
    mousePos() { 
      return this.getMousePosition 
    },
    enemies() { 
      return this.getEnemies 
    },
    bullets() { 
      return this.getBullets 
    },
    trueTime() {
      const totalSeconds = Math.floor(this.gameTime / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    isPaused(){
      return this.getPauseState
    },
    coins(){
      return this.getCoins
    },
    playerStats() {
    return this.getStats
    },
    enemyBullets(){
      return this.getEnemyBullets
    }
  },
  mounted() {
    this.init()
    window.addEventListener('keydown', this.comKeyDown)
    window.addEventListener('keyup', this.comKeyUp)
    window.addEventListener('resize', this.comResize)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.comKeyDown)
    window.removeEventListener('keyup', this.comKeyUp)
    window.removeEventListener('resize', this.comResize)
    cancelAnimationFrame(this.animationFrame)
  },
  methods: {
    ...mapActions('game', [
      'setPlayerPosition',
      'setMousePosition',
      'addEnemy',
      'updateEnemies',
      'addBullet',
      'updateBullets', 
      'setPause',
      'updateStats',
      'addCoins',
      'addEnemyBullet',
      'updateEnemyBullets',
      'setPlayerDirection'
    ]),

    comMouseMove(e) {
      const rect = this.$refs.game.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      this.setMousePosition({ x, y })
    },

    comKeyDown(e) {
      const key = e.key
      
      if (key.startsWith('Arrow')) {
        e.preventDefault()
        this.keysPressed[key] = true
      }
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        e.preventDefault()
        this.keysPressed[key] = true
      }
    },
    
    comKeyUp(e) {
      const key = e.key
      
      if (key.startsWith('Arrow')) {
        e.preventDefault()
        this.keysPressed[key] = false
      }
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        e.preventDefault()
        this.keysPressed[key] = false
      }
    },

    comResize() {
      this.worldSize = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    },

    init() {
      this.gameActive = true
      this.gameTime = 0
      this.lastTimeUpd = 0
      this.enemiesKilled = 0
      this.lastShotTime = 0
      this.lastEnemyAppear = 0
      
      Object.keys(this.keysPressed).forEach(key => {
        this.keysPressed[key] = false
      })
      
      const cX = window.innerWidth / 2
      const cY = window.innerHeight / 2
      this.setPlayerPosition({ x: cX, y: cY })
      this.updateEnemies([])
      this.updateBullets([])
      this.updateEnemyBullets([])
      
      cancelAnimationFrame(this.animationFrame)
      this.loop = (timestamp) => {
        if (this.gameActive) 
          this.gameLoop(timestamp)
        this.animationFrame = requestAnimationFrame(this.loop)
      }
      this.animationFrame = requestAnimationFrame(this.loop)
    },

    restartGame() {
      this.init()
    },

    gameLoop(currentTime) {
      if(!this.isPaused){
        this.updateGameTime(currentTime)
        this.updatePlayerPosition()
        this.updateGame(currentTime)
      }

    },

    updateGameTime(currentTime) {
      if (this.lastTimeUpd === 0) {
        this.lastTimeUpd = currentTime
        return
      }
      
      const deltaTime = currentTime - this.lastTimeUpd
      this.gameTime += deltaTime
      this.lastTimeUpd = currentTime
    },

    updatePlayerPosition() {
      //const newPos = { ...this.player }
      let newX = 0
      let newY = 0
      
      if (this.keysPressed.ArrowUp) newY += this.player.speed
      if (this.keysPressed.ArrowDown) newY -= this.player.speed
      if (this.keysPressed.ArrowLeft) newX += this.player.speed
      if (this.keysPressed.ArrowRight) newX -= this.player.speed
      if (this.keysPressed.w) newY += this.player.speed
      if (this.keysPressed.s) newY -= this.player.speed
      if (this.keysPressed.a) newX += this.player.speed
      if (this.keysPressed.d) newX -= this.player.speed
      
      //newPos.x = Math.max(20, Math.min(this.worldSize.width - 40, newPos.x))
      //newPos.y = Math.max(20, Math.min(this.worldSize.height - 40, newPos.y))
      
      //this.setPlayerPosition(newPos)

      if (newX !== 0 || newY !== 0) {

        const shiftedEnemies = this.enemies.map(enemy => ({
        ...enemy,
        x: enemy.x + newX,
        y: enemy.y + newY
      }))
      this.updateEnemies(shiftedEnemies)
    
      const shiftedBullets = this.bullets.map(bullet => ({...bullet,
        x: bullet.x + newX, y: bullet.y + newY}))
      this.updateBullets(shiftedBullets)
      }
    },

    updatePlayerDirection(){
      const dx = this.mousePos.x - this.player.x
      const dy = this.mousePos.y - this.player.y
      const direction = this.getDirection(dx, dy)
      if (direction !== this.player.direction) {
        this.setPlayerDirection(direction)
      }
    },

    updateGame(currentTime) {
      this.updateBulletsPosition()
      this.updateEnemyBulletsPosition()
      this.updateEnemiesPosition(currentTime)
      this.checkCollisions()
      this.spawnEnemyIfNeeded(currentTime)
      this.shoot(currentTime)
      this.updatePlayerDirection()
    },

    updateBulletsPosition() {
      const updatedBullets = this.bullets.map((bullet) => ({
        ...bullet,
        x: bullet.x + bullet.direction.x * 8,
        y: bullet.y + bullet.direction.y * 8,
        lifeTime: bullet.lifeTime - 16
      })).filter((bullet) =>
        bullet.lifeTime > 0 &&
        bullet.x >= 0 && bullet.x <= this.worldSize.width &&
        bullet.y >= 0 && bullet.y <= this.worldSize.height
      )
      
      this.updateBullets(updatedBullets)
    },

    updateEnemyBulletsPosition(){
      const updated = this.enemyBullets.map((bullet)=>({
        ...bullet,
        x: bullet.x + bullet.direction.x * 5,
        y: bullet.y + bullet.direction.y * 5,
        lifeTime: bullet.lifeTime - 16
      })).filter((bullet) =>
      bullet.lifeTime > 0 &&
      bullet.x >=0 && bullet.x <= this.worldSize.width &&
      bullet.y >= 0 && bullet.y <= this.worldSize.height)
      this.updateEnemyBullets(updated)
    },

    updateEnemiesPosition(currentTime) {
      const newEnemyBullets = []
      const updatedEnemies = this.enemies.map((enemy) => {
        const direction = this.calculateDirection(
          enemy.x,
          enemy.y,
          this.player.x + 20,
          this.player.y + 20
        )
        if(enemy.type === 'shooter'){
          const lastShot = enemy.lastShot || 0
          if(currentTime-lastShot>this.enemyShotCD){
            newEnemyBullets.push({
              x: enemy.x,
              y: enemy.y,
              direction,
              lifeTime: 2500
            })
            return {
              ...enemy,
              x: enemy.x + direction.x * enemy.speed,
              y: enemy.y + direction.y * enemy.speed,
              direction: this.getDirection(direction.x, direction.y),
              lastShot: currentTime
            }
          }
          return {
              ...enemy,
              x: enemy.x + direction.x * enemy.speed,
              y: enemy.y + direction.y * enemy.speed,
              direction: this.getDirection(direction.x, direction.y)
            }
        }
        return {
          ...enemy,
          x: enemy.x + direction.x * enemy.speed,
          y: enemy.y + direction.y * enemy.speed,
          direction: this.getDirection(direction.x, direction.y)
        }
      })
      
      this.updateEnemies(updatedEnemies)
      newEnemyBullets.forEach(b => this.addEnemyBullet(b))
    },

    calculateDirection(fromX, fromY, toX, toY) {
      const dx = toX - fromX
      const dy = toY - fromY
      const length = Math.sqrt(dx * dx + dy * dy)
      return length > 0 ? { x: dx / length, y: dy / length } : { x: 0, y: 0 }
    },

    getDirection(dx, dy){
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      if (angle > -22 && angle <= 22) return 'right'
      if (angle > 22 && angle <= 67) return 'down-right'
      if (angle > 67 && angle <= 112) return 'down'
      if (angle > 112 && angle <= 157) return 'down-left'
      if (angle > 157 || angle <= -157) return 'left'
      if (angle > -157 && angle <= -112) return 'up-left'
      if (angle > -112 && angle <= -67) return 'up'
      return 'up-right'
    },

    checkCollisions() {
      this.checkPlayerCollision()
      this.checkEnemyBulletsCollision()

      if (this.playerStats.health <= 0) {
        this.gameActive = false
        return
      }
      
      const result = this.checkBulletCollisions()
      if (result.hasChanges) {
        this.updateEnemies(result.enemies)
        this.updateBullets(result.bullets)

      }
    },

    checkEnemyBulletsCollision() {
      const px = this.player.x
      const py = this.player.y
      const survived = this.enemyBullets.filter((bullet) => {
        if (this.checkRectCollision(px, py, 40, 40, bullet.x - 4, bullet.y - 4, 8, 8)) {
          this.updateStats({ health: this.playerStats.health - 8 })
          return false
        }
        return true
      })
      if (survived.length !== this.enemyBullets.length) {
        this.updateEnemyBullets(survived)
      }
    },

    checkPlayerCollision() {
      for (const enemy of this.enemies) {
        if (this.checkRectCollision(this.player.x, this.player.y, 40, 40, enemy.x - 15, enemy.y - 15, 30, 30)
      && performance.now() - this.lastDamage > this.damageCD) {
          this.updateStats({health: this.playerStats.health - 10})
          this.lastDamage = performance.now()
          return
        }
      }
      //return false
    },

    checkBulletCollisions() {
      const enemies = [...this.enemies]
      const bullets = [...this.bullets]
      let hasChanges = false
      let killed = 0

      for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
          if (this.checkRectCollision(enemies[i].x - 15, enemies[i].y - 15, 30, 30,
          bullets[j].x - 4, bullets[j].y - 4, 8, 8)) {
            enemies[i].health = (enemies[i].health || 3) - this.playerStats.damage
            if(enemies[i].health<=0){
              enemies.splice(i, 1)
              killed++
            }
            bullets.splice(j, 1)
            hasChanges = true
            break
          }
        }
      }
      
      if (killed > 0) {
        this.enemiesKilled += killed
        this.$store.dispatch('game/addCoins', killed*5)
      }
      return { enemies, bullets, hasChanges }
    },

    checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
      return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    },

    spawnEnemyIfNeeded(currentTime) {
      if (currentTime - this.lastEnemyAppear > this.enemySpawnCD) {
        const position = this.generateEnemyPosition()
        const type = Math.random() < 0.30 ? 'shooter' : 'melee'
        const speed = type === 'shooter' ? 1 : 2
        this.addEnemy({ x: position.x, y: position.y, health: 3, type, lastShot: 0, speed, direction: 'down' })
        this.lastEnemyAppear = currentTime
      }
    },

    generateEnemyPosition() {
      const side = Math.floor(Math.random() * 4)
      let x, y
      
      switch(side) {
        case 0:
          x = Math.random() * this.worldSize.width
          y = -30
          break;
        case 1:
          x = this.worldSize.width + 30
          y = Math.random() * this.worldSize.height
          break;
        case 2:
          x = Math.random() * this.worldSize.width
          y = this.worldSize.height + 30
          break;
        case 3:
          x = -30
          y = Math.random() * this.worldSize.height
          break;
      }
      return { x, y };
    },

    shoot(curTime) {
      if (curTime - this.lastShotTime > this.shotCD) {
        const direction = this.calculateDirection(
          this.player.x + 20,
          this.player.y + 20,
          this.mousePos.x,
          this.mousePos.y
        )
        
        this.addBullet({
          x: this.player.x + 20,
          y: this.player.y + 20,
          direction: direction,
          lifeTime: 2000
        })
        this.lastShotTime = curTime
      }
    },

    doPause(){
      this.setPause(!this.isPaused)
    },

    buyHealthPotion() {
      if (this.coins >= 10) {
        this.addCoins(-10)
        this.updateStats({healthPotionCount: this.playerStats.healthPotionCount + 1})
      }
    },

    buyManaPotion() {
      if (this.coins >= 10) {
        this.addCoins(-10)
        this.updateStats( {manaPotionCount: this.playerStats.manaPotionCount + 1})
      }
    },
  
    upgradeDamage() {
      if (this.coins >= 20) {
        this.addCoins(-20)
        this.updateStats( {damage: this.playerStats.damage + 1})
      }
    },
  
    upgradeMaxHealth() {
      if (this.coins >= 30) {
        this.addCoins(-30)
        this.updateStats( {maxHealth: this.playerStats.maxHealth + 20,
          health: this.playerStats.health + 20})
      }
    },
  
    upgradeMaxMana() {
      if (this.coins >= 30) {
        this.addCoins(-30)
        this.updateStats({maxMana: this.playerStats.maxMana + 20,
          mana: this.playerStats.mana + 20})
      }
    },
  
    useHealthPotion() {
      if (this.playerStats.healthPotionCount > 0 && this.playerStats.health < this.playerStats.maxHealth) {
        const newHealth = Math.min(this.playerStats.health + 30, this.playerStats.maxHealth)
        this.updateStats( {health: newHealth,
          healthPotionCount: this.playerStats.healthPotionCount - 1})
      }
    },
  
    useManaPotion() {
      if (this.playerStats.manaPotionCount > 0 && this.playerStats.mana < this.playerStats.maxMana) {
        const newMana = Math.min(this.playerStats.mana + 20, this.playerStats.maxMana)
        this.updateStats( {mana: newMana,
          manaPotionCount: this.playerStats.manaPotionCount - 1})
      }
    },
  }
}
</script>

<style scoped lang="scss">
.game {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #2c3e50;

  &__hud {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    color: #ecf0f1;
    background: rgba(52, 73, 94, 0.9);
    flex-direction: column;
  }

  &__world {
    position: relative;
    width: 100%;
    height: 100%;
  }

  &__player {
    position: absolute;
    width: 40px;
    height: 40px;
    //background-color: red;
    transform: translate(-50%, -50%);
    will-change: left, top;
    background-image: url('/sprites/player.png');
    background-size: 320px 30px;
    background-repeat: no-repeat;
    &--down        { background-position: 0   0 }
    &--down-right  { background-position: -40px 0 }
    &--right       { background-position: -80px 0 }
    &--up-right    { background-position: -120px 0 }
    &--up          { background-position: -160px 0 }
    &--up-left     { background-position: -200px 0 }
    &--left        { background-position: -240px 0 }
    &--down-left   { background-position: -280px 0 }
  }

  &__bullet {
    position: absolute;
    width: 8px;
    height: 8px;
    background: yellow;
    transform: translate(-50%, -50%);
    will-change: left, top;
  }

  &__enemy {
    position: absolute;
    width: 30px;
    height: 30px;
    background: grey;
    transform: translate(-50%, -50%);
    will-change: left, top;
    
    &--shooter {
      //background: purple;
      background-image: url('/sprites/enemy1.png');
      background-size: 320px 30px;
      background-repeat: no-repeat;
    }

    &--shooter-down        { background-position: 0 0 }
    &--shooter-down-right  { background-position: -40px 0 }
    &--shooter-right       { background-position: -80px 0 }
    &--shooter-up-right    { background-position: -120px 0 }
    &--shooter-up          { background-position: -160px 0 }
    &--shooter-up-left     { background-position: -200px 0 }
    &--shooter-left        { background-position: -240px 0 }
    &--shooter-down-left   { background-position: -280px 0 }

    &--melee {
      //background: rgb(120, 236, 19);
      background-image: url('/sprites/enemy2.png');
      background-size: 320px 30px;
      background-repeat: no-repeat;
    }
    &--melee-down        { background-position: 0 0 }
    &--melee-down-right  { background-position: -40px 0 }
    &--melee-right       { background-position: -80px 0 }
    &--melee-up-right    { background-position: -120px 0 }
    &--melee-up          { background-position: -160px 0 }
    &--melee-up-left     { background-position: -200px 0 }
    &--melee-left        { background-position: -240px 0 }
    &--melee-down-left   { background-position: -280px 0 }
  }

  &__enemy-bullet {
    position: absolute;
    width: 8px;
    height: 8px;
    background: orange;
    transform: translate(-50%, -50%);
    will-change: left, top;
  }

  &__game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #34495e;
    text-align: center;
    z-index: 20;
  }

  &__game-over-title {
    color: #ecf0f1;
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  &__game-over-time,
  &__game-over-killed {
    color: #ecf0f1;
    font-size: 1.2rem;
    margin: 0.5rem 0;
  }

  &__game-over-button {
    display: inline-flex;
    align-items: center;
    font-size: 1rem;
    background-color: #3498db;
    color: white;
    font-weight: 500;

    &:hover {
      background-color: #2980b9;
    }
  }

  &__pause-button {
    margin-left: 20px;
    padding: 5px 15px;
    background: #f1c40f;
    color: #2c3e50;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      background: #f39c12;
    }
  }

  &__pause {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #34495e;
    padding: 30px;
    color: #ecf0f1;
    z-index: 30;
    min-width: 400px;
  }

  &__pause-title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
  }

  &__stats {
    background: #2c3e50;
    padding: 15px;
    margin-bottom: 20px;
    
    div {
      margin: 5px 0;
    }
  }

  &__shop {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__shop-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #2c3e50;

    button {
      padding: 5px 15px;
      background: #3498db;
      color: white;
      border: none;
      cursor: pointer;

      &:hover:not(:disabled) {
        background: #2980b9;
      }

      &:disabled {
        background: #7f8c8d;
        cursor: not-allowed;
        opacity: 0.5;
      }
    }

    span {
      margin-left: 10px;
    }
  }

  &__coins {
    margin-left: 20px;
    color: #f1c40f;
    font-weight: bold;
  }
}
</style>