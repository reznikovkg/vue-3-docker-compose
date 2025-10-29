<script setup lang="ts">
import InfoDisplay from '@/components/InfoDisplay.vue'
import FishingMinigame from '@/components/FishingMinigame.vue'
import Inventory from '@/components/Inventory.vue'
import MapView from '@/components/MapView.vue'
</script>

<template>
  <div class="game-container">
    <div class="menu-bar">
      <nav>
        <button>Рыбалка</button>
        <button>Карта</button>
        <button>Инвентарь</button>
        <button>Настройки</button>
      </nav>
    </div>
    <div class="main-content">
      <div class="info-display-area">
        <InfoDisplay />
      </div>
      <div class="game-area">
        <MapView />
        <div class="minigame-overlay">
          <FishingMinigame />
        </div>
      </div>
      <div class="inventory-area">
        <Inventory />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "menu"
    "main";
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #1a1a1a;
  overflow: hidden;
}

.menu-bar {
  grid-area: menu;
  background-color: #333;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-bar nav button {
  background-color: #555;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 0 5px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.menu-bar nav button:hover {
  background-color: #777;
}

.main-content {
  grid-area: main;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-areas:
    "info game inventory";
  gap: 10px;
  padding: 10px;
  overflow: hidden;
}

.info-display-area {
  grid-area: info;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
}

.game-area {
  grid-area: game;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.minigame-overlay {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.inventory-area {
  grid-area: inventory;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
}
</style>
