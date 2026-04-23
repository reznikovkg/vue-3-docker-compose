<template>
  <div class="game">
    <div class="game__header">
      Cчёт: {{ Math.floor(score) }} м. Осталось жизней: {{ player.lives }}.
    </div>
    <div v-if="isOver" class="game__finished">
      Игра окончена! Итоговый счёт: {{ Math.floor(score) }} м
    </div>
    <div class="game__road">
      <svg width="100%" height="100%">
        <line class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" x1="24.5%" y1="0" x2="24.5%" y2="100%" stroke="#ffffff" stroke-width="2%" />
        <line class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" x1="50%" y1="0" x2="50%" y2="100%" stroke="#ffffff" stroke-width="2%" />
        <line class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" x1="75.5%" y1="0" x2="75.5%" y2="100%" stroke="#ffffff" stroke-width="2%" />
      </svg>
      <Car :image="player.image" :x="player.x" :y="playerY"/>
      <Car v-for="obstacle in obstacles" :key="obstacle.id" :image="obstacle.image" :x="obstacle.x" :direction="obstacle.direction" :y="obstacle.y"/>
    </div>
  </div>
</template>

<script lang="ts">
import Car from '../ui/Car.vue';
import blueCar from './../../assets/cars/blue.png'
import greenCar from './../../assets/cars/green.png'
import redCar from './../../assets/cars/red.png'
import violetCar from './../../assets/cars/violet.png'
import yellowCar from './../../assets/cars/yellow.png'

export default {
  name: 'IndexPage',
  components: {
    Car
  },
  data () {
    return {
      score: 0,
      speed: 1,
      carId: 0,
      player: {
        image: violetCar,
        x: 55,
        lives: 3,
      },
      obstacles: [] as any[],
      isOver: false,
      gameInterval: null as any,
      spawnInterval: null as any,
    }
  },
  computed: {
    roadLineStyle() {
      if (this.isOver) {
        return {
          animation: 'none'
        }
      }
      return {
        animationDuration: 1 / this.speed + 's'
      }
    },
    colors() {
      return [blueCar, greenCar, redCar, yellowCar]
    },
    playerY() {
      return 65;
    },
  },
  mounted() {
    window.addEventListener('keydown', this.arrow)
    this.runGame()
    this.spawn()
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.arrow)
    clearInterval(this.gameInterval)
    clearInterval(this.spawnInterval)
  },
  methods: {
    arrow(event: KeyboardEvent) {
      if(this.isOver) return;
      let newX = this.player.x
      const step = 10
      if (event.key === 'ArrowLeft') {
        if (newX > 1 + step) {
          newX -= step
        }
      }
      if (event.key === 'ArrowRight') {
        if (newX < 83.5 - step) {
          newX += step
        }
      }
      if (this.player.lives <= 0)
      {
        this.gameOver()
        return
      }
      this.player.x = newX
    },
    newObstacle() {
      const color = this.colors[Math.floor(Math.random() * 4)]
      const centers = [4.25, 29.25, 54.75, 79.75]
      const x = centers[Math.floor(Math.random() * centers.length)]
      const id = this.carId++
      this.obstacles.push({
        id: id,
        image: color,
        x: x,
        direction: 1,
        y: -50,
        hit: false,
      })
    },
    spawn() {
      this.spawnInterval = setInterval(() => {
        this.newObstacle()
      }, 2000)
    },
    gameOver() {
      this.isOver = true
      clearInterval(this.gameInterval)
      clearInterval(this.spawnInterval)
    },
    isIntersection(x1: number, x2: number, y1: number, y2: number) {
      const left_car1 = x1
      const left_car2 = x2
      const right_car1 = x1 + 13
      const right_car2 = x2 + 13
      const top_car1 = y1
      const top_car2 = y2
      const bottom_car1 = y1 + 5
      const bottom_car2 = y2 + 5
      return left_car1 < right_car2 && right_car1 > left_car2
      && bottom_car1 > top_car2 && top_car1 < bottom_car2
    },
    isAccident(x: number) {
      for (let obstacle of this.obstacles) {
        if (!obstacle.hit && this.isIntersection(obstacle.x, this.player.x, obstacle.y, this.playerY)) {
          this.player.lives -= 1
          obstacle.hit = true
          return true
        }
      }
      return false
    },
    runGame() {
      this.gameInterval = setInterval(() => {
        this.score += 0.05 * this.speed
        this.speed += 0.001
        this.obstacles.forEach(obstacle => {
          obstacle.y += 1.5 * this.speed
        })
        if (this.player.lives <= 0)
        {
          this.gameOver()
          return
        }
        let newX = this.player.x
        const accident = this.isAccident(newX)
        if (accident){
          if (this.player.lives <= 0)
          {
            this.gameOver()
            return
          }
        }
        this.obstacles = this.obstacles.filter(obstacle => obstacle.y < 120)
      }, 45)
    },
  },
}
</script>

<style scoped lang="scss">
.game {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  overflow: hidden;
  background: linear-gradient(145deg, #2b5876 0%, #4e4376 100%);

  &__header {
    position: absolute;
    width: 100%;
    height: 5%;
    top: 0;
    left: 0;
    font-size: 25px;
    color: red;
    background-color: rgba(0, 0, 0, 1);
    z-index: 10;
    text-align: center;
  }

  &__finished {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    color: white;
    background-color: rgba(0, 0, 0, 0.8);
    padding: 20px 40px;
    border-radius: 10px;
    z-index: 20;
    text-align: center;
    border: 2px solid red;
  }

  &__road {
    position: relative;
    background-color: #282828 ;
    width: 60%;
    height: 95%;
    top: 5%;
    left: 20%;
    transform-style: preserve-3d;
    transform: perspective(900px) rotateX(30deg);
    transform-origin: center top;
  }

  &__line {
    animation: moveRoad linear infinite;
  }

  @keyframes moveRoad {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -90;
    }
  }
}
</style>