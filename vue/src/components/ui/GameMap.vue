<template>
  <svg
    class="game-map"
    :width="level.mapWidth"
    :height="level.mapHeight"
    tabindex="0"
    @keydown="(e) => onKeyDown(e)"
    @mousemove="(e) => onMouseMove(e)"
    @mouseup="() => onMouseUp()"
    ref="svgRef"
  >
    <rect width="100%" height="100%" fill="#2d4a1e" />

    <polyline :points="pathPoints" fill="none" stroke="#8b7355" stroke-width="36" stroke-linecap="round" stroke-linejoin="round" />
    <polyline :points="pathPoints" fill="none" stroke="#a08060" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="12 8" />

    <circle v-for="(pt, idx) in level.path" :key="'pt' + idx" :cx="pt.x" :cy="pt.y" r="4" fill="#ffcc44" opacity="0.6" />

    <g
      v-for="slot in level.towerSlots"
      :key="slot.id"
      class="tower-slot"
      :class="{ 'tower-slot--selected': selectedSlotId === slot.id, 'tower-slot--occupied': !!towerInSlot(slot.id) }"
      @click="() => onSlotClick(slot.id)"
    >
      <circle
        v-if="selectedSlotId === slot.id && towerInSlot(slot.id)"
        :cx="slot.x" :cy="slot.y"
        :r="towerInSlot(slot.id).range"
        fill="rgba(255,200,50,0.08)"
        stroke="rgba(255,200,50,0.35)"
        stroke-width="1"
        stroke-dasharray="6 4"
      />
      <rect :x="slot.x - 22" :y="slot.y - 22" width="44" height="44" rx="6" :fill="slotFill(slot.id)" :stroke="slotStroke(slot.id)" stroke-width="2" />
      <text :x="slot.x" :y="slot.y + 6" text-anchor="middle" font-size="20">
        {{ towerInSlot(slot.id) ? towerIcon(towerInSlot(slot.id).level) : '+' }}
      </text>
      <text v-if="towerInSlot(slot.id)" :x="slot.x + 14" :y="slot.y - 14" text-anchor="middle" font-size="11" fill="#f0c040" font-weight="bold">
        Lv{{ towerInSlot(slot.id).level }}
      </text>
    </g>

    <circle
      v-for="bullet in bullets"
      :key="bullet.id"
      :cx="bullet.x"
      :cy="bullet.y"
      r="5"
      fill="#ffee44"
      opacity="0.9"
    />

    <g
      v-for="enemy in enemies"
      :key="enemy.id"
      class="enemy"
      @mousedown="(e) => onEnemyMouseDown(e, enemy.id)"
      :class="{ 'enemy--dragging': draggingEnemyId === enemy.id, 'enemy--focused': focusedEnemyId === enemy.id }"
      @click="(e) => { e.stopPropagation(); selectEnemy(enemy.id) }"
    >
      <circle :cx="enemy.x" :cy="enemy.y" r="16" :fill="draggingEnemyId === enemy.id ? '#ff4444' : '#cc2222'" stroke="#ff8888" stroke-width="2" />
      <text :x="enemy.x" :y="enemy.y + 5" text-anchor="middle" font-size="14">O</text>
      <rect :x="enemy.x - 16" :y="enemy.y - 28" width="32" height="5" rx="2" fill="#333" />
      <rect :x="enemy.x - 16" :y="enemy.y - 28" :width="32 * (enemy.hp / enemy.maxHp)" height="5" rx="2" fill="#44cc44" />
      <text :x="enemy.x" :y="enemy.y - 32" text-anchor="middle" font-size="9" fill="#ffcc44">#{{ enemy.id }}</text>
    </g>

    <text x="10" y="20" font-size="11" fill="rgba(255,255,255,0.4)">
      ЛКМ на слот - башня | Перетаскивать/стрелки - двигать врага
    </text>
  </svg>
</template>

<script>
let _bulletId = 1
const STEP = 10

export default {
  name: 'GameMap',
  
  data () {
    return {
      bullets: [],
      lastShot: {},
      focusedEnemyId: null,
      animFrameId: null,
    }
  },

  computed: {
    level () { return this.$store.getters.currentLevel },
    enemies () { return this.$store.state.enemies },
    towers () { return this.$store.state.towers },
    selectedSlotId () { return this.$store.getters.selectedSlotId },
    draggingEnemyId () { return this.$store.state.draggingEnemyId },
    pathPoints () {
      return this.level.path.map(p => `${p.x},${p.y}`).join(' ')
    },
  },

  mounted () {
    this.animFrameId = requestAnimationFrame((now) => this.gameLoop(now))
  },

  beforeUnmount () {
    cancelAnimationFrame(this.animFrameId)
  },

  methods: {
    towerInSlot (slotId) {
      return this.$store.getters.towerInSlot(slotId)
    },

    towerIcon (lvl) {
      const icons = ['1', '2', '3', '4', '5']
      return icons[lvl - 1] ?? '^'
    },

    slotFill (slotId) {
      if (this.towerInSlot(slotId)) return this.selectedSlotId === slotId ? '#3a3a1a' : '#2a2a12'
      return this.selectedSlotId === slotId ? '#1a3a1a' : '#1a2a1a'
    },

    slotStroke (slotId) {
      if (this.selectedSlotId === slotId) return '#f0c040'
      if (this.towerInSlot(slotId)) return '#886622'
      return '#446644'
    },

    dist (ax, ay, bx, by) {
      return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
    },

    gameLoop (now) {
      const slots = this.level?.towerSlots ?? []

      slots.forEach(slot => {
        const tower = this.towers[slot.id]
        if (!tower) return

        const last = this.lastShot[slot.id] ?? 0
        if (now - last < tower.fireRate) return

        let target = null
        let minD = Infinity
        this.enemies.forEach(e => {
          const d = this.dist(slot.x, slot.y, e.x, e.y)
          if (d <= tower.range && d < minD) {
            minD = d
            target = e
          }
        })

        if (!target) return

        this.lastShot[slot.id] = now
        this.bullets.push({
          id: _bulletId++,
          x: slot.x,
          y: slot.y,
          enemyId: target.id,
          damage: tower.damage,
          speed: 6,
        })
      })

      this.bullets = this.bullets.filter(b => {
        const enemy = this.enemies.find(e => e.id === b.enemyId)
        if (!enemy) return false

        const dx = enemy.x - b.x
        const dy = enemy.y - b.y
        const d = Math.sqrt(dx * dx + dy * dy)

        if (d < b.speed) {
          this.$store.dispatch('damageEnemy', { id: b.enemyId, damage: b.damage })
          const updated = this.$store.state.enemies.find(e => e.id === b.enemyId)
          if (updated && updated.hp <= 0) {
            this.$store.dispatch('removeEnemy', b.enemyId)
            this.$store.commit('KILL_REWARD', 50)
          }
          return false
        }

        b.x += (dx / d) * b.speed
        b.y += (dy / d) * b.speed
        return true
      })

      this.animFrameId = requestAnimationFrame((now) => this.gameLoop(now))
    },

    onSlotClick (slotId) {
      this.$store.dispatch('selectSlot', slotId)
    },

    onEnemyMouseDown (e, id) {
      e.preventDefault()
      this.$store.dispatch('setDraggingEnemy', id)
      this.selectEnemy(id)
    },

    onMouseMove (e) {
      if (!this.draggingEnemyId) return
      const rect = this.$refs.svgRef.getBoundingClientRect()
      this.$store.dispatch('moveEnemyDrag', {
        id: this.draggingEnemyId,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    },

    onMouseUp () {
      this.$store.dispatch('setDraggingEnemy', null)
    },

    onKeyDown (e) {
      if (!this.focusedEnemyId) return
      const map = {
        ArrowUp:    { dx: 0,     dy: -STEP },
        ArrowDown:  { dx: 0,     dy: STEP  },
        ArrowLeft:  { dx: -STEP, dy: 0     },
        ArrowRight: { dx: STEP,  dy: 0     },
      }
      const delta = map[e.key]
      if (!delta) return
      e.preventDefault()
      this.$store.dispatch('moveEnemyKeyboard', { id: this.focusedEnemyId, ...delta })
    },

    selectEnemy (id) {
      this.focusedEnemyId = id
      this.$refs.svgRef?.focus()
    },
  },
}
</script>

<style lang="scss" scoped>
.game-map {
  display: block;
  border-radius: 10px;
  border: 2px solid #0f3460;
  outline: none;
  cursor: default;
  user-select: none;
}

.tower-slot {
  cursor: pointer;
  &:hover rect { filter: brightness(1.3); }
}

.enemy {
  cursor: grab;
  &--dragging { cursor: grabbing; }
  &--focused circle { stroke: #ffff00; stroke-width: 3; }
}
</style>