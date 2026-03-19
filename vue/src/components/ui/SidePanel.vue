<template>
  <div class="panel">
    <div class="row">
      <b>$ {{ gold }}</b>
      <b>HP {{ lives }}</b>
    </div>

  <div>Выбор уровня</div>
    <button
        v-for="lvl in LEVELS" :key="lvl.id"
        :class="{ active: level.id === lvl.id }"
        @click="() => $store.dispatch('selectLevel', lvl)"> {{ lvl.number }} </button>

    <template v-if="selectedSlot">

      <template v-if="selectedTower">
        <div class="stats">
          <span>Тип: <b>{{ selectedTowerCfg.label }}</b></span>
          <span>Уровень: <b>{{ selectedTower.level }}/{{ selectedTowerCfg.levels.length }}</b></span>
          <span>Урон: <b>{{ selectedTower.damage }}</b></span>
          <span>Радиус: <b>{{ selectedTower.range }}</b></span>
          <span>Скорость: <b>{{ selectedTower.fireRate }}</b></span>
          <span>HP: <b>{{ selectedTower.hp }}</b></span>
        </div>

        <button
            :disabled="selectedTower.level >= selectedTowerCfg.levels.length || gold < upgradeCost"
            @click="() => $store.dispatch('upgradeTower', selectedSlot)">Улучшить (-{{ upgradeCost }}$)</button>

        <button @click="() => $store.dispatch('removeTower', selectedSlot)">Снести (+{{ selectedTowerCfg.refund }}$)</button>
      </template>

      <template v-else>
        <div>Построить:</div>
        <button
            v-for="(towerCfg, type) in TOWERS" :key="type"
            :disabled="gold < towerCfg.cost"
            :style="{ borderColor: towerCfg.color, color: towerCfg.color }"
            @click="() => $store.dispatch('placeTower', type)">{{ towerCfg.name }}  {{ towerCfg.cost }}$</button>
      </template>
    </template>

    <div>Спавн врагов</div>
    <button
        v-for="spawn in level.spawns" :key="spawn.hp"
        @click="() => $store.dispatch('spawnEnemy', spawn)">{{spawn.name}}</button>

    <template v-if="selectedEnemy">
      <div class="stats">
        <span>HP: <b>{{ selectedEnemy.hp }}/{{ selectedEnemy.maxHp }}</b></span>
        <span>Скорость: <b>{{ selectedEnemy.speed }}</b></span>
      </div>
      <button @click="() => $store.dispatch('removeEnemy', selectedEnemy.id)">Удалить</button>
    </template>
  </div>
</template>

<script>
import { LEVELS } from '@/levels'
import { TOWERS } from '@/towers.js'

export default {
  name: 'SidePanel',

  data() {
    return {
      LEVELS,
      TOWERS,
    }
  },

  computed: {
    gold() { return this.$store.state.gold },
    lives() { return this.$store.state.lives },
    level() { return this.$store.state.level },
    selectedSlot() { return this.$store.state.selectedSlot },
    selectedTower() { return this.$store.getters.selectedTower },
    selectedEnemy() {
      const id = this.$store.state.selectedEnemy
      return id ? this.$store.state.enemies[id] : null
    },
    selectedTowerCfg() {
      return this.selectedTower ? TOWERS[this.selectedTower.type] : null
    },
    upgradeCost() {
      if (!this.selectedTower || !this.selectedTowerCfg) return 0
      return this.selectedTowerCfg.upgradeCost[this.selectedTower.level - 1] || 0
    },
  },

  mounted() {
    window.addEventListener('keydown', this.onKey)
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
  },

  methods: {
    onKey(e) {
      const enemy = this.selectedEnemy
      if (!enemy) return
      const step = this.selectedEnemy.speed
      const map = {
        ArrowLeft:  { x: enemy.x - step, y: enemy.y },
        ArrowRight: { x: enemy.x + step, y: enemy.y },
        ArrowUp:    { x: enemy.x, y: enemy.y - step },
        ArrowDown:  { x: enemy.x, y: enemy.y + step },
      }
      if (!map[e.key]) return
      e.preventDefault()
      this.$store.dispatch('moveEnemy', { id: enemy.id, ...map[e.key] })
    },
  },
}
</script>

<style>
.panel {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background: #220135;
  font-size: 10px;
}

.panel button {
  padding: 5px;
  background: #09121e;
  border: 1px solid #22262b;
  border-radius: 5px;
  color: #e8eaf0;
  cursor: pointer;
  text-align: left;
  font-size: 10px;
}

.panel button:hover:not(:disabled) { background: #59646c}
.panel button.active { border-color: #facc15; color: #facc15 }

.row { display: flex; gap: 10px; align-items: center }

.stats {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 10px;
  color: #bfbfbf;
  padding: 4px 0;
}
</style>