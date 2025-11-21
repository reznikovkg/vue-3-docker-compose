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
      <SceneScreen
        :scene="list"
        :player-transform="playerTransform"
        @start-minigame="openMinigame"
      />
      <MiniGameScreen
        v-if="isMinigameActive && minigame.onSuccess && minigame.onClose"
        :difficulty="minigame.difficulty"
        :onComplete="minigame.onSuccess"
        :onClose="minigame.onClose"
      />
      <Inventory/>
      <WinScreen v-if="gameState.state === 1"/>
    </div>
    <LoadScreen  v-if="gameState.isLoading"/>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue"
import SceneScreen from "../screens/SceneScreen.vue"
import Inventory from "../Inventory.vue"
import LoadScreen from "@/components/screens/LoadScreen.vue"
import WinScreen from "@/components/screens/WinScreen.vue"
import MiniGameScreen from "@/components/screens/MiniGameScreen.vue"
import { useStore } from "vuex"

const store = useStore()
const bg = computed(() => new URL(`/src/assets/backgrounds/${store.getters.getBackgroundName}`, import.meta.url).href)
const list = computed(() => store.getters.getSceneObjects)
const playerTransform = computed(() => store.getters.getPlayerTransform)
const gameState = computed(() => store.getters.getGameState)
const isMinigameActive = computed(() => store.getters.isMinigameActive)
const minigame = computed(() => store.getters.getMinigameData)
const openMinigame = ({ difficulty, onSuccess, onClose }) => {
  console.log('openMinigame called with:', { difficulty, onSuccess, onClose });
  store.commit("START_MINIGAME", { difficulty, onSuccess, onClose })
  console.log('After commit, isMinigameActive:', store.getters.isMinigameActive);
}

onMounted(() => {
  store.dispatch("loadScenes")
})
</script>

<style scoped lang="less">
.window{
  position: relative;
  width: 900px;
  height: 540px;
}
.game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
