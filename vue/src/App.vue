<template>
  <div id="game" class="game-container">
    <canvas ref="canvas" class="game-canvas"></canvas>
    <div class="ui-overlay">
      <div class="panel left">
        <div>Pos: <span ref="pos">{{ 0 }},{{ 0 }}</span></div>
        <div>Zone: <span ref="zone" class="zone-normal">Обычный</span></div>
        <div class="qte" v-if="qteVisible">
          <div class="bar">
            <div class="target"></div>
            <div class="marker" :style="'left: ' + markerPos + '%'" ref="marker"></div>
          </div>
        </div>
        <div>SPACE - рыбачить</div>
      </div>
      <div class="panel right">
        <div>Обычная: <span ref="common">0</span></div>
        <div>Редкая: <span ref="rare">0</span></div>
        <div>Легендарная: <span ref="legendary">0</span></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      canvas: null,
      ctx: null,
      boat: { x: 0, y: 0, dir: 1, rowing: false },
      inventory: { common: 0, rare: 0, legendary: 0 },
      fishing: false,
      qteVisible: false,
      markerPos: 50,
      zones: [],
      keys: {}
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.generateZones()
    this.gameLoop()
    document.addEventListener('keydown', this.handleKey)
    document.addEventListener('keyup', this.handleKey)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKey)
    document.removeEventListener('keyup', this.handleKey)
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    handleKey(e) {
      this.keys[e.code] = e.type === 'keydown'
      if (e.code === 'Space') {
        e.preventDefault()
        this.handleFishing()
      }
    },
    gameLoop() {
      requestAnimationFrame(() => this.gameLoop())
      this.update()
      this.draw()
    },
    update() {
      if (this.keys['KeyW'] || this.keys['ArrowUp']) this.boat.y -= 1
      if (this.keys['KeyS'] || this.keys['ArrowDown']) this.boat.y += 1
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
        this.boat.x -= 1
        this.boat.dir = -1
      }
      if (this.keys['KeyD'] || this.keys['ArrowRight']) {
        this.boat.x += 1
        this.boat.dir = 1
      }
      this.boat.rowing = Object.values(this.keys).some(k => k)
      this.save()
      this.updateUI()
    },
    draw() {
      // Clear
      this.ctx.fillStyle = '#0a0a1f'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      // Waves
      this.ctx.strokeStyle = '#1a1a4f'
      this.ctx.lineWidth = 2
      for (let i = 0; i < 5; i++) {
        this.ctx.beginPath()
        for (let x = 0; x < this.canvas.width; x += 10) {
          const y = Math.sin(x * 0.01 + i) * 15 + this.canvas.height * 0.7 + i * 20
          this.ctx.lineTo(x, y)
        }
        this.ctx.stroke()
      }
      // Clear blue water
      this.ctx.fillStyle = '#1e40af'
      this.ctx.fillRect(0, this.canvas.height * 0.6, this.canvas.width, this.canvas.height * 0.4)
      // Big boat
      this.ctx.save()
      this.ctx.translate(this.canvas.width / 2 + this.boat.x * 0.2, this.canvas.height / 2 + this.boat.y * 0.2)
      this.ctx.scale(this.boat.dir, 1)
      // Hull
      this.ctx.fillStyle = this.boat.rowing ? '#ff6b35' : '#4a5568'
      this.ctx.strokeStyle = '#fff'
      this.ctx.lineWidth = 4
      this.ctx.beginPath()
      this.ctx.moveTo(-60, 0)
      this.ctx.lineTo(-80, 50)
      this.ctx.lineTo(80, 50)
      this.ctx.lineTo(60, 0)
      this.ctx.closePath()
      this.ctx.fill()
      this.ctx.stroke()
      // Cabin
      this.ctx.fillStyle = '#a0aec0'
      this.ctx.beginPath()
      this.ctx.moveTo(-30, -20)
      this.ctx.lineTo(30, -20)
      this.ctx.lineTo(30, 10)
      this.ctx.lineTo(-30, 10)
      this.ctx.closePath()
      this.ctx.fill()
      this.ctx.stroke()
      // Mast
      this.ctx.strokeStyle = '#2d3748'
      this.ctx.lineWidth = 6
      this.ctx.beginPath()
      this.ctx.moveTo(0, -50)
      this.ctx.lineTo(0, 20)
      this.ctx.stroke()
      this.ctx.restore()
    },
    generateZones() {
      this.zones = []
      const bx = this.boat.x, by = this.boat.y
      for (let i = 0; i < 200; i++) {
        this.zones.push({ type: 'medium', x: (Math.random() * 2000 - 1000) + bx, y: (Math.random() * 2000 - 1000) + by })
      }
      for (let i = 0; i < 50; i++) {
        this.zones.push({ type: 'high', x: (Math.random() * 2000 - 1000) + bx, y: (Math.random() * 2000 - 1000) + by })
      }
    },
    getCurrentZone() {
      const b = this.boat
      for (let z of this.zones) {
        if (z.type === 'high' && Math.abs(b.x - z.x) < 10 && Math.abs(b.y - z.y) < 10) return 'Высокий'
      }
      for (let z of this.zones) {
        if (z.type === 'medium' && Math.abs(b.x - z.x) < 25 && Math.abs(b.y - z.y) < 25) return 'Средний'
      }
      return 'Обычный'
    },
    handleFishing() {
      if (!this.qteVisible) {
        this.fishing = true
        const delay = this.getCurrentZone() === 'Обычный' ? 2000 : 1000
        setTimeout(() => {
          this.qteVisible = true
          this.markerPos = 0
          let dir = 1
          const int = setInterval(() => {
            this.markerPos += dir * 1
            if (this.markerPos > 95) dir = -1
            if (this.markerPos < 0) dir = 1
          }, 20)
          this.fishingInterval = int
        }, delay)
      } else {
        if (this.markerPos > 40 && this.markerPos < 60) {
          const rand = Math.random()
          let type = 'common'
          if (rand > 0.8) type = 'rare'
          if (rand > 0.95) type = 'legendary'
          this.inventory[type]++
          // Remove zone
          this.zones = this.zones.filter(z => !(Math.abs(z.x - this.boat.x) < 25 && Math.abs(z.y - this.boat.y) < 25))
        }
        this.stopFishing()
      }
    },
    stopFishing() {
      this.qteVisible = false
      this.fishing = false
      clearInterval(this.fishingInterval)
    },
    updateUI() {
      this.$refs.pos.textContent = this.boat.x + ',' + this.boat.y
      const zone = this.getCurrentZone()
      this.$refs.zone.textContent = zone
      this.$refs.zone.className = 'zone-' + zone.toLowerCase()
      this.$refs.common.textContent = this.inventory.common
      this.$refs.rare.textContent = this.inventory.rare
      this.$refs.legendary.textContent = this.inventory.legendary
    },
    save() {
      localStorage.setItem('simple_game', JSON.stringify({ boat: this.boat, inventory: this.inventory, zones: this.zones }))
    },
    resize() {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    }
  },
  created() {
    const saved = localStorage.getItem('simple_game')
    if (saved) {
      const data = JSON.parse(saved)
      this.boat = data.boat || this.boat
      this.inventory = data.inventory || this.inventory
      this.zones = data.zones || []
    }
  }
}
</script>

<style scoped>
.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #1a1a4f 0%, #0a0a1f 80%);
  overflow: hidden;
}

.game-canvas {
  display: block;
  cursor: crosshair;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  font-family: monospace;
  font-size: 16px;
}

.panel {
  position: absolute;
  padding: 20px;
  background: rgba(10, 10, 30, 0.8);
  border: 2px solid #00ffff;
  box-shadow: 0 0 20px #00ffff40;
  border-radius: 10px;
  pointer-events: all;
  backdrop-filter: blur(10px);
}

.left {
  top: 20px;
  left: 20px;
  color: #00ffff;
}

.right {
  top: 20px;
  right: 20px;
  color: #00ff88;
}

.zone-высокий {
  color: #ff00ff !important;
  text-shadow: 0 0 10px #ff00ff;
}

.zone-средний {
  color: #00ff88 !important;
  text-shadow: 0 0 10px #00ff88;
}

.qte {
  margin: 20px 0;
}

.bar {
  position: relative;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #ff00ff;
  border-radius: 5px;
  overflow: hidden;
}

.target {
  position: absolute;
  left: 45%;
  top: 0;
  width: 10%;
  height: 100%;
  background: rgba(255, 0, 255, 0.4);
}

.marker {
  position: absolute;
  top: 0;
  width: 6px;
  height: 100%;
  background: #ff00ff;
  box-shadow: 0 0 10px #ff00ff;
  transition: left 0.02s;
}
</style>
