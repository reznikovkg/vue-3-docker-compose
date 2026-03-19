<template>
  <g :transform="`translate(${enemy.x}, ${enemy.y})`" @click.stop="() => $store.dispatch('selectEnemy', enemy.id)">
    <circle :r="16" :fill="hpColor" :stroke="isSelected ? '#facc15' : null"/>
    <text text-anchor="middle" y="30" font-size="10" fill="white">{{ enemy.hp }}</text>
  </g>
</template>

<script>
export default {
  name: 'EnemyUnit',

  props: {
    enemy: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isSelected() {
      return this.$store.state.selectedEnemy === this.enemy.id
    },
    hpRatio() {
      return this.enemy.maxHp > 0 ? this.enemy.hp / this.enemy.maxHp : 0
    },
    hpColor() {
      if (this.hpRatio > 0.6) return '#4ade80'
      if (this.hpRatio > 0.3) return '#facc15'
      return '#ef4444'
    },
  },
  methods: {}
}
</script>