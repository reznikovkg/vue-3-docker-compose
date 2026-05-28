<template>
  <div class="tower" :style="styles" @click="() => menuClick()">
    <div class="tower__level"> level: {{ level }} </div>
    <div class="tower__stats"> 
      <div> hp: {{ stats.hp }}</div>
      <div> damage: {{ stats.damage }}</div>
      <div> speed: {{ stats.speed }}</div>
      <div> radius: {{ stats.radius }}</div>
    </div>
    <div class="tower__menu" v-if="isOpenMenu">
      <button class="tower__menu__up" v-if="!isMaxLevel" @click.stop="() => upClick()">Улучшить</button>  
      <button class="tower__menu__del" @click.stop="() => delClick()">Удалить</button>  
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
    }
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
        top: `${this.y}%`
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
  width: 90px;
  height: 90px;
  background-color: rgb(15, 9, 105);
  border-radius: 0;

  &__level {
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    bottom: 90%;
    background-color: rgb(242, 241, 205);
    color: black;
    width: 55px;
    height: 20px;
    text-align: center;
    border-radius: 10%;
    line-height: 20px;
  }

  &__stats {
    position: absolute;
    transform: translate(-50%, -50%);
    left: 155%;
    width: 100px;
    height: 100px;
    top: 50%;
    background-color: rgb(242, 241, 205);
    color: black;
    text-align: center;
    border-radius: 5%;
  }

  &__menu {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

     &__up {
        position: absolute;
        background-color: rgb(44, 183, 60);
        color: rgb(255, 255, 255);
        top: 35%;
        left: 10%;
        border: none; 
        border-radius: 5%;
      }

      &__del {
        position: absolute;
        background-color: rgb(196, 13, 13);
        color: rgb(255, 255, 255);
        left: 215%;
        border: none;
        border-radius: 5%;
      }
    }
}
</style>