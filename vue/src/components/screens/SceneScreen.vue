<template>
  <div class="scene" ref="sceneRef" :style="cursorStyle" @click="(event) => onSceneClick(event)">
    <svg class="zone">
      <polygon :points="areaPolygon" class="zone__polygon" />
    </svg>
    <div
      v-for="item in scene"
      class="area"
      :style="{ left: item.x + 'px', top: item.y + 'px'}"
      @mousemove="(event) => onMouseMove(event)"
      @mouseenter="() => onObjectHover(item)"
      @mouseleave="() => hideTooltip()"
      @click.stop="() => select(item)"
    >
      <component
        :id="item.id"
        :is="gameObjects[item.id.split('.')[0]]"
        :item="item"
        class="game-object"
      />
    </div>
    <Character
      class="area"
      :style="{ left: playerTransform.x + 'px', top: playerTransform.y + 'px'}"
    >
    </Character>
    <div
      v-if="tooltipVisible"
      class="tooltip"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup>
import {computed, defineProps, ref} from "vue"
import Door from "@/components/objects/Door.vue"
import Character from "@/components/Character.vue"
import Key from "@/components/items/Key.vue"
import Bonfire from "@/components/objects/Bonfire.vue"
import Chest from "@/components/objects/Chest.vue"
import { useStore } from "vuex"
import Gold from "@/components/items/Gold.vue"
import Stick from "@/components/items/Stick.vue"

const gameObjects = {
  "door" : Door,
  "key" : Key,
  "gold" : Gold,
  "stick" : Stick,
  "bonfire" : Bonfire,
  "chest" : Chest,
}

const cursorStyle = ref({})

const props = defineProps({
  scene: Array,
  playerTransform: Object,
})

const tooltipText = ref('')
const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const sceneRef = ref(null)
const store = useStore()
const areaPolygon = computed(() =>
  store.getters.getArea.map(p => `${p.x},${p.y}`).join(' ')
)

const showTooltip = (text) => {
  tooltipText.value = text
  tooltipVisible.value = true
}

const onObjectHover = (item) => {
  showTooltip(item.tooltip)
  cursorStyle.value.cursor = "url('/cursors/pointer-cursor.png'), pointer"
}

const hideTooltip = () => {
  tooltipVisible.value = false
  cursorStyle.value.cursor = "url('/cursors/default-cursor.png'), auto"
}

const onMouseMove = (event) => {
  if (!sceneRef.value) { 
    return
  }
  const rect = sceneRef.value.getBoundingClientRect()
  tooltipX.value = event.clientX - rect.left + 5
  tooltipY.value = event.clientY - rect.top - 25
}

const onSceneClick = (event) => {
  if (!sceneRef.value) {
    return
  }
  const rect = sceneRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  hideTooltip()
  store.dispatch("movePlayerToPoint", { x, y })
}
const select = (item) => {
  hideTooltip()
  store.dispatch('selectObject', item)
}
</script>

<style scoped lang="less">
.zone {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  &__polygon {
    fill: rgba(0, 255, 0, 0.15);
    stroke: rgba(0, 255, 0, 0.6);
    stroke-width: 1;
  }
}
.scene {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: inherit
}
.scene * {
  cursor: inherit !important;
}
.area {
  position: absolute;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.game-object{
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
.tooltip {
  position: absolute;
  padding: 4px 8px;
  background: rgba(0,0,0,0.8);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1000;
}
</style>
