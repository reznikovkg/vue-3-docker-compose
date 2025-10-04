<template>
  <div class="scene" ref="sceneRef">
    <div
      v-for="item in scene"
      class="area"
      :style="{ left: item.x + 'px', top: item.y + 'px'}"
      @mousemove="(event) => onMouseMove(event)"
      @mouseenter="() => showTooltip(item.tooltip)"
      @mouseleave="() => hideTooltip()"
    >
      <component
        :id="item.id"
        :is="gameObjects[item.id.split('.')[0]]" class="game-object"
        :item="item"
        @click="()=>select(item)"/>
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
import { defineProps, ref } from "vue"
import Door from "@/components/objects/Door.vue"
import Character from "@/components/Character.vue"
import Key from "@/components/items/Key.vue"
import Bonfire from "@/components/objects/Bonfire.vue"
import Chest from "@/components/objects/Chest.vue"
import { useStore } from "vuex"

const gameObjects = {
  "door" : Door,
  "key" : Key,
  "bonfire" : Bonfire,
  "chest" : Chest,
}

const props = defineProps({
  scene: Object,
  playerTransform: Object,
});
const tooltipText = ref('')
const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const sceneRef = ref(null)
const store = useStore()

const showTooltip = (text) => {
  tooltipText.value = text
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

const onMouseMove = (event) => {
  if (!sceneRef.value) return

  const rect = sceneRef.value.getBoundingClientRect()
  tooltipX.value = event.clientX - rect.left + 5
  tooltipY.value = event.clientY - rect.top - 25
}

const select = (item) => {
  hideTooltip()
  store.dispatch('selectObject', item)
}
</script>

<style scoped lang="less">
.scene {
  position: relative;
  width: 600px;
  height: 400px;
  margin-bottom: 20px;
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
  pointer-events: none; /* чтобы мышь не блокировала события */
  white-space: nowrap;
  z-index: 1000;
}
</style>
