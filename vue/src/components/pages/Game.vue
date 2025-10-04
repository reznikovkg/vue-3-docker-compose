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
      />
      <Inventory/>
      <WinScreen v-if="gameState.state === 1"/>
    </div>
    <LoadScreen  v-if="gameState.isLoading"/>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import SceneScreen from '../screens/SceneScreen.vue';
import Inventory from '../Inventory.vue';
import store from "@/store/index.js";
import LoadScreen from "@/components/screens/LoadScreen.vue";
import WinScreen from "@/components/screens/WinScreen.vue";

const bg = computed(() => new URL(`/src/assets/backgrounds/${store.getters.getBackgroundName}`, import.meta.url).href)
const list = computed(() => store.getters.getSceneObjects);
const playerTransform = computed(() => store.getters.getPlayerTransform);
const gameState = computed(() => store.getters.getGameState);


onMounted(() => {
  store.dispatch("loadScenes")
})
</script>

<style>
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
