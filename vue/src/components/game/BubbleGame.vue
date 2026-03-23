<template>
  <div class="bubble-game">
    <div class="bubble-game__score">Счёт {{ score.toFixed(1) }}</div>
    <div class="bubble-game__timer" :class="{'bubble-game__timer--warning': timeLeft <= 15}">{{ formattedTime }}</div>
    <div class="bubble-game__multiplier">{{ multiplier.toFixed(1) }}x</div>

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
        @mousedown="(e) => handleCanvasMouseDown(e)"
    ></canvas>

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


export default {
  name: 'Bubblegame',
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
      multiplier: 1,
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
    }
  },
  computed: {
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
    }
  },
  mounted() {
    this.resizeCanvas()
    window.addEventListener('resize', this.resizeCanvas)
    this.canvasContext = this.$refs.canvas.getContext('2d')
    this.loadImages()
    this.startTimer()
    window.addEventListener('keydown', this.handleKeyDown)
  },
  beforeDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }

    window.removeEventListener('resize', this.resizeCanvas)
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  methods: {
    handleCanvasMouseDown(event) {
      if (this.paused || this.gameOver) return
    
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
      
      clickedBubbles.forEach(bubble => {
        this.pressedBubbleIds.add(bubble.id)
      })
      
      this.playPopSound()

      let totalPoints = 0
      let hadCorrect = false
      const allNewBubbles = []
      
      clickedBubbles.forEach(bubble => {
        if (bubble.isPopped) return

        bubble.isPopped = true

        const isCorrect = bubble.color === this.targetColor
        let points

        if (isCorrect) {
          points = this.pointsForCorrect
        } else {
          const config = this.bubbleConfig.find(c => c.name === bubble.sizeName)
          points = config.sizePenalties
        }

        totalPoints += points * (isCorrect ? this.multiplier : 1)
        
        if (isCorrect) {
          hadCorrect = true
          this.multiplier = Math.min(3, this.multiplier + 0.1)
        }

        const childBubbles = this.handleBubbleSplit(bubble)
        allNewBubbles.push(...childBubbles)

        this.pushBubblesAway(bubble, 2)
      })
      
      if (!hadCorrect && clickedBubbles.length > 0) {
        this.multiplier = 1
      }
      
      this.score += totalPoints
      this.$emit('score', { points: totalPoints, count: clickedBubbles.length })

      setTimeout(() => {
        clickedBubbles.forEach(bubble => {
          const actualBubble = this.bubbles.find(b => b.id === bubble.id)
          if (actualBubble) {
            actualBubble.active = false
          }
        })

        if (allNewBubbles.length > 0) {
          this.bubbles.push(...allNewBubbles)
        }

        this.pressedBubbleIds.clear()
        this.bubbles = this.bubbles.filter(b => b.active)
      }, 100)
    },
    loadImages() {   
      let loadedCount = 0
      const totalImages = Object.keys(this.imageFiles).length
      
      Object.entries(this.imageFiles).forEach(([color, src]) => {
        const img = new Image()
        img.onload = () => {
          loadedCount++
          if (loadedCount === totalImages) {
            this.startgame()
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
      this.onStart()
      this.lastSpawnTime = performance.now()
      this.animationFrame = requestAnimationFrame(this.gameLoop)
    },
    gameLoop(timestamp) {
      if (this.gameOver) {
        this.render()
        this.animationFrame = requestAnimationFrame(this.gameLoop)
        return
      }

      if (!this.paused) {
        this.updatePhysics(timestamp)
      }

      this.render()
      this.animationFrame = requestAnimationFrame(this.gameLoop)
    },
    updatePhysics(timestamp) {
      const spawnInterval = 1000 / this.spawnRate
      if (timestamp - this.lastSpawnTime > spawnInterval) {
        this.spawnBubble()
        this.lastSpawnTime = timestamp
      }

      const escapedBubbles = []

      this.bubbles.forEach(bubble => {
        const prevX = bubble.x
        const prevY = bubble.y

        bubble.x += bubble.speedX
        bubble.y += bubble.speedY
        bubble.wobble += bubble.wobbleSpeed
        bubble.x += Math.sin(bubble.wobble) * 0.5

        if (this.pushedBubbles.has(bubble.id)) {
          const pushData = this.pushedBubbles.get(bubble.id)

          const stepDistance = this.euclideanDistance(bubble.x, bubble.y, prevX, prevY)
          pushData.remainingDistance -= stepDistance
          
          if (pushData.remainingDistance <= 0) {
            const targetSpeedX = pushData.originalSpeedX
            const targetSpeedY = pushData.originalSpeedY

            bubble.speedX = bubble.speedX * 0.95 + targetSpeedX * 0.05
            bubble.speedY = bubble.speedY * 0.95 + targetSpeedY * 0.05

            const speedDiff = Math.abs(bubble.speedX - targetSpeedX) + Math.abs(bubble.speedY - targetSpeedY)

            if (speedDiff < 0.2) {
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
        this.multiplier = 1
        
        this.$emit('score', { 
          points: totalPenalty, 
          count: escapedBubbles.length,
          reason: 'escaped'
        })
        
      }

      this.bubbles = this.bubbles.filter(b => b.active)
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
      if (e.key === 'Escape') this.togglePause()
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (!this.paused && !this.gameOver && this.timeLeft > 0) {
          this.timeLeft--
        } else if (this.timeLeft <= 0 && !this.gameOver) {
          this.endgame()
        }
      }, 1000)
    },
   endgame() {
      this.gameOver = true
      this.paused = false
      this.bubbles = []
      this.pressedBubbleIds.clear()

      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }

      this.$emit('finish', { score: this.score, timeElapsed: this.gameDuration })
    },
    togglePause() {
      if (this.gameOver) return
      this.paused = !this.paused
    },
    resumegame() {
      this.playClickSound()
      this.paused = false
    },
    restartgame() {
      this.playClickSound()
      this.score = 0
      this.multiplier = 1
      this.timeLeft = this.gameDuration
      this.gameOver = false
      this.paused = false
      this.bubbles = []
      this.pressedBubbleIds.clear()
      this.pushedBubbles.clear()

      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
        this.animationFrame = null
      }
    
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    
      this.lastSpawnTime = performance.now()
      this.startTimer()
      this.animationFrame = requestAnimationFrame(this.gameLoop)
    },
    resizeCanvas() {
      const canvas = this.$refs.canvas
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      this.canvasWidth = canvas.width
      this.canvasHeight = canvas.height
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
    handleBubbleSplit(bubble) {
      let childBubblesToAdd = []
      const now = performance.now()
      const maxSpeed = 4

      if (bubble.sizeName === 'large') {
        childBubblesToAdd = this.createChildBubbles(bubble, 3, 'medium', 20)
      }
      else if (bubble.sizeName === 'medium') {
        childBubblesToAdd = this.createChildBubbles(bubble, 5, 'small', 10)
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
          let initialSpeed = totalDistance / decayTime * 60
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
        if (!otherBubble.active || otherBubble.id === bubble.id || otherBubble.isPopped) return

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
            let initialSpeed = totalDistance / decayTime * 60
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
    color: #00d389;
    font-size: 4rem;
    font-weight: bold;
    text-shadow: 0 0 20px rgba(0, 211, 137, 0.5);
    z-index: 20;
    background: rgba(0, 0, 0, 0.3);
    padding: 10px 30px;
    border-radius: 15px;
    backdrop-filter: blur(5px);
    animation: pulse 1.5s ease-in-out infinite;
    cursor: default;
    pointer-events: none;
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

@keyframes pulse {
  0% { transform: scale(1); }
  50% { 
    transform: scale(1.1); 
    text-shadow: 0 0 30px rgba(0, 211, 137, 0.8);
  }
  100% { transform: scale(1); }
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
</style>