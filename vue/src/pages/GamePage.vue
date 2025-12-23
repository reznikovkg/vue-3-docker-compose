<template>
  <div class="game-view">
    <GameControls
      v-model:place-mode="placeMode"
      v-model:barricade-type="barricadeType"
      :money="money"
      @spawn-ally="spawnAlly"
    />
    <div
      ref="gameZone"
      class="game-view__zone"
      tabindex="0"
      @click="handleClick"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
      @keydown="handleKeyDown"
    >
      <Zone v-for="(zone, index) in zones" :key="index" :points="zone.points" />
      <Enemy
        v-for="(enemy, index) in enemies"
        :key="`enemy${enemy.position.x}${enemy.position.y}${index}`"
        :position="enemy.position"
        :health="enemy.health"
        :max-health="enemy.maxHealth"
        :type="enemy.type"
      />
      <ShooterEnemy
        v-for="(shooter, index) in shooterEnemies"
        :key="`shooter${shooter.position.x}${shooter.position.y}${index}`"
        :position="shooter.position"
        :health="shooter.health"
        :max-health="shooter.maxHealth"
        :shooter-type="shooter.shooterType"
        :shoot-target="shooter.shootTarget"
        :shoot-radius="shooter.shootRadius"
      />
      <Ally
        v-for="(ally, index) in allies"
        :key="`ally${ally.position.x}${ally.position.y}${index}`"
        :position="ally.position"
        :health="ally.health"
        :max-health="ally.maxHealth"
        :ally-type="ally.allyType"
        :target="ally.target"
        :attack-radius="ally.attackRadius"
      />
      <Barricade
        v-for="(barricade, index) in barricades"
        :key="`barricade${barricade.position.x}${barricade.position.y}${index}`"
        :position="barricade.position"
        :health="barricade.health"
        :max-health="barricade.maxHealth"
        :barricade-type="barricade.barricadeType"
        :size="barricade.size"
        :width="barricade.width"
        :angle="barricade.angle"
      />
      <Tower
        v-for="tower in towers"
        :key="`tower${tower.position.x}${tower.position.y}`"
        :position="tower.position"
        :radius="tower.radius"
        :level="tower.level"
        :target="tower.target"
        :health="tower.health"
        :max-health="tower.maxHealth"
      />
      <ArtilleryStrike
        v-for="(strike, index) in artilleryStrikes"
        :key="`strike${strike.position.x}${strike.position.y}${index}`"
        :position="strike.position"
        :max-radius="strike.maxRadius"
        :elapsed="strike.elapsed"
        :duration="strike.duration"
      />
      <div
        v-if="barricadeFirstPoint && placeMode === 'barricade'"
        class="barricade-first-point"
        :style="{
          left: `${barricadeFirstPoint.x}px`,
          top: `${barricadeFirstPoint.y}px`,
        }"
      ></div>
      <GameOverModal />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import Ally from '@/components/Ally.vue';
import ArtilleryStrike from '@/components/ArtilleryStrike.vue';
import Barricade from '@/components/Barricade.vue';
import Enemy from '@/components/Enemy.vue';
import ShooterEnemy from '@/components/ShooterEnemy.vue';
import Tower from '@/components/Tower.vue';
import Zone from '@/components/Zone.vue';
import GameControls from '@/modules/GameControls.vue';
import GameOverModal from '@/modules/GameOverModal.vue';
import { LONG_PRESS_DURATION } from '@/shared/constants';
import { Point } from '@/shared/models';

const gameZone = ref(null);
const longPressTimer = ref(null);
const cursorPoint = ref(null);
const placeMode = ref('tower');
const barricadeType = ref('wooden');
const barricadeFirstPoint = ref(null);

const store = useStore();
const route = useRoute();

const zones = computed(() => store.getters.buildZones);
const towers = computed(() => store.getters.towers);
const enemies = computed(() => store.getters.enemies);
const shooterEnemies = computed(() => store.getters.shooterEnemies);
const allies = computed(() => store.getters.allies);
const barricades = computed(() => store.getters.barricades);
const artilleryStrikes = computed(() => store.getters.artilleryStrikes);
const money = computed(() => store.getters.money);

watch(
  () => route.params.id,
  (id) => {
    const parsedId = Number(id);
    if (!Number.isNaN(parsedId)) {
      store.dispatch('initLevel', parsedId);
    } else {
      store.dispatch('initLevel');
    }
  },
  { immediate: true }
);

const updateZoneSize = () => {
  if (!gameZone.value) return;
  const rect = gameZone.value.getBoundingClientRect();
  store.dispatch('setZoneSize', { width: rect.width, height: rect.height });
};

const onMouseDown = (event) => {
  if (!gameZone.value) return;
  const rect = gameZone.value.getBoundingClientRect();
  cursorPoint.value = new Point(
    event.clientX - rect.left,
    event.clientY - rect.top
  );

  if (placeMode.value === 'barricade' && barricadeFirstPoint.value) {
    return;
  }

  longPressTimer.value = setTimeout(() => {
    store.dispatch('deleteObjectAt', cursorPoint.value);
    longPressTimer.value = null;
  }, LONG_PRESS_DURATION);
};

const onMouseUp = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
};

const onMouseLeave = () => {
  onMouseUp();
};

const handleClick = (event) => {
  if (!gameZone.value) return;
  const rect = gameZone.value.getBoundingClientRect();
  const clickPoint = new Point(
    event.clientX - rect.left,
    event.clientY - rect.top
  );

  switch (placeMode.value) {
    case 'tower':
      store.dispatch('placeTowerAt', clickPoint);
      break;
    case 'barricade':
      if (!barricadeFirstPoint.value) {
        barricadeFirstPoint.value = clickPoint;
      } else {
        store.dispatch('placeBarricadeAt', {
          startPoint: barricadeFirstPoint.value,
          endPoint: clickPoint,
          barricadeType: barricadeType.value,
        });
        barricadeFirstPoint.value = null;
      }
      break;
    case 'artillery':
      store.dispatch('callArtilleryStrike', clickPoint);
      break;
  }
};

const spawnAlly = () => {
  store.dispatch('spawnAlly');
};

const handleKeyDown = (event) => {
  switch (event.key.toLowerCase()) {
    case 't':
      placeMode.value = 'tower';
      break;
    case 'b':
      placeMode.value = 'barricade';
      break;
    case 'a':
      placeMode.value = 'artillery';
      break;
    case 's':
      spawnAlly();
      break;
  }
};

onMounted(() => {
  updateZoneSize();
  window.addEventListener('resize', updateZoneSize);
  store.dispatch('startGameLoop');
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateZoneSize);
  store.dispatch('stopGameLoop');
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
  }
});
</script>

<style lang="scss">
.game-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 78px);
  inline-size: 100%;

  &__zone {
    position: relative;
    flex-grow: 1;
    background-color: rgba(0, 0, 20, 0.4);
    overflow: hidden;

    &:focus {
      outline: none;
    }
  }
}

.barricade-first-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: rgba(139, 90, 43, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
  animation: pulse-point 1s ease-in-out infinite;
}

@keyframes pulse-point {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.7;
  }
}
</style>
