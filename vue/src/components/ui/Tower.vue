<template>
  <div class="tower" :style="styles" @click="() => menuClick()">
    <div class="tower__hp" :style="hpStyles"></div>
    <div class="tower__menu" v-if="isOpenMenu">
      <button class="tower__menu__up" v-if="!isMaxLevel" @click.stop="() => upClick()">⇧</button>  
      <button class="tower__menu__del" @click.stop="() => delClick()">✖</button>  
    </div>
  </div>
</template>

<script lang="ts">
import {characteristics} from '../../data/characteristics'
export default {
  name: 'Tower',
  props: {
    id: {
      type: [String, Number],
      default: 0
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    stats: {
      type: Object,
      default: {hp: 0, damage: 0, speed: 0, radius: 0}
    },
    color: {
      type: String,
      default: 'rgb(171, 17, 17)'
    },
  },
  emits: ['upgrade', 'delete'],
  data () {
    return {
      isOpenMenu: false
    }
  },
  computed: {
    styles () {
      return {
        left: `${this.x}%`,
        top: `${this.y}%`,
        backgroundColor: this.stats.color
      }
    },
    hpPercent() {
      return (this.stats.currentHp / this.stats.maxHp) * 100
    },
    hpStyles () {
      return {
        width: this.hpPercent + '%',
        backgroundColor: this.hpPercent > 50 ? 'rgb(27, 224, 17)' : 'rgb(224, 33, 23)'
      }
    },
    isMaxLevel () {
      const levelExists = characteristics.some(c => c.id === this.level + 1)
      return !levelExists
    }
  },
  methods: {
    menuClick () {
      this.isOpenMenu = !this.isOpenMenu
    },
    upClick () {
      this.$emit('upgrade', this.id)
    },
    delClick () {
      this.$emit('delete', this.id)
      this.isOpenMenu = false
    }
  }
}
</script>

<style scoped lang="scss">
.tower {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;

  &__hp {
    position: absolute;
    left: 0;
    top: -10px;
    height: 6px;
    transition: width 0.1s;
  }

  &__menu {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    
    &__up {
        transform: translate(-50%, -50%);
        position: absolute;
        background-color: rgb(54, 220, 46);
        top: 50%;
        left: 50%;
        border: none; 
        border-radius: 10%;
        font-size: 20px;
      }

      &__del {
        position: absolute;
        background-color: rgb(222, 35, 35);
        left: 110%;
        border: none;
        border-radius: 10%;
        font-size: 20px;
      }
    }
}
</style>