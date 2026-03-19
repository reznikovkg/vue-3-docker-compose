<template>
  <svg
      ref="svg"
      :viewBox="`0 0 ${level.width} ${level.height}`"
      style="background: #0f1117;"
      @click="() => $store.dispatch('selectSlot', null)">
    <polyline
        :points="pathPoints"
        fill="none" stroke="#485902" stroke-width="30"/>
    <polyline
        :points="pathPoints"
        fill="none" stroke="yellow" stroke-width="2"
        stroke-dasharray="10"/>

    <TowerSlot v-for="slot in level.slots" :key="slot.id" :slot="slot" />
    <EnemyUnit v-for="enemy in enemyList" :key="enemy.id" :enemy="enemy"/>
  </svg>
</template>

<script>
import TowerSlot from './TowerSlot.vue'
import EnemyUnit from './EnemyUnit.vue'

export default {
  name: 'GameBoard',
  components: { TowerSlot, EnemyUnit },

  data() {
    return {
      timer: null,
    }
  },

  computed: {
    level() { return this.$store.state.level },
    pathPoints() { return this.$store.getters.pathPoints },
    enemyList() { return this.$store.getters.enemyList },
  },

  mounted() {
    this.timer = setInterval(() => this.$store.dispatch('tick'), 100)
  },

  beforeUnmount() {
    clearInterval(this.timer)
  },
}
</script>