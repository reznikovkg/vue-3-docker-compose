<template>
  <div class="game-view">
    <div
      ref="gameZone"
      class="game-view__zone"
      tabindex="0"
      @click="handleClick"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
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
      <Tower
        v-for="tower in towers"
        :key="`tower${tower.position.x}${tower.position.y}`"
        :position="tower.position"
        :radius="tower.radius"
        :level="tower.level"
        :target="tower.target"
      />
      <GameOverModal />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import Enemy from '@/components/Enemy.vue';
import Tower from '@/components/Tower.vue';
import Zone from '@/components/Zone.vue';
import GameOverModal from '@/modules/GameOverModal.vue';
import { LONG_PRESS_DURATION } from '@/shared/constants';
import { Point } from '@/shared/models';

const gameZone = ref(null);
const longPressTimer = ref(null);
const cursorPoint = ref(null);

const store = useStore();
const route = useRoute();

const zones = computed(() => store.state.buildZones);
const towers = computed(() => store.state.towers);
const enemies = computed(() => store.state.enemies);

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
  store.dispatch('placeTowerAt', clickPoint);
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
}

.game-view__zone {
  position: relative;
  flex-grow: 1;
  background-color: rgba(0, 0, 20, 0.4);
  overflow: hidden;

  &:focus {
    outline: none;
  }
}
</style>
