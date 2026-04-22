<template>
  <div class="tower" :style="styles" @click="() => menuClick()">
    <div class="tower__menu" v-if="isOpenMenu">
      <button class="tower__menu__up" v-if="!isMaxLevel" @click.stop="() => upClick()">⇧</button>  
      <button class="tower__menu__del" @click.stop="() => delClick()">✖</button>  
    </div>
  </div>
</template>

<script lang="ts">
import {characteristics} from '../../data/characteristics'
export default {
  name: 'tower',
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

  &__menu {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

     &__up {
        transform: translate(-50%, -50%);
        position: absolute;
        background-color: rgb(44, 183, 60);
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