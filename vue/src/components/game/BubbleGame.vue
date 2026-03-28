<template>
  <div class="bubble-game">
    <div class="bubble-game__score">Счёт {{ score.toFixed(1) }}</div>
    <div class="bubble-game__timer" :class="{'bubble-game__timer--warning': timeLeft <= 15}">{{ formattedTime }}</div>
    <div class="bubble-game__multiplier">
      <div class="bubble-game__multiplier--correct">
        +{{ correctMultiplier.toFixed(1) }}x
      </div>
      <div class="bubble-game__multiplier--wrong">
        -{{ wrongMultiplier.toFixed(1) }}x
      </div>
    </div>

    <div class="bubble-game__target">
      <div class="bubble-game__target__label">Цель:</div>
      <div class="bubble-game__target__preview">
        <img class="bubble-game__target__image" :src="getTargetColorImage" />
      </div>
      <div class="bubble-game__target__name">{{ getTargetColorName }}</div>
    </div>

    <canvas
        ref="canvas"
        class="bubble-game__canvas"
        @mousedown="(e) => handleMouseDown(e)"
        @mousemove="(e) => handleMouseMove(e)"
    ></canvas>

    <BombExplosion
      v-for="explosion in bombExplosions"
      :key="explosion.id"
      :x="explosion.x"
      :y="explosion.y"
      @complete="() => removeExplosion(explosion.id)"
      @detonate="(data) => detonateBomb(explosion.bombWorldX, explosion.bombWorldY)"
    />

    <div class="bubble-game__bomb-counter">
      <div class="bubble-game__bomb-counter__icon">💣</div>
      <div class="bubble-game__bomb-counter__count">{{ bombCount }}</div>
      <div class="bubble-game__bomb-counter__hits">
        {{ successfulHits % bombsPerReward }}/{{ bombsPerReward }}
      </div>
    </div>

    <div v-if="paused" class="bubble-game__pause">
      <div class="bubble-game__pause__content">
        <h2>Пауза</h2>
        <button class="bubble-game__pause__button" @click="() => resumegame()">Продолжить</button>
        <button class="bubble-game__pause__button" @click="() => restartgame()">Перезапустить</button>
        <RouterLink 
            :to="{ name: $routes.OPTION }" 
            class="bubble-game__pause__button bubble-game__pause__button--link"
            @click="() => playClickSound()"
        >
          Настройки
        </RouterLink>
        <RouterLink 
            :to="{ name: $routes.MAINMENU }" 
            class="bubble-game__pause__button bubble-game__pause__button--link" 
            @click="() => playClickSound()"
        >
          Меню
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script>
import blueBubble from './../../assets/bubbles/bubble_blue.png'
import greenBubble from './../../assets/bubbles/bubble_green.png'
import orangeBubble from './../../assets/bubbles/bubble_orange.png'
import pinkBubble from './../../assets/bubbles/bubble_pink.png'
import purpleBubble from './../../assets/bubbles/bubble_purple.png'
import redBubble from './../../assets/bubbles/bubble_red.png'
import whiteBubble from './../../assets/bubbles/bubble_white.png'
import yellowBubble from './../../assets/bubbles/bubble_yellow.png'
import soundManager from './../../utils/soundManager'
import CursorManager from './../../utils/cursor/CursorManager'
import GameModeManager from './../../utils/game/GameModeManager'
import { mapGetters } from 'vuex'
import BombExplosion from './BombExplosion.vue'


export default {
  name: 'Bubblegame',
  components: {
    BombExplosion
  },
  props: {
    totalColors: { type: Number, required: true },
    targetColor: { type: String, required: true },
    spawnRate: { type: Number, required: true },
    pointsForCorrect: { type: Number, default: 1 },
    pointsForWrong: { type: Number, default: -5 },
    onStart: { type: Function, default: () => {} },
    gameDuration: { type: Number, default: 60 }
  },
  emits: ['score', 'finish'],
  
  data() {
    return {
      score: 0,
      correctMultiplier: 1,
      wrongMultiplier: 1,
      timeLeft: this.gameDuration,
      gameOver: false,
      paused: false,

      bubbles: [],

      canvasContext: null,
      canvasWidth: 0,
      canvasHeight: 0,

      animationFrame: null,
      lastSpawnTime: 0,

      images: {},

      timerInterval: null,

      pressedBubbleIds: new Set(),

      pushedBubbles: new Map(),

      cursorManager: null,
      modeManager: null,

      isReady: false,
      imagesLoaded: false,
      cursorManagerReady: false,
      modeManagerReady: false,

      lastFrameTime: 0,
      accumulator: 0,

      clickHandlerEnabled: true,

      isBombMode: false,
      bombExplosions: [],
      bombRadius: 80,

      bombCount: 0,
      successfulHits: 0,
      bombsPerReward: 10,
      lastNoBombsNotification: 0,
      bombHintShown: false,
    }
  },
  computed: {
    ...mapGetters(['getGameMode', 'getFPS']),
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60)
      const seconds = this.timeLeft % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    imageFiles() {
      return {
        blue: blueBubble,
        green: greenBubble,
        orange: orangeBubble,
        pink: pinkBubble,
        purple: purpleBubble,
        red: redBubble,
        white: whiteBubble,
        yellow: yellowBubble
      }
    },
    getTargetColorImage() {
      return this.imageFiles[this.targetColor]
    },
    getTargetColorName() {
      const names = {
        blue: 'Синий', 
        green: 'Зелёный', 
        orange: 'Оранжевый',
        pink: 'Розовый', 
        purple: 'Фиолетовый', 
        red: 'Красный',
        white: 'Белый', 
        yellow: 'Жёлтый'
      }
      return names[this.targetColor] || this.targetColor
    },
    bubbleConfig() {
      return [
        { name: 'small',  radius: 30, sizePenalties: this.pointsForWrong * 0.6, escapePenalties: -3,  speedMultiplier: 1.0 },
        { name: 'medium', radius: 45, sizePenalties: this.pointsForWrong,       escapePenalties: -5,  speedMultiplier: 0.8 },
        { name: 'large',  radius: 60, sizePenalties: this.pointsForWrong * 1.4, escapePenalties: -10, speedMultiplier: 0.6 }
      ]
    },
    pushDistanceMap() {
      return {
        large: {
          large: 1.0,
          medium: 1.5,
          small: 2.0
        },
        medium: {
          large: 0.5,
          medium: 1.0,
          small: 1.5
        },
        small: {
          large: 0.25,
          medium: 0.5,
          small: 1.0
        }
      }
    },
    allColors() {
      return ['white', 'blue', 'red', 'green', 'yellow', 'purple', 'pink', 'orange']
    },
    gameColors() {
      let colors = this.allColors.slice(0, this.totalColors)
      if (!colors.includes(this.targetColor)) {
        colors = colors.slice(0, -1)
        colors.push(this.targetColor)
      }
      
      return colors
    },
    targetFPS() {
      return this.getFPS || 60
    }
  },
  mounted() {
    this.resizeCanvas()
    window.addEventListener('resize', this.resizeCanvas)
    this.canvasContext = this.$refs.canvas.getContext('2d')
    this.loadImages()
    this.initCursorManager()
    this.initModeManager()

    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
  },
  methods: {
    enableClickHandler(enabled) {
      this.clickHandlerEnabled = enabled
    },
    handleMouseDown(event) {
      if (this.paused || this.gameOver) return

      if (this.isBombMode && this.cursorManager) {
        event.preventDefault()
        this.cursorManager.handleBombClick(event.clientX, event.clientY)
        return
      }
      
      if (!this.clickHandlerEnabled) return

      if (this.getGameMode === 'click') {
        this.handleClickMode(event)
      }
    },
    handleMouseMove(event) {
      if (this.paused || this.gameOver) return
      if (this.isBombMode) return
      
      if (this.modeManager) {
        this.modeManager.updateMousePosition(event.clientX, event.clientY)
      }
    },
    handleClickMode(event) {
      const rect = this.$refs.canvas.getBoundingClientRect()
      const scaleX = this.canvasWidth / rect.width
      const scaleY = this.canvasHeight / rect.height
      
      const clickX = (event.clientX - rect.left) * scaleX
      const clickY = (event.clientY - rect.top) * scaleY
      
      const clickedBubbles = this.bubbles.filter(bubble => {
        if (!bubble.active) return false
        const distance = this.euclideanDistance(clickX, clickY, bubble.x, bubble.y)
        const speedMagnitude = Math.sqrt(bubble.speedX * bubble.speedX + bubble.speedY * bubble.speedY)
        const clickRadius = bubble.radius + Math.min(20, speedMagnitude * 3)
        return distance <= clickRadius
      })
      
      if (clickedBubbles.length === 0) return
      
      this.processPoppedBubbles(clickedBubbles)
    },
    popBubbleAtPosition(clientX, clientY) {
      if (this.paused || this.gameOver) return
      if (this.isBombMode) return
      
      const rect = this.$refs.canvas.getBoundingClientRect()
      const scaleX = this.canvasWidth / rect.width
      const scaleY = this.canvasHeight / rect.height
      
      const clickX = (clientX - rect.left) * scaleX
      const clickY = (clientY - rect.top) * scaleY
      
      const clickedBubbles = this.bubbles.filter(bubble => {
        if (!bubble.active) return false
        const distance = this.euclideanDistance(clickX, clickY, bubble.x, bubble.y)
        const clickRadius = bubble.radius + 10
        return distance <= clickRadius
      })
      
      if (clickedBubbles.length === 0) return
      
      this.processPoppedBubbles(clickedBubbles)
    },
    processPoppedBubbles(clickedBubbles) {
      const unprocessedBubbles = clickedBubbles.filter(bubble => !bubble.isPopped)
      if (unprocessedBubbles.length === 0) return

      unprocessedBubbles.forEach(bubble => {
        this.pressedBubbleIds.add(bubble.id)
      })
      
      this.playPopSound()

      let totalPoints = 0
      const allNewBubbles = []
      let correctHitsInThisBatch = 0

      unprocessedBubbles.forEach(bubble => {
        bubble.isPopped = true

        const isCorrect = bubble.color === this.targetColor
        let points

        if (isCorrect) {
          points = this.pointsForCorrect * this.correctMultiplier
          this.correctMultiplier = Math.min(5, this.correctMultiplier * 1.2)
          this.wrongMultiplier = Math.max(1, this.wrongMultiplier - 0.2)
          correctHitsInThisBatch++
        } else {
          const config = this.bubbleConfig.find(c => c.name === bubble.sizeName)
          points = config.sizePenalties * this.wrongMultiplier
          this.wrongMultiplier = Math.min(7, this.wrongMultiplier * 1.3)
          this.correctMultiplier = Math.max(1, this.correctMultiplier - 0.2)
        }

        totalPoints += points

        const childBubbles = this.handleBubbleSplit(bubble)
        allNewBubbles.push(...childBubbles)

        this.pushBubblesAway(bubble, 2)
        
        bubble.active = false
      })
      
      this.score += totalPoints
      this.$emit('score', { points: totalPoints, count: unprocessedBubbles.length })

      if (correctHitsInThisBatch > 0) {
        this.addSuccessfulHits(correctHitsInThisBatch)
      }

      if (allNewBubbles.length > 0) {
        this.bubbles.push(...allNewBubbles)
      }
      
      this.bubbles = this.bubbles.filter(b => {
        if (!b.active) {
          this.pushedBubbles.delete(b.id)
          return false
        }
        return true
      })
      
      this.pressedBubbleIds.clear()
    },
    initModeManager() {
      this.modeManager = new GameModeManager(this)
      this.modeManager.setMode(this.getGameMode)
      this.modeManagerReady = true
      this.tryStartGame()
    },
    initCursorManager() {
      this.cursorManager = new CursorManager(this.$refs.canvas)

      this.cursorManager.setOnShootCallback((x, y) => {
        if (this.getGameMode === 'auto' && !this.paused && !this.gameOver) {
          this.popBubbleAtPosition(x, y)
        }
      })

      this.cursorManager.setOnBombPlaced((x, y) => {
        this.placeBomb(x, y)
      })

      this.cursorManager.setMode(this.getGameMode)
      this.cursorManager.show()
      this.cursorManagerReady = true
      this.tryStartGame()
    },
    loadImages() {   
      let loadedCount = 0
      const totalImages = Object.keys(this.imageFiles).length
      
      Object.entries(this.imageFiles).forEach(([color, src]) => {
        const img = new Image()
        img.onload = () => {
          loadedCount++
          if (loadedCount === totalImages) {
            this.imagesLoaded = true
            this.tryStartGame()
          }
        }
        img.onerror = (err) => {
          console.error(`Ошибка загрузки изображения ${color}:`, src, err)
        }
        img.src = src
        this.images[color] = img
      })
    },
    startgame() {
      if (!this.isReady) return
      this.onStart()
      this.startTimer()
      this.lastSpawnTime = performance.now()
      this.animationFrame = requestAnimationFrame(this.gameLoop)
    },
    gameLoop(timestamp) {
      if (!this.isReady) {
        this.renderLoading()
        this.animationFrame = requestAnimationFrame(this.gameLoop)
        return
      }

      if (this.gameOver) {
        this.render()
        this.animationFrame = requestAnimationFrame(this.gameLoop)
        return
      }

      const fixedDeltaTime = 1 / this.targetFPS
      const now = performance.now()
      
      if (!this.lastFrameTime) {
        this.lastFrameTime = now
        this.animationFrame = requestAnimationFrame(this.gameLoop)
        return
      }
      
      let frameTime = (now - this.lastFrameTime) / 1000
      this.lastFrameTime = now
      
      if (frameTime > 0.1) {
        frameTime = 0.1
      }
      
      this.accumulator += frameTime
      
      while (this.accumulator >= fixedDeltaTime && !this.paused) {
        this.updatePhysics(timestamp, fixedDeltaTime)
        this.accumulator -= fixedDeltaTime
      }
      
      this.render()
      this.animationFrame = requestAnimationFrame(this.gameLoop)
    },
    updatePhysics(timestamp, deltaTime) {
      const spawnInterval = 1000 / this.spawnRate
      if (timestamp - this.lastSpawnTime > spawnInterval) {
        this.spawnBubble()
        this.lastSpawnTime = timestamp
      }

      const escapedBubbles = []

      this.bubbles.forEach(bubble => {
        const prevX = bubble.x
        const prevY = bubble.y

        bubble.x += bubble.speedX * deltaTime * 144
        bubble.y += bubble.speedY * deltaTime * 144
        bubble.wobble += bubble.wobbleSpeed * deltaTime * 144
        bubble.x += Math.sin(bubble.wobble) * 0.5 * deltaTime * 144

        if (this.pushedBubbles.has(bubble.id)) {
          const pushData = this.pushedBubbles.get(bubble.id)
          const stepDistance = this.euclideanDistance(bubble.x, bubble.y, prevX, prevY)
          pushData.remainingDistance -= stepDistance
          
          if (pushData.remainingDistance <= 0) {
            const targetSpeedX = pushData.originalSpeedX
            const targetSpeedY = pushData.originalSpeedY
            const decayRate  = 0.95

            const normalizedDecay = Math.pow(decayRate, 144 / this.targetFPS)

            bubble.speedX = bubble.speedX * normalizedDecay + targetSpeedX * (1 - normalizedDecay)
            bubble.speedY = bubble.speedY * normalizedDecay + targetSpeedY * (1 - normalizedDecay)

            const speedDiff = Math.abs(bubble.speedX - targetSpeedX) + Math.abs(bubble.speedY - targetSpeedY)

            if (speedDiff < 0.4) {
              bubble.speedX = targetSpeedX
              bubble.speedY = targetSpeedY
              this.pushedBubbles.delete(bubble.id)
            }
          }
        }        


        if (bubble.y - bubble.radius > this.canvasHeight + 100 || bubble.x + bubble.radius < -100 || bubble.x - bubble.radius > this.canvasWidth + 100) {
          if (bubble.color == this.targetColor) {
            escapedBubbles.push(bubble)
          }
          
          bubble.active = false
        }
      })

      if (escapedBubbles.length > 0) {
        let totalPenalty = 0

        escapedBubbles.forEach(bubble => {
          const config = this.bubbleConfig.find(c => c.name === bubble.sizeName)
          totalPenalty += config.escapePenalties
        })

        this.score =  this.score + totalPenalty
        
        this.$emit('score', { 
          points: totalPenalty, 
          count: escapedBubbles.length,
          reason: 'escaped'
        })
      }

      this.bubbles = this.bubbles.filter(b => {
        if (!b.active) {
          this.pushedBubbles.delete(b.id)
          return false
        }
        return true
      })      
    },
    render() {
      if (!this.canvasContext) return
      
      const ctx = this.canvasContext
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

      this.bubbles.forEach(bubble => {
        if (!bubble.active) return
        
        let scale = 1
        
        if (this.pressedBubbleIds.has(bubble.id)) {
          scale = 0.9
        }

        ctx.save()
        ctx.translate(bubble.x, bubble.y)
        ctx.scale(scale, scale)
        ctx.drawImage(
          this.images[bubble.color],
          -bubble.radius, -bubble.radius,
          bubble.radius * 2, bubble.radius * 2
        )
        ctx.restore()
      })
    },
    renderLoading() {
      if (!this.canvasContext) return
      
      const ctx = this.canvasContext
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      ctx.fillStyle = 'white'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Загрузка...', this.canvasWidth / 2, this.canvasHeight / 2)
    },
    spawnBubble() {
      const spawnAreaWidth = this.canvasWidth * 0.6
      const spawnAreaStart = (this.canvasWidth - spawnAreaWidth) / 2
      const randomX = spawnAreaStart + Math.random() * spawnAreaWidth

      const randomConfig = this.bubbleConfig[Math.floor(Math.random() * this.bubbleConfig.length)]
      const randomColor = this.gameColors[Math.floor(Math.random() * this.gameColors.length)]

      const newBubble = this.createBubble({
        color: randomColor,
        x: randomX,
        y: -150,
        sizeName: randomConfig.name
      })
      
      this.bubbles.push(newBubble)
    },
    handleKeyDown(e) {
      if (!this.$refs.canvas) return

      if (e.key === 'Escape') {
        this.togglePause()
        return
      }

      if (e.code === 'KeyB' && !this.paused && !this.gameOver) {
        e.preventDefault()
        this.activateBombMode()
      }
    },
    handleKeyUp(e) {
      if (!this.$refs.canvas) return
      
      if (e.code === 'KeyB') {
        this.deactivateBombMode()
      }
    },
    tryStartGame() {
      if (this.imagesLoaded && this.cursorManagerReady && this.modeManagerReady && !this.isReady) {
        this.isReady = true
        this.startgame()
      }
    },
    startTimer() {
      if (this.timerInterval) return
      this.timerInterval = setInterval(() => {
        if (!this.gameOver && this.timeLeft > 0) {
          this.timeLeft--
        } else if (this.timeLeft <= 0 && !this.gameOver) {
          this.endgame()
        }
      }, 1000)
    },
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },
    endgame() {
      this.gameOver = true
      this.paused = false
      this.bubbles = []
      this.pressedBubbleIds.clear()

      this.stopTimer()
      this.updateCursorByState()
      this.$emit('finish', { score: this.score, timeElapsed: this.gameDuration })
    },
    togglePause() {
      if (this.gameOver) return
      this.paused = !this.paused

      if (this.paused) {
        this.stopTimer()
        soundManager.stopAll()
      } else {
        this.startTimer()
      }      

      this.updateCursorByState()
    },
    resumegame() {
      this.playClickSound()
      this.paused = false
      this.startTimer()
      this.updateCursorByState()
    },
    restartgame() {
      this.playClickSound()
      this.score = 0
      this.correctMultiplier = 1
      this.wrongMultiplier = 1
      this.timeLeft = this.gameDuration
      this.gameOver = false
      this.paused = false
      this.bubbles = []
      this.pressedBubbleIds.clear()
      this.pushedBubbles.clear()
      this.bombCount = 0
      this.successfulHits = 0

      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
        this.animationFrame = null
      }

      if (this.isBombMode) {
        this.deactivateBombMode()
      }
      this.bombExplosions = []

      this.stopTimer()
      this.updateCursorByState()
      this.lastSpawnTime = performance.now()
      this.startTimer()
      this.animationFrame = requestAnimationFrame(this.gameLoop)
    },
    resizeCanvas() {
      const canvas = this.$refs.canvas
      if (!canvas) return

      const newWidth = document.documentElement.clientWidth
      const newHeight = document.documentElement.clientHeight
      
      if (this.canvasWidth === newWidth && this.canvasHeight === newHeight) return

      const oldWidth = this.canvasWidth
      const oldHeight = this.canvasHeight
      
      const scaleX = oldWidth > 0 ? newWidth / oldWidth : 1
      const scaleY = oldHeight > 0 ? newHeight / oldHeight : 1
      
      if (oldWidth > 0 && oldHeight > 0 && this.bubbles.length > 0) {
        this.bubbles.forEach(bubble => {
          bubble.x *= scaleX
          bubble.y *= scaleY
        })
      }
      
      canvas.width = newWidth
      canvas.height = newHeight
      this.canvasWidth = newWidth
      this.canvasHeight = newHeight
    },
    createBubble({color, x, y, sizeName}) {
      const config = this.bubbleConfig.find(c => c.name === sizeName)

      const speedX = ((Math.random() - 0.5) * 2) * config.speedMultiplier
      const speedY = (1 + Math.random() * 2) * config.speedMultiplier

      return {
        id: Date.now() + Math.random(),
        color: color,
        x: x,
        y: y,
        radius: config.radius,
        sizeName: sizeName,
        speedX: speedX,
        speedY: speedY,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        active: true,
        isPopped: false
      }
    },
    createChildBubbles(bubble, count, childSizeName, offset) {
      const childBubbles = []
      const angleStep = (2 * Math.PI) / count
      
      for (let i = 0; i < count; i++) {
        const angle = (i * angleStep) + Math.random() * 0.2
        const distance = bubble.radius + offset
        const childX = bubble.x + Math.cos(angle) * distance
        const childY = bubble.y + Math.sin(angle) * distance

        let childColor
        if (i === 0) {
          childColor = bubble.color
        } else {
          childColor = this.gameColors[Math.floor(Math.random() * this.gameColors.length)]
        }
        
        const childBubble = this.createBubble({
          color: childColor,
          x: childX,
          y: childY,
          sizeName: childSizeName
        })
        
        childBubbles.push(childBubble)
      }
      
      return childBubbles
    },    
    handleBubbleSplit(bubble, customChildren = null) {
      let childBubblesToAdd = []
      const now = performance.now()
      const maxSpeed = 4

      if (customChildren) {
        const { count, sizeName, offset = 10 } = customChildren
        childBubblesToAdd = this.createChildBubbles(bubble, count, sizeName, offset)
      } 
      else {
        if (bubble.sizeName === 'large') {
          childBubblesToAdd = this.createChildBubbles(bubble, 3, 'medium', 20)
        }
        else if (bubble.sizeName === 'medium') {
          childBubblesToAdd = this.createChildBubbles(bubble, 5, 'small', 10)
        }
      }

      childBubblesToAdd.forEach(childBubble => {
        const dx = childBubble.x - bubble.x
        const dy = childBubble.y - bubble.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > 0) {
          const dirX = dx / distance
          const dirY = dy / distance
          
          const multiplier = this.pushDistanceMap[bubble.sizeName]?.[childBubble.sizeName] || 1.0
          const totalDistance = bubble.radius * multiplier
          const decayTime = 2000
          let initialSpeed = totalDistance / decayTime * 144
          initialSpeed = Math.min(initialSpeed, maxSpeed)

          this.pushedBubbles.set(childBubble.id, {
            id: childBubble.id,
            originalSpeedX: childBubble.speedX,
            originalSpeedY: childBubble.speedY,
            remainingDistance: totalDistance,
            pushStartTime: now
          })
          
          childBubble.speedX = dirX * initialSpeed
          childBubble.speedY = dirY * initialSpeed
        }
      })

      return childBubblesToAdd
    },
    pushBubblesAway(bubble, radiusMultiplier = 2, decayTime = 2000) {
      const searchRadius = bubble.radius * radiusMultiplier
      const foundBubbles = []
      const now = performance.now()
      const minTimeBetweenPushes = 100
      const maxSpeed = 4

      this.bubbles.forEach(otherBubble => {
        if (!otherBubble.active || otherBubble.id === bubble.id) return

        const distance = this.euclideanDistance(bubble.x, bubble.y, otherBubble.x, otherBubble.y)
        if (distance - otherBubble.radius <= searchRadius) {
          foundBubbles.push(otherBubble)

          const dx = otherBubble.x - bubble.x
          const dy = otherBubble.y - bubble.y
          const dirX = dx / distance
          const dirY = dy / distance

          const multiplier = this.pushDistanceMap[bubble.sizeName]?.[otherBubble.sizeName] || 1.0
          const totalDistance = bubble.radius * multiplier

          const existingPush = this.pushedBubbles.get(otherBubble.id)
          const timeSinceLastPush = existingPush ? now - existingPush.pushStartTime : Infinity

          if (existingPush && timeSinceLastPush > minTimeBetweenPushes) {
            otherBubble.speedX = existingPush.originalSpeedX
            otherBubble.speedY = existingPush.originalSpeedY
            this.pushedBubbles.delete(otherBubble.id)
          }

          if (!this.pushedBubbles.has(otherBubble.id)) {
            let initialSpeed = totalDistance / decayTime * 144
            initialSpeed = Math.min(initialSpeed, maxSpeed)

            this.pushedBubbles.set(otherBubble.id, {
              id: otherBubble.id,
              originalSpeedX: otherBubble.speedX,
              originalSpeedY: otherBubble.speedY,
              remainingDistance: totalDistance,
              pushStartTime: now
            })

            otherBubble.speedX = dirX * initialSpeed
            otherBubble.speedY = dirY * initialSpeed
          }
        }
      })

      return foundBubbles
    },
    euclideanDistance(x1, y1, x2, y2) {
      const dx = x2 - x1
      const dy = y2 - y1
      return Math.sqrt(dx * dx + dy * dy)
    },
    updateCursorByState() {
      if (!this.cursorManager) return

      if (this.cursorManager.autoAnimationFrame) {
        cancelAnimationFrame(this.cursorManager.autoAnimationFrame)
        this.cursorManager.autoAnimationFrame = null
      }
      if (this.cursorManager.laserAnimationFrame) {
        cancelAnimationFrame(this.cursorManager.laserAnimationFrame)
        this.cursorManager.laserAnimationFrame = null
      }
      
      if (this.paused || this.gameOver) {
        this.cursorManager.resetToDefault()
      } else {
        this.cursorManager.show()
        this.cursorManager.setMode(this.getGameMode)
      }
    },
    activateBombMode() {
      if (this.isBombMode) return
      if (this.paused || this.gameOver) return
      if (this.bombCount <= 0) {
        this.showNoBombsNotification()
        return
      }
      
      this.isBombMode = true
      
      if (this.cursorManager) {
        this.cursorManager.activateBombMode()
      }
      
      this.clickHandlerEnabled = false
      if (this.modeManager) {
        this.modeManager.stopCurrentMode()
      }
    },
    deactivateBombMode() {
      if (!this.isBombMode) return
      
      this.isBombMode = false
      
      if (this.cursorManager) {
        this.cursorManager.deactivateBombMode()
      }
      
      this.clickHandlerEnabled = true
      if (this.modeManager) {
        this.modeManager.startCurrentMode()
      }
    },
    placeBomb(clientX, clientY) {
      if (!this.isBombMode) return
      if (this.paused || this.gameOver) return
      if (this.bombCount <= 0) {
        this.deactivateBombMode()
        this.showNoBombsNotification()
        return
      }
      this.bombCount--

      const rect = this.$refs.canvas.getBoundingClientRect()
      const scaleX = this.canvasWidth / rect.width
      const scaleY = this.canvasHeight / rect.height
      
      const bombX = (clientX - rect.left) * scaleX
      const bombY = (clientY - rect.top) * scaleY
      const explosionId = Date.now() + Math.random()
      
      this.bombExplosions.push({
        id: explosionId,
        x: clientX,
        y: clientY,
        bombWorldX: bombX,
        bombWorldY: bombY
      })
    },
    detonateBomb(x, y) {
      const bubblesToPop = this.bubbles.filter(bubble => {
        if (!bubble.active) return false
        const distance = this.euclideanDistance(x, y, bubble.x, bubble.y)
        return distance <= this.bombRadius
      })
      
      if (bubblesToPop.length === 0) return
      
      bubblesToPop.forEach(bubble => {
        bubble.isPopped = true
      })
      
      this.processBombExplosion(bubblesToPop)
    },
    processBombExplosion(bubblesToPop) {
      if (bubblesToPop.length === 0) return
      
      let totalPoints = 0
      const allNewBubbles = []
      
      bubblesToPop.forEach(bubble => {
        const isCorrect = bubble.color === this.targetColor
        let points
        
        if (isCorrect) {
          points = this.pointsForCorrect
        } else {
          const config = this.bubbleConfig.find(c => c.name === bubble.sizeName)
          points = config.sizePenalties
        }
        
        totalPoints += points
        
        if (bubble.sizeName === 'large') {
          const childBubbles = this.handleBubbleSplit(bubble, {
            count: 7,
            sizeName: 'small',
            offset: 15
          })
          allNewBubbles.push(...childBubbles)
        }
        
        this.pushBubblesAway(bubble, 2)
        bubble.active = false
      })
      
      this.score += totalPoints
      this.$emit('score', { points: totalPoints, count: bubblesToPop.length, source: 'bomb' })
      
      if (allNewBubbles.length > 0) {
        this.bubbles.push(...allNewBubbles)
      }
      
      this.bubbles = this.bubbles.filter(b => {
        if (!b.active) {
          this.pushedBubbles.delete(b.id)
          return false
        }
        return true
      })
    },
    addSuccessfulHits(count) {
      const oldHits = this.successfulHits
      this.successfulHits += count
      
      const oldBombCount = Math.floor(oldHits / this.bombsPerReward)
      const newBombCount = Math.floor(this.successfulHits / this.bombsPerReward)
      const bombsEarned = newBombCount - oldBombCount
      
      if (bombsEarned > 0) {
        this.bombCount += bombsEarned
        this.showBombRewardEffect(bombsEarned)

        if (this.bombCount > 0 && !this.bombHintShown) {
          this.showBombHint()
        }
      }
    },
    showBombRewardEffect(count) {
      const notification = document.createElement('div')
      notification.textContent = `+${count} 💣`
      notification.style.position = 'fixed'
      notification.style.top = '100px'
      notification.style.right = '30px'
      notification.style.backgroundColor = 'rgba(0,0,0,0.8)'
      notification.style.color = '#ffaa00'
      notification.style.padding = '10px 20px'
      notification.style.borderRadius = '20px'
      notification.style.fontSize = '1.5rem'
      notification.style.fontWeight = 'bold'
      notification.style.zIndex = '200'
      notification.style.animation = 'fadeOutUp 2s ease-out forwards'
      notification.style.userSelect = 'none'
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 2000)
    },
    showNoBombsNotification() {
      const now = Date.now()

      if (now - this.lastNoBombsNotification < 2000) {
        return
      }
      
      this.lastNoBombsNotification = now

      const notification = document.createElement('div')
      notification.textContent = '❌ Нет бомб! Сделайте 10 успешных попаданий'
      
      notification.style.position = 'fixed'
      notification.style.bottom = '140px'
      notification.style.left = '0'
      notification.style.right = '0'
      notification.style.marginLeft = 'auto'
      notification.style.marginRight = 'auto'
      notification.style.width = 'fit-content'
      notification.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'
      notification.style.color = '#ff6b6b'
      notification.style.padding = '12px 24px'
      notification.style.borderRadius = '30px'
      notification.style.fontSize = '1rem'
      notification.style.fontWeight = 'bold'
      notification.style.border = '2px solid #ff6b6b'
      notification.style.boxShadow = '0 0 15px rgba(255, 107, 107, 0.3)'
      notification.style.animation = 'fadeOutUp 2s ease-out forwards'
      notification.style.userSelect = 'none'
      
      document.body.appendChild(notification)
      
      setTimeout(() => {
        if (notification && notification.remove) {
          notification.remove()
        }
      }, 2000)
    },
    showBombHint() {
      if (this.bombHintShown) return
      
      this.bombHintShown = true
      
      const hint = document.createElement('div')
      hint.innerHTML = '💣 <strong>Бомба готова!</strong> Зажми <kbd style="background:#333;padding:2px 8px;border-radius:6px;margin:0 4px;">B</kbd> и кликни, чтобы взорвать пузыри!'
      
      hint.style.position = 'fixed'
      hint.style.bottom = '200px'
      hint.style.left = '0'
      hint.style.right = '0'
      hint.style.marginLeft = 'auto'
      hint.style.marginRight = 'auto'
      hint.style.width = 'fit-content'
      hint.style.maxWidth = '90vw'
      hint.style.backgroundColor = 'rgba(0, 0, 0, 0.95)'
      hint.style.color = '#ffaa00'
      hint.style.padding = '16px 28px'
      hint.style.borderRadius = '40px'
      hint.style.fontSize = '1.1rem'
      hint.style.fontWeight = 'bold'
      hint.style.border = '2px solid #ffaa00'
      hint.style.boxShadow = '0 0 20px rgba(255, 170, 0, 0.5)'
      hint.style.animation = 'fadeOutUp 4s ease-out forwards'
      hint.style.userSelect = 'none'
      
      document.body.appendChild(hint)
      
      setTimeout(() => {
        if (hint && hint.remove) {
          hint.remove()
        }
      }, 4000)
    },
    removeExplosion(id) {
      this.bombExplosions = this.bombExplosions.filter(e => e.id !== id)
    },
    cleanupGame() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
        this.animationFrame = null
      }
      this.stopTimer()
      if (this.cursorManager) {
        this.cursorManager.destroy()
        this.cursorManager = null
      }
      if (this.modeManager) {
        this.modeManager.destroy()
        this.modeManager = null
      }
      window.removeEventListener('resize', this.resizeCanvas)
      window.removeEventListener('keydown', this.handleKeyDown)
      window.removeEventListener('keyup', this.handleKeyUp)

      this.isReady = false
      this.imagesLoaded = false
      this.cursorManagerReady = false
      this.modeManagerReady = false
    },
    playPopSound() {
      soundManager.play('pop')
    },
    playClickSound() {
      soundManager.play('click')
    }
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  overflow: hidden;
}

.bubble-game {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(160deg, #5d4065 0%, #1b191d 100%);
  user-select: none;
  overflow: hidden;

  &__bomb-counter {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 40px;
    backdrop-filter: blur(5px);
    z-index: 20;
    
    &__icon {
      font-size: 1.8rem;
    }
    
    &__count {
      font-size: 1.8rem;
      font-weight: bold;
      color: #ffaa00;
      min-width: 50px;
      text-align: center;
    }
    
    &__hits {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 8px;
      border-radius: 20px;
    }
  }

  &__score {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 3rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    z-index: 20;
    background: rgba(0, 0, 0, 0.4);
    padding: 15px 40px;
    border-radius: 60px;
    backdrop-filter: blur(5px);
    border: 2px solid rgba(255, 215, 0, 0.3);
    letter-spacing: 2px;
    cursor: default;
    pointer-events: none;
  }

  &__timer {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 2rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    z-index: 30;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 30px;
    border-radius: 50px;
    backdrop-filter: blur(5px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    cursor: default;
    pointer-events: none;
    transition: all 0.3s ease;
  }

  &__timer--warning {
    color: #ff6b6b;
    border-color: #ff6b6b;
    background: rgba(0, 0, 0, 0.6);
    animation: warningPulse 1s ease-in-out infinite;
  }

  &__multiplier {
    position: absolute;
    bottom: 30px;
    left: 30px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 20;
  }

  &__multiplier--correct, &__multiplier--wrong {
    background: rgba(0, 0, 0, 0.4);
    padding: 8px 20px;
    border-radius: 12px;
    backdrop-filter: blur(5px);
    font-size: 2rem;
    font-weight: bold;
    cursor: default;
    pointer-events: none;
    text-align: center;
    min-width: 120px;
    transition: all 0.1s ease;
  }

  &__multiplier--correct {
    color: #00d389;
    text-shadow: 0 0 15px rgba(0, 211, 137, 0.6);
    border-left: 3px solid #00d389;
    animation: pulseCorrect 1.2s ease-in-out infinite;
  }

  &__multiplier--wrong {
    color: #ff6b6b;
    text-shadow: 0 0 15px rgba(255, 107, 107, 0.6);
    border-left: 3px solid #ff6b6b;
  }

  &__target {
    position: absolute;
    bottom: 30px;
    right: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 20;
    background: rgba(0, 0, 0, 0.3);
    padding: 15px 25px;
    border-radius: 20px;
    backdrop-filter: blur(5px);
    border: 2px solid rgba(255, 215, 0, 0.3);
    cursor: default;
    pointer-events: none;

    &__label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }

    &__preview {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid rgba(255, 215, 0, 0.5);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    &__image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }

    &__name {
      color: white;
      font-size: 1.2rem;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 5px;
    }
  }

  &__canvas {
    width: 100%;
    height: 100%;
    display: block;
    cursor: default;
    position: relative;
    z-index: 1;
    transition: transform 0.1s ease;

    &--clicked {
      transform: scale(0.95);
    }
  }

  &__pause {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    backdrop-filter: blur(8px);

    &__content {
      background: #565b61;
      padding: 50px;
      border-radius: 30px;
      text-align: center;
      color: white;
      max-width: 450px;
      width: 90%;
      border: 2px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);

      h2 {
        font-size: 3rem;
        margin-bottom: 30px;
        color: #00d389;
        text-shadow: 0 0 20px rgba(0, 211, 137, 0.3);
        letter-spacing: 2px;
      }
    }

    &__button {
      display: block;
      width: 100%;
      padding: 15px 30px;
      margin: 15px 0;
      font-size: 1.3rem;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-decoration: none;
      text-align: center;
      background: #3a3f44;
      color: white;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        background: #4a4f54;
      }

      &:active {
        transform: translateY(0);
      }
    }

    &__button--link {
      background: #3a3f44;
      color: white;
      text-decoration: none;
      display: block;

      &:hover {
        background: #4a4f54;
      }
    }
  } 
}

@keyframes pulseCorrect {
  0% { 
    transform: scale(1);
    text-shadow: 0 0 15px rgba(0, 211, 137, 0.6);
  }
  50% { 
    transform: scale(1.05);
    text-shadow: 0 0 25px rgba(0, 211, 137, 0.9);
  }
  100% { 
    transform: scale(1);
    text-shadow: 0 0 15px rgba(0, 211, 137, 0.6);
  }
}

@keyframes warningPulse {
  0% { transform: translateX(-50%) scale(1); }
  50% { 
    transform: translateX(-50%) scale(1.05); 
    border-color: #ff4f4f;
    text-shadow: 0 0 20px #ff6b6b;
  }
  100% { transform: translateX(-50%) scale(1); }
}

@keyframes fadeOutUp {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px);
  }
}
</style>