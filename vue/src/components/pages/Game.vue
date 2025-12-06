<template>
  <div class="window">
    <div
      v-if="!gameState.isLoading"
      class="game"
      :style="{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover'
      }"
    >
      <button v-if="!isCraftingOpen" class="crafting-button" @click="() => openCrafting()"> ⚒️ </button>
      <SceneScreen
        :scene="list"
        :player-transform="playerTransform"
      />
      <MiniGameScreen
        v-if="isMinigameActive" 
        :difficulty="minigame.difficulty"
        :onComplete="minigame.onSuccess"
        :onClose="minigame.onClose"
      />
      <CraftingScreen v-if="isCraftingOpen" :onClose="() => closeCrafting()" @close="() => closeCrafting()"/>
      <Inventory class="inventory"/>
      <WinScreen v-if="gameState.state === 1"/>
    </div>
    <LoadScreen  v-if="gameState.isLoading"/>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import SceneScreen from "../screens/SceneScreen.vue"
import Inventory from "../Inventory.vue"
import LoadScreen from "@/components/screens/LoadScreen.vue"
import WinScreen from "@/components/screens/WinScreen.vue"
import MiniGameScreen from "@/components/screens/MiniGameScreen.vue"
import CraftingScreen from "@/components/screens/CraftingScreen.vue"
import { useStore } from "vuex"

const store = useStore()
const bg = computed(() => new URL(`/src/assets/backgrounds/${store.getters.getBackgroundName}`, import.meta.url).href)
const list = computed(() => store.getters.getSceneObjects)
const playerTransform = computed(() => store.getters.getPlayerTransform)
const gameState = computed(() => store.getters.getGameState)
const isMinigameActive = computed(() => store.getters.isMinigameActive)
const minigame = computed(() => store.getters.getMinigameData)
const isCraftingOpen = ref(false)
const closeCrafting = () => {isCraftingOpen.value = false}

onMounted(() => {
  store.dispatch("loadScenes")
})
const openCrafting = () => { isCraftingOpen.value = true}
</script>

<style scoped lang="less">
.window{
  position: relative;
  width: 900px;
  height: 540px;
  cursor: url('/cursors/default-cursor.png'), auto;
}
.inventory {
  position: absolute;
  inset-inline: 0;
  bottom: 20px;
  margin-inline: auto;
  width: fit-content;
}
.game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.crafting-button {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  border: 2px solid #f1c40f;
  color: #f1c40f;
  font-size: 24px;
  cursor: url('/cursors/pointer-cursor.png'), pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s ease;
  &:hover {
    background-color: rgba(241, 196, 15, 0.2);
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.95);
  }
}
</style>
